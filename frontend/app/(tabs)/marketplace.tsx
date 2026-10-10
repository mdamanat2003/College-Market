import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import Footer from '../../components/layout/Footer';
import { Navbar } from '../../components/layout/Navbar';
import { ProductCard } from '../../components/cards/ProductCard';
import { useProductStore } from '../../store/productStore';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { COLLEGES } from '../../constants/colleges';
import { COLORS, RADIUS } from '../../theme/colors';

const VISUAL_CATEGORIES = [
  { id: 'All', label: 'All Items', icon: 'grid-outline', countLabel: 'All campus gear', color: '#38BDF8' },
  { id: 'Books', label: 'Books & PYQs', icon: 'book-outline', countLabel: 'Textbooks, Notes', color: '#818CF8' },
  { id: 'Electronics', label: 'Tech & Gadgets', icon: 'laptop-outline', countLabel: 'Calculators, Audio', color: '#34D399' },
  { id: 'Vehicles', label: 'Cycles & Rides', icon: 'bicycle-outline', countLabel: 'Hostel cycles', color: '#F472B6' },
  { id: 'Furniture', label: 'Hostel & Dorm', icon: 'bed-outline', countLabel: 'Mattresses, Tables', color: '#FBBF24' },
  { id: 'Others', label: 'Lab & Tools', icon: 'flask-outline', countLabel: 'Coats, Drafters', color: '#A78BFA' },
];

