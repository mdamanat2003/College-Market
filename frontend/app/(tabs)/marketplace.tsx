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
import { useRouter, useLocalSearchParams } from 'expo-router';
import Footer from '../../components/layout/Footer';
import { Navbar } from '../../components/layout/Navbar';
import { ProductCard } from '../../components/cards/ProductCard';
import { useProductStore } from '../../store/productStore';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { COLLEGES, getCollegeSlug } from '../../constants/colleges';
import { COLORS, RADIUS } from '../../theme/colors';

const VISUAL_CATEGORIES = [
  {
    id: 'All',
    label: 'All Items',
    badge: 'All Gear',
    icon: 'grid-outline',
    countLabel: 'All campus gear',
    color: '#38BDF8',
    subtitle: 'Choose your campus to jump directly into all campus gear and student listings.',
    btnLabel: 'All Items',
    targetRoute: '/(tabs)/marketplace',
  },
  {
    id: 'Books',
    label: 'Books & PYQs',
    badge: 'PYQs',
    icon: 'book-outline',
    countLabel: 'Textbooks, Notes',
    color: '#818CF8',
    subtitle: 'Choose your campus to jump directly into previous year question papers.',
    btnLabel: 'PYQs',
    targetRoute: '/academic',
  },
  {
    id: 'Electronics',
    label: 'Tech & Gadgets',
    badge: 'Tech & Gadgets',
    icon: 'laptop-outline',
    countLabel: 'Calculators, Audio',
    color: '#34D399',
    subtitle: 'Choose your campus to jump directly into tech & gadget listings.',
    btnLabel: 'Tech & Gadgets',
    targetRoute: '/(tabs)/marketplace',
  },
  {
    id: 'Vehicles',
    label: 'Cycles & Rides',
    badge: 'Cycles & Rides',
    icon: 'bicycle-outline',
    countLabel: 'Hostel cycles',
    color: '#F472B6',
    subtitle: 'Choose your campus to jump directly into hostel cycles & rides listings.',
    btnLabel: 'Cycles & Rides',
    targetRoute: '/(tabs)/marketplace',
  },
  {
    id: 'Furniture',
    label: 'Hostel & Dorm',
    badge: 'Hostel & Dorm',
    icon: 'bed-outline',
    countLabel: 'Mattresses, Tables',
    color: '#FBBF24',
    subtitle: 'Choose your campus to jump directly into hostel mattresses, tables & dorm gear.',
    btnLabel: 'Hostel & Dorm',
    targetRoute: '/(tabs)/marketplace',
  },
  {
    id: 'Others',
    label: 'Lab & Tools',
    badge: 'Lab & Tools',
    icon: 'flask-outline',
    countLabel: 'Coats, Drafters',
    color: '#A78BFA',
    subtitle: 'Choose your campus to jump directly into lab coats, drafters & tools.',
    btnLabel: 'Lab & Tools',
    targetRoute: '/(tabs)/marketplace',
  },
];

