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
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Navbar } from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useLostFoundStore } from '../../store/lostFoundStore';
import { useAuthStore } from '../../store/authStore';
import { COLORS, RADIUS, SPACING } from '../../theme/colors';

const CATEGORIES = ['All', 'Electronics', 'Documents', 'Keys', 'Wallets', 'Bags', 'Others'];

const LostFoundCard = React.memo(({ item, user, handleResolve }: { item: any, user: any, handleResolve: (id: string) => void }) => {
  const isResolved = item.status === 'Resolved';

  return (
    <View testID="lost-found-card" style={[styles.itemCard, isResolved && styles.resolvedCard]}>
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.itemImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="search" size={36} color="#94A3B8" />
          </View>
        )}
        <View style={[styles.statusBadge, isResolved ? styles.statusResolved : styles.statusActive]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
        
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color="#94A3B8" />
          <Text style={styles.metaText} numberOfLines={1}>{item.location}</Text>
        </View>

        <View style={styles.itemFooter}>
          <View style={styles.reporterBox}>
            <View style={styles.reporterAvatar}>
              <Text style={styles.reporterInitial}>{(item.reporter?.name || 'U').charAt(0).toUpperCase()}</Text>
            </View>
            <Text style={styles.reporterText} numberOfLines={1}>{item.reporter?.name || 'Student'}</Text>
          </View>

          {item.reporter?._id === user?._id && item.status === 'Active' && (
            <TouchableOpacity 
              style={styles.resolveBtn}
              onPress={() => handleResolve(item._id)}
              activeOpacity={0.8}
            >
              <Ionicons name="checkmark-circle-outline" size={14} color="#09090b" style={{ marginRight: 4 }} />
              <Text style={styles.resolveBtnText}>Mark Resolved</Text>
            </TouchableOpacity>
          )}
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
  
  const [activeTab, setActiveTab] = useState<'Lost' | 'Found'>('Lost');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchInput, setSearchInput] = useState('');

  const numColumns = width >= 1150 ? 3 : width >= 720 ? 2 : 1;
  const CARD_GAP = 20;

  useEffect(() => {
    fetchItems({ type: activeTab, category: selectedCategory, search: searchInput });
  }, [activeTab, selectedCategory, searchInput]);

  const filteredItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return items;
  }, [items]);

  const handleBackToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleResolve = React.useCallback(async (id: string) => {
    const success = await updateStatus(id, 'Resolved');
    if (success) {
      Alert.alert('Success', 'Item marked as resolved!');
    } else {
      const errorMessage = useLostFoundStore.getState().error;
      Alert.alert('Update Failed', errorMessage || 'Something went wrong while updating status.');
    }
  }, [updateStatus]);

  const renderItem = React.useCallback(({ item }: { item: any }) => (
    <View style={{ flex: 1, margin: CARD_GAP / 2 }}>
      <LostFoundCard item={item} user={user} handleResolve={handleResolve} />
    </View>
  ), [user, handleResolve]);

  const keyExtractor = React.useCallback((item: any) => item._id, []);

  const renderHeader = React.useCallback(() => (
    <View style={styles.headerContainer}>
      {/* --- Header & Action Button --- */}
      <View style={styles.headerSection}>
        <View style={styles.titleBox}>
          <Text style={styles.kicker}>Campus Community</Text>
          <Text style={styles.pageTitle}>Lost & Found Desk</Text>
          <Text style={styles.subtitle}>
            Report lost possessions or help return found items to fellow students across campus.
          </Text>
        </View>

        <TouchableOpacity 
          testID="report-item-btn"
          style={styles.reportBtn} 
          onPress={() => router.push('/lost-found/report')}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={18} color="#09090b" />
          <Text style={styles.reportBtnText}>Report Item</Text>
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
        <View style={styles.tabBar}>
          {(['All', 'Lost', 'Found'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab === 'All' ? 'All Listed Items' : tab === 'Lost' ? '🔴 Lost Items' : '🟢 Found Items'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* --- Search Bar --- */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search lost or found items by keyword, location..."
            placeholderTextColor="#CBD5E1"
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
        <Text style={styles.categoryGroupTitle}>CATEGORIES</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity 
              key={cat}
              testID="category-chip"
              style={[styles.chip, selectedCategory === cat && styles.activeChip]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.75}
            >
              <Text style={[styles.chipText, selectedCategory === cat && styles.activeChipText]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  ), [error, activeTab, searchInput, isLoading, selectedCategory, router]);

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
              </View>
            ) : (
              <View style={[styles.emptyState, { maxWidth: 1440, alignSelf: 'center', width: '100%' }]}>
                <Ionicons name="search-outline" size={52} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>No Items Reported</Text>
                <Text style={styles.emptyText}>No items found matching your filter criteria.</Text>
              </View>
            }
            ListFooterComponent={
              <View style={styles.footerWrapper}>
                <Footer onBackToTop={handleBackToTop} />
              </View>
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
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
  titleBox: {
    flex: 1,
    maxWidth: 850,
    gap: 6,
  },
  kicker: {
    fontSize: 15.5,
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
    paddingVertical: 11,
    borderRadius: 12,
    gap: 8,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 16px rgba(56, 189, 248, 0.4)',
      } as any,
    }),
  },
  reportBtnText: {
    color: '#09090b',
    fontWeight: '800',
    fontSize: 14,
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
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(56, 189, 248, 0.4)',
      } as any,
    }),
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
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: '#F8FAFC',
    fontWeight: '500',
    backgroundColor: 'transparent',
    borderWidth: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
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
    marginBottom: 10,
  },
  chipScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 18,
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
  itemCard: {
    backgroundColor: '#18181b',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'space-between',
    height: '100%',
    ...Platform.select({
      web: {
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
      } as any,
    }),
  },
  resolvedCard: {
    opacity: 0.6,
  },
  imageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#09090b',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 39, 42, 0.5)',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  statusResolved: {
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.4)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  itemInfo: {
    padding: 16,
    gap: 8,
    flex: 1,
    justifyContent: 'space-between',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  itemDesc: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  reporterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  reporterAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  reporterInitial: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
  },
  reporterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  resolveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#38BDF8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resolveBtnText: {
    fontSize: 11,
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
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
  },
  footerWrapper: {
    marginTop: 60,
    width: '100%',
    alignSelf: 'stretch',
  },
});