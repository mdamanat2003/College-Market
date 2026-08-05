import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  Alert,
  useWindowDimensions,
  Platform,
  Modal,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Navbar } from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useLostFoundStore } from '../../store/lostFoundStore';
import { useAuthStore } from '../../store/authStore';
import { COLORS, RADIUS, SPACING } from '../../theme/colors';
import { resolveImageUri } from '../../utils/imageUri';

const CATEGORIES = ['All', 'Electronics', 'Documents', 'Keys', 'Wallets', 'Bags', 'Others'];

const CATEGORY_MAP: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }> = {
  Electronics: { icon: 'hardware-chip-outline', color: '#38BDF8', label: 'Electronics' },
  Documents: { icon: 'document-text-outline', color: '#F59E0B', label: 'Documents' },
  Keys: { icon: 'key-outline', color: '#10B981', label: 'Keys' },
  Wallets: { icon: 'wallet-outline', color: '#EC4899', label: 'Wallets' },
  Bags: { icon: 'briefcase-outline', color: '#8B5CF6', label: 'Bags' },
  Others: { icon: 'cube-outline', color: '#94A3B8', label: 'Others' },
};

function formatTimeAgo(dateString: string) {
  if (!dateString) return 'Recently';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Recently';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const LostFoundCard = React.memo(({ 
  item, 
  user, 
  handleResolve, 
  onSelectImage,
  onOpenDetails
}: { 
  item: any;
  user: any;
  handleResolve: (id: string) => void;
  onSelectImage: (url: string, title: string) => void;
  onOpenDetails: (item: any) => void;
}) => {
  const [imgError, setImgError] = useState(false);
  const isResolved = item.status === 'Resolved';
  const isLost = item.type === 'Lost';
  const imageUri = useMemo(() => resolveImageUri(item.image), [item.image]);
  const categoryMeta = CATEGORY_MAP[item.category] || CATEGORY_MAP['Others'];

  const reporterId = typeof item.reporter === 'object' ? item.reporter?._id : item.reporter;
  const currentUserId = user?._id || user?.id;
  const isOwnerOrAdmin = (reporterId && currentUserId && String(reporterId) === String(currentUserId)) || user?.role === 'admin';

  return (
    <View testID="lost-found-card" style={[styles.itemCard, isResolved && styles.resolvedCard]}>
      {/* Top Image & Hero Section */}
      <View style={styles.imageContainer}>
        {imageUri && !imgError ? (
          <Pressable 
            onPress={() => onSelectImage(imageUri, item.title)} 
            style={({ hovered }: any) => [
              styles.imageWrapper, 
              hovered && Platform.OS === 'web' ? { transform: [{ scale: 1.03 }] } : null
            ]}
          >
            <Image 
              source={{ uri: imageUri }} 
              style={styles.itemImage}
              onError={() => setImgError(true)}
              resizeMode="cover"
            />
            <View style={styles.imageGradientOverlay} />
            <View style={styles.zoomBadge}>
              <Ionicons name="expand-outline" size={14} color="#FFFFFF" />
            </View>
          </Pressable>
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: `${categoryMeta.color}10` }]}>
            <View style={[styles.categoryIconCircle, { backgroundColor: `${categoryMeta.color}25` }]}>
              <Ionicons name={categoryMeta.icon} size={36} color={categoryMeta.color} />
            </View>
            <Text style={styles.placeholderLabel}>No Photo Provided</Text>
          </View>
        )}

        {/* Category Pill - Top Left */}
        <View style={styles.categoryBadge}>
          <Ionicons name={categoryMeta.icon} size={12} color={categoryMeta.color} style={{ marginRight: 4 }} />
          <Text style={[styles.categoryBadgeText, { color: categoryMeta.color }]}>{item.category || 'General'}</Text>
        </View>

        {/* Type Badge - Top Right */}
        <View style={[
          styles.statusBadge, 
          isResolved 
            ? styles.statusResolved 
            : isLost 
              ? styles.statusLost 
              : styles.statusFound
        ]}>
          <View style={[
            styles.statusDot, 
            { backgroundColor: isResolved ? '#94A3B8' : isLost ? '#EF4444' : '#10B981' }
          ]} />
          <Text style={[
            styles.statusText,
            { color: isResolved ? '#94A3B8' : isLost ? '#FCA5A5' : '#6EE7B7' }
          ]}>
            {isResolved ? 'RESOLVED' : isLost ? 'LOST' : 'FOUND'}
          </Text>
        </View>
      </View>

      {/* Card Info Body */}
      <View style={styles.itemInfo}>
        <View style={styles.headerInfoRow}>
          <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.timeAgoText}>{formatTimeAgo(item.createdAt || item.date)}</Text>
        </View>

        <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>

        <View style={styles.locationPill}>
          <Ionicons name="location" size={13} color="#38BDF8" style={{ marginRight: 4 }} />
          <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
        </View>

        {/* Footer & Actions */}
        <View style={styles.itemFooter}>
          <View style={styles.reporterBox}>
            <View style={styles.reporterAvatar}>
              <Text style={styles.reporterInitial}>
                {(item.reporter?.name || 'Student').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.reporterText} numberOfLines={1}>{item.reporter?.name || 'Campus Student'}</Text>
              <Text style={styles.reporterSubtext}>Verified Peer</Text>
            </View>
          </View>

          <View style={styles.cardActionsRow}>
            <TouchableOpacity 
              style={styles.detailsBtn} 
              onPress={() => onOpenDetails(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="eye-outline" size={14} color="#F8FAFC" style={{ marginRight: 4 }} />
              <Text style={styles.detailsBtnText}>Details</Text>
            </TouchableOpacity>

            {isOwnerOrAdmin && item.status === 'Active' && (
              <TouchableOpacity
                style={styles.resolveBtn}
                onPress={() => handleResolve(item._id)}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle" size={14} color="#09090b" style={{ marginRight: 4 }} />
                <Text style={styles.resolveBtnText}>Resolve</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </View>
  );
});

export default function LostFoundList() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, fetchItems, isLoading, updateStatus, error } = useLostFoundStore();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList>(null);

  const [activeTab, setActiveTab] = useState<'All' | 'Lost' | 'Found'>('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchInput, setSearchInput] = useState('');

  // Modal States
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
  const [selectedDetailItem, setSelectedDetailItem] = useState<any | null>(null);

  const numColumns = width >= 1150 ? 3 : width >= 720 ? 2 : 1;
  const CARD_GAP = 20;

  useEffect(() => {
    fetchItems({ type: activeTab === 'All' ? undefined : activeTab, category: selectedCategory, search: searchInput });
  }, [activeTab, selectedCategory, searchInput]);

  const filteredItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return items;
  }, [items]);

  const handleBackToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleResolve = React.useCallback(async (id: string) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Have you found/returned this item? Mark as resolved will update this report status.');
      if (!confirmed) return;

      const success = await updateStatus(id, 'Resolved');
      if (success) {
        window.alert('Item has been marked as resolved!');
      } else {
        const errorMessage = useLostFoundStore.getState().error;
        window.alert(errorMessage || 'Could not update item status.');
      }
      return;
    }

    Alert.alert(
      'Confirm Resolve',
      'Have you found/returned this item? Mark as resolved will archive this report.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Mark Resolved', 
          onPress: async () => {
            const success = await updateStatus(id, 'Resolved');
            if (success) {
              Alert.alert('Resolved!', 'Item has been marked as resolved.');
            } else {
              const errorMessage = useLostFoundStore.getState().error;
              Alert.alert('Update Failed', errorMessage || 'Could not update item status.');
            }
          } 
        }
      ]
    );
  }, [updateStatus]);

  const handleSelectImage = React.useCallback((url: string, title: string) => {
    setLightboxImage({ url, title });
  }, []);

  const handleOpenDetails = React.useCallback((item: any) => {
    setSelectedDetailItem(item);
  }, []);

  const renderItem = React.useCallback(({ item }: { item: any }) => (
    <View style={{ flex: 1, margin: CARD_GAP / 2 }}>
      <LostFoundCard 
        item={item} 
        user={user} 
        handleResolve={handleResolve} 
        onSelectImage={handleSelectImage}
        onOpenDetails={handleOpenDetails}
      />
    </View>
  ), [user, handleResolve, handleSelectImage, handleOpenDetails]);

  const keyExtractor = React.useCallback((item: any) => item._id, []);

  const isPhone = width <= 560;

  const renderHeader = React.useCallback(() => (
    <View style={[styles.headerContainer, isPhone && styles.phoneHeaderContainer]}>
      {/* --- Header & Action Button --- */}
      <View style={[styles.headerSection, isPhone && styles.phoneHeaderSection]}>
        <View style={styles.titleBox}>
          <Text style={styles.kicker}>Campus Community</Text>
          <Text style={[styles.pageTitle, isPhone && styles.phonePageTitle]}>Lost & Found Desk</Text>
          <Text style={styles.subtitle}>
            Report lost belongings or help return found items to fellow students across your campus.
          </Text>
        </View>

        <TouchableOpacity
          testID="report-item-btn"
          style={[styles.reportBtn, isPhone && styles.phoneReportBtn]}
          onPress={() => router.push('/lost-found/report')}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle" size={20} color="#09090b" />
          <Text style={styles.reportBtnText}>Report New Item</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={18} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* --- Tab Switcher (All, Lost, Found) --- */}
      <View style={styles.tabCard}>
        {(['All', 'Lost', 'Found'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {isPhone
                ? (tab === 'All' ? 'All' : tab === 'Lost' ? '🔴 Lost' : '🟢 Found')
                : (tab === 'All' ? 'All Items' : tab === 'Lost' ? '🔴 Lost Possessions' : '🟢 Found Items')
              }
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* --- Search Bar --- */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title, description, or location (e.g. Library, Wallet, ID)..."
            placeholderTextColor="#64748B"
            value={searchInput}
            onChangeText={setSearchInput}
          />
          {isLoading ? (
            <ActivityIndicator size="small" color="#38BDF8" style={{ marginLeft: 6 }} />
          ) : searchInput ? (
            <TouchableOpacity onPress={() => setSearchInput('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* --- Categories Scroll --- */}
      <View style={styles.categoryCard}>
        <Text style={styles.categoryGroupTitle}>FILTER BY CATEGORY</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {CATEGORIES.map((cat) => {
            const meta = CATEGORY_MAP[cat];
            return (
              <TouchableOpacity
                key={cat}
                testID="category-chip"
                style={[styles.chip, selectedCategory === cat && styles.activeChip]}
                onPress={() => setSelectedCategory(cat)}
                activeOpacity={0.75}
              >
                {meta && (
                  <Ionicons 
                    name={meta.icon} 
                    size={14} 
                    color={selectedCategory === cat ? '#09090b' : '#94A3B8'} 
                    style={{ marginRight: 6 }} 
                  />
                )}
                <Text style={[styles.chipText, selectedCategory === cat && styles.activeChipText]}>{cat}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  ), [error, activeTab, searchInput, isLoading, selectedCategory, router, isPhone]);

  return (
    <View style={styles.container}>
      <Navbar />

      <View style={styles.mainContent}>
        <FlatList
          ref={listRef}
          style={{ flex: 1, width: '100%' }}
          key={numColumns}
          data={filteredItems}
          keyExtractor={keyExtractor}
          numColumns={numColumns}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          columnWrapperStyle={numColumns > 1 ? [styles.row, filteredItems.length <= 2 && styles.sparseRow] : undefined}
          showsVerticalScrollIndicator={true}
          removeClippedSubviews={true}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          ListEmptyComponent={
            isLoading && items.length === 0 ? (
              <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#38BDF8" />
                <Text style={{ color: '#94A3B8', marginTop: 12, fontSize: 14 }}>Loading Lost & Found items...</Text>
              </View>
            ) : (
              <View style={[styles.emptyState, { maxWidth: 1440, alignSelf: 'center', width: '100%' }]}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="search-outline" size={42} color="#38BDF8" />
                </View>
                <Text style={styles.emptyTitle}>No Items Found</Text>
                <Text style={styles.emptyText}>No lost or found reports match your search criteria.</Text>
                <TouchableOpacity 
                  style={styles.emptyResetBtn} 
                  onPress={() => { setActiveTab('All'); setSelectedCategory('All'); setSearchInput(''); }}
                >
                  <Text style={styles.emptyResetText}>Reset All Filters</Text>
                </TouchableOpacity>
              </View>
            )
          }
          ListFooterComponent={
            <View style={styles.footerWrapper}>
              <Footer onBackToTop={handleBackToTop} />
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      </View>

      {/* --- Image Lightbox Modal --- */}
      <Modal
        visible={!!lightboxImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLightboxImage(null)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setLightboxImage(null)}>
          <View style={styles.lightboxCard}>
            <View style={styles.lightboxHeader}>
              <Text style={styles.lightboxTitle} numberOfLines={1}>{lightboxImage?.title || 'Item Image'}</Text>
              <TouchableOpacity onPress={() => setLightboxImage(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            {lightboxImage?.url && (
              <Image 
                source={{ uri: lightboxImage.url }} 
                style={styles.lightboxImage} 
                resizeMode="contain" 
              />
            )}
          </View>
        </Pressable>
      </Modal>

      {/* --- Item Details & Contact Modal --- */}
      <Modal
        visible={!!selectedDetailItem}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedDetailItem(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.detailsModalCard}>
            <View style={styles.detailsModalHeader}>
              <View style={styles.detailsModalHeaderLeft}>
                <View style={[
                  styles.statusBadge, 
                  selectedDetailItem?.type === 'Lost' ? styles.statusLost : styles.statusFound
                ]}>
                  <Text style={[
                    styles.statusText,
                    { color: selectedDetailItem?.type === 'Lost' ? '#FCA5A5' : '#6EE7B7' }
                  ]}>
                    {selectedDetailItem?.type === 'Lost' ? '🔴 LOST ITEM' : '🟢 FOUND ITEM'}
                  </Text>
                </View>
                <Text style={styles.detailsCategoryText}>{selectedDetailItem?.category || 'General'}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedDetailItem(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.detailsModalContent}>
              {selectedDetailItem?.image && resolveImageUri(selectedDetailItem.image) && (
                <View style={styles.detailsImageContainer}>
                  <Image 
                    source={{ uri: resolveImageUri(selectedDetailItem.image)! }} 
                    style={styles.detailsModalImage} 
                    resizeMode="cover"
                  />
                </View>
              )}

              <Text style={styles.detailsModalTitle}>{selectedDetailItem?.title}</Text>
              
              <View style={styles.detailsMetaRow}>
                <Ionicons name="location" size={16} color="#38BDF8" />
                <Text style={styles.detailsLocationText}>{selectedDetailItem?.location}</Text>
              </View>

              <View style={styles.detailsSection}>
                <Text style={styles.detailsSectionLabel}>Description</Text>
                <Text style={styles.detailsModalDesc}>{selectedDetailItem?.description}</Text>
              </View>

              <View style={styles.detailsReporterCard}>
                <View style={styles.reporterAvatarLarge}>
                  <Text style={styles.reporterInitialLarge}>
                    {(selectedDetailItem?.reporter?.name || 'S').charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailsReporterName}>{selectedDetailItem?.reporter?.name || 'Campus Student'}</Text>
                  <Text style={styles.detailsReporterEmail}>{selectedDetailItem?.reporter?.email || 'Contact via Messages'}</Text>
                  {selectedDetailItem?.reporter?.phone && (
                    <Text style={styles.detailsReporterPhone}>📞 {selectedDetailItem.reporter.phone}</Text>
                  )}
                </View>
              </View>

              <View style={styles.detailsModalActions}>
                <TouchableOpacity 
                  style={styles.contactMsgBtn} 
                  onPress={() => {
                    setSelectedDetailItem(null);
                    router.push('/messages' as any);
                  }}
                >
                  <Ionicons name="chatbubbles" size={18} color="#09090b" style={{ marginRight: 6 }} />
                  <Text style={styles.contactMsgBtnText}>Send Message on Ooplabdh</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mainContent: {
    flex: 1,
    width: '100%',
  },
  headerContainer: {
    width: '100%',
    maxWidth: 1440,
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingTop: 24,
  },
  phoneHeaderContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  row: {
    width: '100%',
    maxWidth: 1440,
    alignSelf: 'center',
    paddingHorizontal: 28,
  },
  sparseRow: {
    justifyContent: 'center',
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 20,
  },
  phoneHeaderSection: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 14,
    marginBottom: 16,
  },
  titleBox: {
    flex: 1,
    maxWidth: 850,
    gap: 6,
  },
  kicker: {
    fontSize: 14,
    fontWeight: '800',
    color: '#38BDF8',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  pageTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  phonePageTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 14.5,
    lineHeight: 22,
    color: '#94A3B8',
    marginTop: 2,
  },
  reportBtn: {
    flexDirection: 'row',
    backgroundColor: '#38BDF8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    alignItems: 'center',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 4,
  },
  phoneReportBtn: {
    justifyContent: 'center',
    width: '100%',
  },
  reportBtnText: {
    color: '#09090b',
    fontWeight: '800',
    fontSize: 14.5,
  },
  tabCard: {
    flexDirection: 'row',
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 6,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#38BDF8',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  tabText: {
    fontWeight: '700',
    color: '#94A3B8',
    fontSize: 14,
  },
  activeTabText: {
    color: '#09090b',
    fontWeight: '800',
  },
  searchSection: {
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 39, 42, 0.65)',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 14,
    color: '#F8FAFC',
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  categoryCard: {
    backgroundColor: '#18181b',
    padding: 18,
    borderRadius: 18,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryGroupTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  chipScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.round,
    backgroundColor: 'rgba(39, 39, 42, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  activeChip: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  chipText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  activeChipText: {
    color: '#09090b',
    fontWeight: '800',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 0,
  },

  /* --- CARD STYLES --- */
  itemCard: {
    backgroundColor: '#18181b',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'space-between',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 5,
  },
  resolvedCard: {
    opacity: 0.65,
  },
  imageContainer: {
    width: '100%',
    height: 190,
    position: 'relative',
    backgroundColor: '#09090b',
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  imageGradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'transparent',
  },
  zoomBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  categoryIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLost: {
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  statusFound: {
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  statusResolved: {
    backgroundColor: 'rgba(148, 163, 184, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.4)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  itemInfo: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
    gap: 8,
  },
  headerInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  itemTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#F8FAFC',
    flex: 1,
  },
  timeAgoText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  itemDesc: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 19,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    marginTop: 2,
  },
  locationText: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: '600',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    gap: 8,
  },
  reporterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  reporterAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  reporterInitial: {
    fontSize: 13,
    fontWeight: '800',
    color: '#38BDF8',
  },
  reporterText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  reporterSubtext: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  detailsBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  resolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  resolveBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#09090b',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    padding: 24,
    gap: 12,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 400,
  },
  emptyResetBtn: {
    marginTop: 8,
    backgroundColor: '#38BDF8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyResetText: {
    color: '#09090b',
    fontWeight: '700',
    fontSize: 13,
  },
  footerWrapper: {
    marginTop: 60,
    width: '100%',
    alignSelf: 'stretch',
  },

  /* --- MODAL STYLES --- */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  lightboxCard: {
    width: '100%',
    maxWidth: 800,
    maxHeight: '85%',
    backgroundColor: '#18181b',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  lightboxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  lightboxTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    flex: 1,
    marginRight: 10,
  },
  modalCloseBtn: {
    padding: 4,
  },
  lightboxImage: {
    width: '100%',
    height: 450,
    backgroundColor: '#000',
  },

  /* Details Modal */
  detailsModalCard: {
    width: '100%',
    maxWidth: 600,
    maxHeight: '85%',
    backgroundColor: '#18181b',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  detailsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  detailsModalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailsCategoryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#38BDF8',
  },
  detailsModalContent: {
    padding: 20,
    gap: 16,
  },
  detailsImageContainer: {
    width: '100%',
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  detailsModalImage: {
    width: '100%',
    height: '100%',
  },
  detailsModalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  detailsMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailsLocationText: {
    fontSize: 14,
    color: '#38BDF8',
    fontWeight: '600',
  },
  detailsSection: {
    gap: 6,
    marginTop: 4,
  },
  detailsSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  detailsModalDesc: {
    fontSize: 14.5,
    color: '#CBD5E1',
    lineHeight: 22,
  },
  detailsReporterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 39, 42, 0.65)',
    padding: 14,
    borderRadius: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 8,
  },
  reporterAvatarLarge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  reporterInitialLarge: {
    fontSize: 18,
    fontWeight: '800',
    color: '#38BDF8',
  },
  detailsReporterName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  detailsReporterEmail: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 1,
  },
  detailsReporterPhone: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 2,
  },
  detailsModalActions: {
    marginTop: 8,
  },
  contactMsgBtn: {
    flexDirection: 'row',
    backgroundColor: '#38BDF8',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactMsgBtnText: {
    color: '#09090b',
    fontSize: 14.5,
    fontWeight: '800',
  },
});