export default function MarketplaceHome() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { products, fetchProducts, isLoading, searchQuery } = useProductStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeCollege, setActiveCollege] = useState<string>(user?.college || 'All Colleges');
  const [isCollegeModalOpen, setIsCollegeModalOpen] = useState(false);
  const [collegeSearch, setCollegeSearch] = useState('');
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<any>>(null);

  const isPhone = width <= 560;
  const numColumns = width >= 1150 ? 4 : width >= 820 ? 3 : width >= 560 ? 2 : 1;
  const H_PADDING = isPhone ? 16 : 28 * 2;
  const CARD_GAP = isPhone ? 16 : 24;
  const containerMaxWidth = 1440;
  const effectiveWidth = Math.min(width, containerMaxWidth);
  const cardWidth = numColumns === 1
    ? Math.min(effectiveWidth - H_PADDING, 480)
    : Math.floor((effectiveWidth - H_PADDING - (CARD_GAP * (numColumns - 1))) / numColumns);

  const filteredColleges = useMemo(() => {
    if (!collegeSearch.trim()) return ['All Colleges', ...COLLEGES];
    const q = collegeSearch.toLowerCase().trim();
    const matches = COLLEGES.filter((c) => c.toLowerCase().includes(q));
    return ['All Colleges', ...matches];
  }, [collegeSearch]);

  const handleBackToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const renderItem = React.useCallback(({ item }: { item: any }) => (
    <View style={[
      styles.cardWrapper,
      {
        width: cardWidth,
        marginBottom: CARD_GAP,
      }
    ]}>
      <ProductCard product={item} />
    </View>
  ), [cardWidth, CARD_GAP]);

  const keyExtractor = React.useCallback((item: any) => item._id, []);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchProducts(activeCategory, searchQuery, activeCollege);
    } finally {
      setRefreshing(false);
    }
  }, [activeCategory, searchQuery, activeCollege, fetchProducts]);

  useEffect(() => {
    fetchProducts(activeCategory, searchQuery, activeCollege);
  }, [activeCategory, activeCollege, searchQuery, fetchProducts]);

  const isSparse = products.length > 0 && products.length <= 2;

  // Header Component containing Hero, Categories & College Filter
  const renderListHeader = () => (
    <View style={styles.headerWrapper}>
      {/* 1. Account verification warning (if pending) */}
      {user && !user.isVerified && (
        <View style={styles.verificationBanner}>
          <Ionicons name="information-circle" size={18} color="#F59E0B" />
          <Text style={styles.verificationBannerText}>
            Your student verification is pending. An admin is reviewing your College ID.
          </Text>
        </View>
      )}

      {/* 2. Modern E-Commerce Hero Section */}
      <View style={[styles.heroCard, isPhone && styles.phoneHeroCard]}>
        <View style={styles.heroBackgroundGlow} />

        <View style={styles.heroContent}>
          {/* Badge Row */}
          <View style={styles.heroBadgeRow}>
            <View style={styles.heroBadge}>
              <Ionicons name="shield-checkmark" size={13} color="#38BDF8" />
              <Text style={styles.heroBadgeText}>Verified Campus Network</Text>
            </View>
            <View style={styles.heroLivePill}>
              <View style={styles.heroLiveDot} />
              <Text style={styles.heroLiveText}>0% Platform Commission</Text>
            </View>
          </View>

          {/* Headline */}
          <Text style={[styles.heroHeading, isPhone && styles.phoneHeroHeading]}>
            Buy, Sell & Trade Gear With <Text style={styles.heroHighlight}>College Peers.</Text>
          </Text>

          <Text style={[styles.heroSubheading, isPhone && styles.phoneHeroSubheading]}>
            Pre-owned textbooks, scientific calculators, hostel cycles, and verified semester question papers — traded directly within your campus.
          </Text>

          {/* Action Buttons */}
          <View style={[styles.heroActionRow, isPhone && styles.phoneHeroActionRow]}>
            <TouchableOpacity
              style={styles.heroPrimaryBtn}
              onPress={() => router.push(user ? '/add-product' : ('/(auth)/login?redirect=/add-product' as any))}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle" size={18} color="#09090b" />
              <Text style={styles.heroPrimaryBtnText}>Sell College Gear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.heroSecondaryBtn}
              onPress={() => router.push('/academic')}
              activeOpacity={0.85}
            >
              <Ionicons name="document-text-outline" size={17} color="#38BDF8" />
              <Text style={styles.heroSecondaryBtnText}>PYQs & Exam Notes</Text>
              <Ionicons name="arrow-forward" size={14} color="#38BDF8" />
            </TouchableOpacity>
          </View>

          {/* Trust Highlights */}
          <View style={[styles.heroTrustBar, isPhone && styles.phoneHeroTrustBar]}>
            <View style={styles.trustItem}>
              <Ionicons name="people-outline" size={15} color="#94A3B8" />
              <Text style={styles.trustText}>Hostel Peer Trading</Text>
            </View>
            <View style={styles.trustDot} />
            <View style={styles.trustItem}>
              <Ionicons name="chatbubbles-outline" size={15} color="#94A3B8" />
              <Text style={styles.trustText}>Direct In-App Chat</Text>
            </View>
            <View style={styles.trustDot} />
            <View style={styles.trustItem}>
              <Ionicons name="lock-closed-outline" size={15} color="#94A3B8" />
              <Text style={styles.trustText}>Escrow Protection</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 3. Visual Categories Section */}
      <View style={styles.categorySectionWrap}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Explore Categories</Text>
            <Text style={styles.sectionSubtitle}>Tap a category to filter listings instantly</Text>
          </View>
          {activeCategory !== 'All' && (
            <TouchableOpacity onPress={() => setActiveCategory('All')} style={styles.clearFilterBtn}>
              <Ionicons name="close-circle-outline" size={15} color="#38BDF8" />
              <Text style={styles.clearFilterText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.visualCategoryScroll}
        >
          {VISUAL_CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                testID="category-chip"
                style={[styles.visualCatCard, isSelected && styles.visualCatCardActive]}
                onPress={() => setActiveCategory(cat.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.visualCatIconWrap, isSelected && styles.visualCatIconWrapActive]}>
                  <Ionicons
                    name={cat.icon as any}
                    size={22}
                    color={isSelected ? '#09090b' : cat.color}
                  />
                </View>
                <Text style={[styles.visualCatTitle, isSelected && styles.visualCatTitleActive]}>
                  {cat.label}
                </Text>
                <Text style={styles.visualCatSubtitle} numberOfLines={1}>
                  {cat.countLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 4. Campus / College Filter Bar */}
      <View style={styles.filterSection}>
        <View style={styles.filterHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="location-outline" size={16} color="#38BDF8" />
            <Text style={styles.filterSectionTitle}>Campus Scope:</Text>
          </View>
          <Text style={styles.activeCampusLabel} numberOfLines={1}>
            {activeCollege}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.collegeScroll}
        >
          {/* All Colleges */}
          <TouchableOpacity
            style={[styles.collegePill, activeCollege === 'All Colleges' && styles.activeCollegePill]}
            onPress={() => setActiveCollege('All Colleges')}
            activeOpacity={0.75}
          >
            <Ionicons
              name="globe-outline"
              size={15}
              color={activeCollege === 'All Colleges' ? '#09090b' : '#38BDF8'}
            />
            <Text style={[styles.collegePillText, activeCollege === 'All Colleges' && styles.activeCollegePillText]}>
              All Colleges
            </Text>
          </TouchableOpacity>

          {/* User College */}
          {user?.college && (
            <TouchableOpacity
              style={[styles.collegePill, activeCollege === user.college && styles.activeCollegePill]}
              onPress={() => setActiveCollege(user.college || 'All Colleges')}
              activeOpacity={0.75}
            >
              <Ionicons
                name="school-outline"
                size={15}
                color={activeCollege === user.college ? '#09090b' : '#38BDF8'}
              />
              <Text
                numberOfLines={1}
                style={[styles.collegePillText, activeCollege === user.college && styles.activeCollegePillText]}
              >
                My College ({user.college})
              </Text>
            </TouchableOpacity>
          )}

          {/* Custom Selector */}
          <TouchableOpacity
            style={[
              styles.collegePill,
              activeCollege !== 'All Colleges' && activeCollege !== user?.college && styles.activeCollegePill,
            ]}
            onPress={() => setIsCollegeModalOpen(true)}
            activeOpacity={0.75}
          >
            <Ionicons
              name="business-outline"
              size={15}
              color={activeCollege !== 'All Colleges' && activeCollege !== user?.college ? '#09090b' : '#38BDF8'}
            />
            <Text
              numberOfLines={1}
              style={[
                styles.collegePillText,
                activeCollege !== 'All Colleges' && activeCollege !== user?.college && styles.activeCollegePillText,
              ]}
            >
              {activeCollege !== 'All Colleges' && activeCollege !== user?.college ? activeCollege : 'Select College ▾'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 5. Feed Header & Search Status */}
      <View style={styles.feedStatusRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.feedHeading}>
            {activeCategory === 'All' ? 'Latest Campus Gear' : `${activeCategory} Listings`}
          </Text>
          {searchQuery ? (
            <Text style={styles.searchQueryBadge}>matching "{searchQuery}"</Text>
          ) : null}
        </View>
        <Text style={styles.feedCountBadge}>
          {products.length} {products.length === 1 ? 'item' : 'items'} available
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Head>
        <title>Campus Marketplace - Buy & Sell College Gear | Ooplabdh</title>
        <meta name="description" content="Browse second-hand textbooks, engineering gadgets, furniture, cycles, and student essentials from verified campus sellers." />
        <meta property="og:title" content="Campus Marketplace - Ooplabdh" />
        <meta property="og:description" content="Browse second-hand textbooks, electronics, and college essentials." />
        <link rel="canonical" href="https://ooplabdh.shop/marketplace" />
      </Head>
      <Navbar />

      <View style={styles.mainContent}>
        <FlatList
          ref={listRef}
          key={`${numColumns}-${products.length}`}
          data={products}
          keyExtractor={keyExtractor}
          numColumns={numColumns}
          ListHeaderComponent={renderListHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#38bdf8"
              colors={['#38bdf8']}
            />
          }
          contentContainerStyle={[styles.gridList, isPhone && styles.phoneGridList]}
          columnWrapperStyle={numColumns > 1 ? [styles.row, isSparse && styles.sparseRow, { gap: CARD_GAP }] : undefined}
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.loaderBox}>
                <ActivityIndicator size="large" color="#38BDF8" />
                <Text style={styles.loaderText}>Loading verified campus listings...</Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="cart-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>No Listings Found</Text>
                <Text style={styles.emptyText}>
                  {searchQuery || activeCategory !== 'All'
                    ? 'No products matched your active filters. Try searching for something else.'
                    : 'No items have been listed in this campus scope yet. Be the first to list!'}
                </Text>
                <TouchableOpacity
                  style={styles.emptySellBtn}
                  onPress={() => router.push(user ? '/add-product' : ('/(auth)/login?redirect=/add-product' as any))}
                >
                  <Ionicons name="add" size={16} color="#09090b" />
                  <Text style={styles.emptySellBtnText}>List Your Item</Text>
                </TouchableOpacity>
              </View>
            )
          }
          ListFooterComponent={
            <View style={styles.footerWrapper}>
              <Footer onBackToTop={handleBackToTop} />
            </View>
          }
          renderItem={renderItem}
        />
      </View>

      {/* College Selection Modal */}
      <Modal
        visible={isCollegeModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCollegeModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, isPhone && styles.phoneModalBox]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="school-outline" size={20} color="#38BDF8" />
                <Text style={styles.modalTitle}>Select Campus / College</Text>
              </View>
              <TouchableOpacity onPress={() => setIsCollegeModalOpen(false)}>
                <Ionicons name="close" size={22} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalSearchRow}>
              <Ionicons name="search" size={16} color="#94A3B8" />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search college (e.g. BBIT, IIT, Jadavpur...)"
                placeholderTextColor="#64748B"
                value={collegeSearch}
                onChangeText={setCollegeSearch}
              />
              {collegeSearch ? (
                <TouchableOpacity onPress={() => setCollegeSearch('')}>
                  <Ionicons name="close-circle" size={16} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>

            <ScrollView style={styles.collegeListScroll} showsVerticalScrollIndicator={false}>
              {filteredColleges.map((col) => {
                const isSelected = activeCollege === col;
                return (
                  <TouchableOpacity
                    key={col}
                    style={[styles.collegeListItem, isSelected && styles.collegeListItemActive]}
                    onPress={() => {
                      setActiveCollege(col);
                      setIsCollegeModalOpen(false);
                      setCollegeSearch('');
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                      size={18}
                      color={isSelected ? "#38BDF8" : "#64748B"}
                    />
                    <Text style={[styles.collegeListText, isSelected && styles.collegeListTextActive]}>
                      {col}
                    </Text>
                  </TouchableOpacity>
                );
              })}
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
    alignSelf: 'stretch',
  },
  headerWrapper: {
    width: '100%',
    maxWidth: 1440,
    alignSelf: 'center',
    marginBottom: 8,
  },
  verificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 14,
  },
  verificationBannerText: {
    color: '#FBBF24',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },

  // --- HERO STYLES ---
  heroCard: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 24,
    backgroundColor: '#111116',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      web: {
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45)',
      } as any,
      default: {
        elevation: 4,
      },
    }),
  },
  phoneHeroCard: {
    borderRadius: 20,
    marginHorizontal: 12,
  },
  heroBackgroundGlow: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(56, 189, 248, 0.09)',
    ...Platform.select({
      web: {
        filter: 'blur(60px)',
      } as any,
    }),
  },
  heroContent: {
    padding: 28,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  heroBadgeText: {
    color: '#38BDF8',
    fontSize: 11.5,
    fontWeight: '600',
  },
  heroLivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  heroLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  heroLiveText: {
    color: '#6EE7B7',
    fontSize: 11,
    fontWeight: '600',
  },
  heroHeading: {
    color: '#F8FAFC',
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: 10,
    maxWidth: 720,
  },
  phoneHeroHeading: {
    fontSize: 24,
    lineHeight: 32,
  },
  heroHighlight: {
    color: '#38BDF8',
  },
  heroSubheading: {
    color: '#94A3B8',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 680,
    marginBottom: 22,
  },
  phoneHeroSubheading: {
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 18,
  },
  heroActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  phoneHeroActionRow: {
    gap: 10,
  },
  heroPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#38BDF8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 20px rgba(56, 189, 248, 0.4)',
      } as any,
      default: {
        elevation: 4,
      },
    }),
  },
  heroPrimaryBtnText: {
    color: '#09090b',
    fontSize: 14,
    fontWeight: '700',
  },
  heroSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  heroSecondaryBtnText: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '600',
  },
  heroTrustBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  phoneHeroTrustBar: {
    gap: 8,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#475569',
  },
  trustText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },

  // --- VISUAL CATEGORIES STYLES ---
  categorySectionWrap: {
    marginTop: 22,
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: '#64748B',
    fontSize: 12.5,
    marginTop: 2,
  },
  clearFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  clearFilterText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
  },
  visualCategoryScroll: {
    gap: 12,
    paddingVertical: 4,
  },
  visualCatCard: {
    width: 140,
    backgroundColor: '#141418',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  visualCatCardActive: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.09)',
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px rgba(56, 189, 248, 0.2)',
      } as any,
    }),
  },
  visualCatIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  visualCatIconWrapActive: {
    backgroundColor: '#38BDF8',
  },
  visualCatTitle: {
    color: '#F1F5F9',
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  visualCatTitleActive: {
    color: '#38BDF8',
  },
  visualCatSubtitle: {
    color: '#64748B',
    fontSize: 11,
  },

  // --- FILTER SECTION STYLES ---
  filterSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  filterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterSectionTitle: {
    color: '#94A3B8',
    fontSize: 12.5,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeCampusLabel: {
    color: '#38BDF8',
    fontSize: 12.5,
    fontWeight: '600',
    maxWidth: 240,
  },
  collegeScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  collegePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.round,
    backgroundColor: 'rgba(24, 24, 27, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  activeCollegePill: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  collegePillText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  activeCollegePillText: {
    color: '#09090b',
    fontWeight: '700',
  },

  // --- FEED STATUS ---
  feedStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  feedHeading: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
  },
  searchQueryBadge: {
    color: '#38BDF8',
    fontSize: 13,
    fontStyle: 'italic',
  },
  feedCountBadge: {
    color: '#64748B',
    fontSize: 12.5,
    fontWeight: '500',
  },

  // --- GRID LIST ---
  gridList: {
    paddingHorizontal: 28,
    paddingBottom: 90,
  },
  phoneGridList: {
    paddingHorizontal: 12,
    paddingBottom: 80,
  },
  row: {
    justifyContent: 'flex-start',
    maxWidth: 1440,
    alignSelf: 'center',
    width: '100%',
  },
  sparseRow: {
    justifyContent: 'flex-start',
  },
  cardWrapper: {
    alignItems: 'center',
  },
  loaderBox: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loaderText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  emptyState: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#141418',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  emptySellBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#38BDF8',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  emptySellBtnText: {
    color: '#09090b',
    fontSize: 13,
    fontWeight: '700',
  },
  footerWrapper: {
    width: '100%',
    marginTop: 40,
  },

  // --- MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '75%',
    backgroundColor: '#18181b',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    padding: 20,
  },
  phoneModalBox: {
    maxWidth: '100%',
    maxHeight: '85%',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
  },
  modalSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 14,
    gap: 8,
  },
  modalSearchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
  },
  collegeListScroll: {
    flexGrow: 0,
  },
  collegeListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  collegeListItemActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderBottomColor: 'transparent',
  },
  collegeListText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  collegeListTextActive: {
    color: '#38BDF8',
    fontWeight: '700',
  },
});