export default function MarketplaceHome() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ category?: string; college?: string }>();
  const { user } = useAuthStore();
  const { products, fetchProducts, isLoading, searchQuery } = useProductStore();
  const [activeCategory, setActiveCategory] = useState<string>(searchParams.category || 'All');
  const [activeCollege, setActiveCollege] = useState<string>(searchParams.college || user?.college || 'All Colleges');

  // Overview Modal State (Image 2 style)
  const [isOverviewModalOpen, setIsOverviewModalOpen] = useState(false);
  const [selectedModalCategory, setSelectedModalCategory] = useState<typeof VISUAL_CATEGORIES[0]>(VISUAL_CATEGORIES[1]);
  const [tempSelectedCollege, setTempSelectedCollege] = useState<string>('Integral University');
  const [collegeSearch, setCollegeSearch] = useState('');
  const [customCollegeInput, setCustomCollegeInput] = useState('');
  const [isAddingCustomCollege, setIsAddingCustomCollege] = useState(false);
  const [extraColleges, setExtraColleges] = useState<string[]>([]);

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

  const allAvailableColleges = useMemo(() => {
    return Array.from(new Set([...COLLEGES, ...extraColleges]));
  }, [extraColleges]);

  const filteredColleges = useMemo(() => {
    if (!collegeSearch.trim()) return ['All Colleges', ...allAvailableColleges];
    const q = collegeSearch.toLowerCase().trim();
    const matches = allAvailableColleges.filter((c) => c.toLowerCase().includes(q));
    return ['All Colleges', ...matches];
  }, [collegeSearch, allAvailableColleges]);

  useEffect(() => {
    if (searchParams.category && searchParams.category !== activeCategory) {
      setActiveCategory(searchParams.category);
    }
    if (searchParams.college && searchParams.college !== activeCollege) {
      setActiveCollege(searchParams.college);
    }
  }, [searchParams.category, searchParams.college]);

  const handleCategoryCardPress = (cat: typeof VISUAL_CATEGORIES[0]) => {
    setSelectedModalCategory(cat);
    const initialChosen = activeCollege && activeCollege !== 'All Colleges'
      ? activeCollege
      : 'Integral University';
    setTempSelectedCollege(initialChosen);
    setCollegeSearch('');
    setIsAddingCustomCollege(false);
    setIsOverviewModalOpen(true);
  };

  const handleOpenCampusModal = () => {
    const currentCat = VISUAL_CATEGORIES.find((c) => c.id === activeCategory) || VISUAL_CATEGORIES[0];
    setSelectedModalCategory(currentCat);
    setTempSelectedCollege(activeCollege !== 'All Colleges' ? activeCollege : 'Integral University');
    setCollegeSearch('');
    setIsAddingCustomCollege(false);
    setIsOverviewModalOpen(true);
  };

  const handleAddCustomCollege = () => {
    const trimmed = customCollegeInput.trim();
    if (!trimmed) return;
    if (!extraColleges.includes(trimmed)) {
      setExtraColleges((prev) => [trimmed, ...prev]);
    }
    setTempSelectedCollege(trimmed);
    setCustomCollegeInput('');
    setIsAddingCustomCollege(false);
  };

  const handleConfirmRedirect = () => {
    setIsOverviewModalOpen(false);

    if (selectedModalCategory.id === 'Books') {
      // Books & PYQs jumps directly into academic notes / PYQs as shown in Image 2
      setActiveCollege(tempSelectedCollege);
      setActiveCategory('Books');
      router.push({
        pathname: '/academic',
        params: { college: tempSelectedCollege },
      });
    } else {
      // Filter marketplace listings for this category and campus
      setActiveCollege(tempSelectedCollege);
      setActiveCategory(selectedModalCategory.id);
      fetchProducts(selectedModalCategory.id, searchQuery, tempSelectedCollege);
      setTimeout(() => {
        listRef.current?.scrollToOffset({ offset: 360, animated: true });
      }, 150);
    }
  };

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
                onPress={() => handleCategoryCardPress(cat)}
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
            onPress={handleOpenCampusModal}
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

      {/* College & Category Overview Modal (Image 2 style) */}
      <Modal
        visible={isOverviewModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOverviewModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, isPhone && styles.phoneModalBox]}>
            {/* Header */}
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalHeaderLeft}>
                {/* Orange Flash / Lightning Icon Box */}
                <View style={styles.modalFlashIconBox}>
                  <Ionicons name="flash" size={19} color="#EA580C" />
                </View>

                {/* Title & Badge & Subtitle */}
                <View style={styles.modalTitleBlock}>
                  <View style={styles.modalTitleWithBadge}>
                    <Text style={styles.modalTitleText}>Select Your College</Text>
                    <View style={styles.modalCategoryBadge}>
                      <Text style={styles.modalCategoryBadgeText}>
                        {selectedModalCategory.badge}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.modalSubtitleText} numberOfLines={2}>
                    {selectedModalCategory.subtitle}
                  </Text>
                </View>
              </View>

              {/* Close Button */}
              <TouchableOpacity
                onPress={() => setIsOverviewModalOpen(false)}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Search Row */}
            <View style={styles.modalSearchInputBox}>
              <Ionicons name="search" size={17} color="#94A3B8" />
              <TextInput
                style={styles.modalSearchTextInput}
                placeholder="Search colleges by name or city..."
                placeholderTextColor="#64748B"
                value={collegeSearch}
                onChangeText={setCollegeSearch}
              />
              {collegeSearch ? (
                <TouchableOpacity onPress={() => setCollegeSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close-circle" size={16} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Add Custom College Inline Form (if active) */}
            {isAddingCustomCollege && (
              <View style={styles.customCollegeAddBox}>
                <TextInput
                  style={styles.customCollegeInput}
                  placeholder="Enter your college or campus name..."
                  placeholderTextColor="#64748B"
                  value={customCollegeInput}
                  onChangeText={setCustomCollegeInput}
                  autoFocus
                />
                <TouchableOpacity
                  style={styles.customCollegeAddBtn}
                  onPress={handleAddCustomCollege}
                  activeOpacity={0.8}
                >
                  <Text style={styles.customCollegeAddBtnText}>Add & Select</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Colleges List */}
            <ScrollView style={styles.collegeItemsScroll} showsVerticalScrollIndicator={false}>
              {filteredColleges.map((col) => {
                const isSelected = tempSelectedCollege === col;
                return (
                  <TouchableOpacity
                    key={col}
                    style={[styles.collegeCardItem, isSelected && styles.collegeCardItemActive]}
                    onPress={() => setTempSelectedCollege(col)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.collegeIconBox, isSelected && styles.collegeIconBoxActive]}>
                      <Ionicons
                        name="business-outline"
                        size={18}
                        color={isSelected ? '#38BDF8' : '#94A3B8'}
                      />
                    </View>
                    <View style={styles.collegeInfoBlock}>
                      <Text style={[styles.collegeCardName, isSelected && styles.collegeCardNameActive]}>
                        {col}
                      </Text>
                      <Text style={styles.collegeCardSlug}>
                        {getCollegeSlug(col)}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={19} color="#38BDF8" style={{ marginLeft: 6 }} />
                    )}
                  </TouchableOpacity>
                );
              })}

              {filteredColleges.length === 0 && (
                <View style={styles.noCollegesFoundBox}>
                  <Text style={styles.noCollegesFoundText}>No matching campus found.</Text>
                  <TouchableOpacity onPress={() => setIsAddingCustomCollege(true)}>
                    <Text style={styles.addItHereInlineLink}>Add "{collegeSearch}" as a new college?</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>

            {/* Footer Row */}
            <View style={styles.modalFooterRow}>
              {/* Left Link */}
              <View style={styles.modalFooterLeft}>
                <Text style={styles.cantFindFooterText}>
                  Can't find your college?{' '}
                  <Text
                    style={styles.addHereLinkText}
                    onPress={() => {
                      if (collegeSearch.trim()) {
                        setCustomCollegeInput(collegeSearch.trim());
                      }
                      setIsAddingCustomCollege((prev) => !prev);
                    }}
                  >
                    Add it here
                  </Text>
                </Text>
              </View>

              {/* Right Action Buttons */}
              <View style={styles.modalFooterButtonsRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setIsOverviewModalOpen(false)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalRedirectBtn}
                  onPress={handleConfirmRedirect}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalRedirectBtnText}>
                    Go to {selectedModalCategory.btnLabel}
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
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

  // --- MODAL STYLES (Image 2 Match) ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    width: '100%',
    maxWidth: 540,
    maxHeight: '88%',
    backgroundColor: '#131417',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#242630',
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 28,
    elevation: 12,
  },
  phoneModalBox: {
    maxWidth: '100%',
    maxHeight: '94%',
    padding: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    paddingRight: 12,
    gap: 12,
  },
  modalFlashIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#2b1609',
    borderWidth: 1,
    borderColor: '#54290e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitleBlock: {
    flex: 1,
  },
  modalTitleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalTitleText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  modalCategoryBadge: {
    backgroundColor: '#262732',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  modalCategoryBadgeText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  modalSubtitleText: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalSearchInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d0e11',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#0284C7',
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 14,
    gap: 8,
  },
  modalSearchTextInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
    paddingVertical: 0,
  },
  customCollegeAddBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 132, 199, 0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.3)',
    padding: 6,
    marginBottom: 14,
    gap: 8,
  },
  customCollegeInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  customCollegeAddBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  customCollegeAddBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  collegeItemsScroll: {
    maxHeight: 250,
  },
  collegeCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181920',
    borderWidth: 1.5,
    borderColor: '#242632',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  collegeCardItemActive: {
    backgroundColor: '#1a1d26',
    borderColor: '#0284C7',
  },
  collegeIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#22242e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  collegeIconBoxActive: {
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
  },
  collegeInfoBlock: {
    flex: 1,
  },
  collegeCardName: {
    color: '#F1F5F9',
    fontSize: 14.5,
    fontWeight: '600',
  },
  collegeCardNameActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  collegeCardSlug: {
    color: '#828d9e',
    fontSize: 12,
    marginTop: 2,
  },
  noCollegesFoundBox: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  noCollegesFoundText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  addItHereInlineLink: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  modalFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#20222b',
    flexWrap: 'wrap',
    gap: 12,
  },
  modalFooterLeft: {
    flex: 1,
    minWidth: 180,
  },
  cantFindFooterText: {
    color: '#94A3B8',
    fontSize: 12.5,
  },
  addHereLinkText: {
    color: '#38BDF8',
    fontWeight: '600',
  },
  modalFooterButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalCancelBtn: {
    backgroundColor: '#22232a',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
  },
  modalCancelBtnText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '500',
  },
  modalRedirectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  modalRedirectBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
