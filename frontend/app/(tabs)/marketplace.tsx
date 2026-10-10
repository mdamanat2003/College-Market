import React, { useEffect, useRef, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, ScrollView, TouchableOpacity, useWindowDimensions, Platform, RefreshControl, Modal, TextInput } from 'react-native';
import Head from 'expo-router/head';
import { useRouter } from 'expo-router';
import Footer from '../../components/layout/Footer';
import { Navbar } from '../../components/layout/Navbar';
import { ProductCard } from '../../components/cards/ProductCard';
import { useProductStore } from '../../store/productStore';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { COLLEGES } from '../../constants/colleges';
import { COLORS, SPACING, RADIUS } from '../../theme/colors';

const CATEGORIES = ['All', 'Electronics', 'Books', 'Furniture', 'Vehicles', 'Others'];

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

  const toggleCollegeFilter = () => {
    if (activeCollege === 'All Colleges') {
      setActiveCollege(user?.college || 'All Colleges');
    } else {
      setActiveCollege('All Colleges');
    }
  };

  const isSparse = products.length > 0 && products.length <= 2;

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
        {user && !user.isVerified && (
          <View style={styles.verificationBanner}>
            <Ionicons name="information-circle" size={18} color="#F59E0B" />
            <Text style={styles.verificationBannerText}>
              Your account verification is pending. An admin is reviewing your College ID.
            </Text>
          </View>
        )}

        {/* --- Top Compact Campus Resource Banner --- */}
        <View style={[styles.topResourceBanner, isPhone && styles.phoneTopResourceBanner]}>
          <View style={styles.topResourceLeft}>
            <View style={styles.topResourceBadge}>
              <Ionicons name="sparkles" size={13} color="#38BDF8" />
              <Text style={styles.topResourceBadgeText}>Campus Study Portal</Text>
            </View>
            <Text style={[styles.topResourceTitle, isPhone && styles.phoneTopResourceTitle]}>
              Looking for exam papers or notes? Access verified PYQs across branches.
            </Text>
          </View>
          <View style={[styles.topResourceButtons, isPhone && styles.phoneTopResourceButtons]}>
            <TouchableOpacity
              style={styles.resourcePyqBtn}
              onPress={() => router.push('/academic')}
              activeOpacity={0.8}
            >
              <Ionicons name="book-outline" size={15} color="#09090b" />
              <Text style={styles.resourcePyqBtnText}>PYQ & Notes</Text>
              <Ionicons name="arrow-forward" size={13} color="#09090b" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resourceSellBtn}
              onPress={() => router.push(user ? '/add-product' : '/(auth)/login')}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={16} color="#F8FAFC" />
              <Text style={styles.resourceSellBtnText}>Sell Gear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- Segmented College Filter Chips --- */}
        <View style={styles.filterSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.collegeScroll}
          >
            {/* 1. All Colleges Chip */}
            <TouchableOpacity 
              testID="category-chip"
              style={[
                styles.categoryPill, 
                isPhone && styles.phoneCategoryPill, 
                styles.collegeChipRow,
                activeCollege === 'All Colleges' && styles.activePill
              ]} 
              onPress={() => setActiveCollege('All Colleges')}
              activeOpacity={0.75}
            >
              <Ionicons 
                name="globe-outline" 
                size={16} 
                color={activeCollege === 'All Colleges' ? '#09090b' : '#38BDF8'} 
              />
              <Text style={[
                styles.categoryText, 
                activeCollege === 'All Colleges' && styles.activeText
              ]}>
                All Colleges
              </Text>
            </TouchableOpacity>

            {/* 2. My College Chip (if logged in) */}
            {user?.college && (
              <TouchableOpacity 
                testID="category-chip"
                style={[
                  styles.categoryPill, 
                  isPhone && styles.phoneCategoryPill, 
                  styles.collegeChipRow,
                  activeCollege === user.college && styles.activePill
                ]} 
                onPress={() => setActiveCollege(user.college || 'All Colleges')}
                activeOpacity={0.75}
              >
                <Ionicons 
                  name="school-outline" 
                  size={16} 
                  color={activeCollege === user.college ? '#09090b' : '#38BDF8'} 
                />
                <Text 
                  numberOfLines={1}
                  style={[
                    styles.categoryText, 
                    activeCollege === user.college && styles.activeText
                  ]}
                >
                  My College ({user.college})
                </Text>
              </TouchableOpacity>
            )}

            {/* 3. Custom College Picker Chip */}
            <TouchableOpacity 
              testID="category-chip"
              style={[
                styles.categoryPill, 
                isPhone && styles.phoneCategoryPill, 
                styles.collegeChipRow,
                activeCollege !== 'All Colleges' && activeCollege !== user?.college && styles.activePill
              ]} 
              onPress={() => setIsCollegeModalOpen(true)}
              activeOpacity={0.75}
            >
              <Ionicons 
                name="business-outline" 
                size={16} 
                color={activeCollege !== 'All Colleges' && activeCollege !== user?.college ? '#09090b' : '#38BDF8'} 
              />
              <Text 
                numberOfLines={1}
                style={[
                  styles.categoryText, 
                  activeCollege !== 'All Colleges' && activeCollege !== user?.college && styles.activeText
                ]}
              >
                {activeCollege !== 'All Colleges' && activeCollege !== user?.college ? activeCollege : 'Select College ▾'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* --- Category Filters (24px gap from College Badge) --- */}
        <View style={[styles.categoryContainer, isPhone && styles.phoneCategoryContainer]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.categoryScroll, isPhone && styles.phoneCategoryScroll]}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                testID="category-chip"
                style={[styles.categoryPill, isPhone && styles.phoneCategoryPill, activeCategory === cat && styles.activePill]}
                onPress={() => setActiveCategory(cat)}
                activeOpacity={0.75}
              >
                <Text style={[styles.categoryText, activeCategory === cat && styles.activeText]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#38BDF8" />
          </View>
        ) : (
          /* --- Product Grid (32px gap from Categories) --- */
          <FlatList
            ref={listRef}
            key={`${numColumns}-${products.length}`}
            data={products}
            keyExtractor={keyExtractor}
            numColumns={numColumns}
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
              <View style={styles.emptyState}>
                <Ionicons name="cart-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No products found in this category.</Text>
              </View>
            }
            ListFooterComponent={
              /* --- Footer (80px gap from Products) --- */
              <View style={styles.footerWrapper}>
                <Footer onBackToTop={handleBackToTop} />
              </View>
            }
            renderItem={renderItem}
          />
        )}
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
  filterSection: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 4,
    backgroundColor: 'transparent',
    maxWidth: 1440,
    width: '100%',
    alignSelf: 'center',
    overflow: 'visible',
  },
  collegeScroll: {
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  collegeChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: 280,
  },
  categoryContainer: {
    paddingVertical: 4,
    marginTop: 16,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'visible',
  },
  phoneCategoryContainer: {
    paddingTop: 4,
    paddingBottom: 4,
    marginTop: 12,
  },
  categoryScroll: {
    paddingHorizontal: 28,
    paddingVertical: 8,
    gap: 12,
    maxWidth: 1440,
    alignSelf: 'center',
  },
  phoneCategoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: RADIUS.round,
    backgroundColor: 'rgba(39, 39, 42, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  phoneCategoryPill: {
    minWidth: 64,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  activePill: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 16px rgba(56, 189, 248, 0.45)',
      } as any,
      default: {
        shadowColor: '#38BDF8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 5,
      },
    }),
  },
  categoryText: {
    color: COLORS.textMuted,
    fontSize: 13.5,
    fontWeight: '600',
  },
  activeText: {
    color: '#09090b',
    fontWeight: '800',
  },
  gridList: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 0,
    maxWidth: 1440,
    width: '100%',
    alignSelf: 'center',
  },
  phoneGridList: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    alignItems: 'center',
  },
  row: {
    justifyContent: 'flex-start',
    width: '100%',
  },
  sparseRow: {
    justifyContent: 'center',
  },
  cardWrapper: {
    alignItems: 'stretch',
  },
  phoneCardWrapper: {
    alignItems: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
    gap: 12,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  footerWrapper: {
    marginTop: 80,
    width: '100%',
    alignSelf: 'stretch',
    ...Platform.select({
      web: {
        width: '100vw',
        position: 'relative',
        left: '50%',
        marginLeft: '-50vw',
      } as any,
      default: {
        marginHorizontal: -28,
      },
    }),
  },
  verificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.2)',
    gap: SPACING.sm,
  },
  verificationBannerText: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  topResourceBanner: {
    marginHorizontal: 28,
    marginTop: 16,
    marginBottom: 4,
    maxWidth: 1440,
    alignSelf: 'center',
    width: '100%',
    backgroundColor: 'rgba(24, 24, 27, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
      } as any,
      default: {},
    }),
  },
  phoneTopResourceBanner: {
    marginHorizontal: 16,
    width: 'auto',
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  topResourceLeft: {
    flex: 1,
  },
  topResourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  topResourceBadgeText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  topResourceTitle: {
    color: '#F1F5F9',
    fontSize: 13.5,
    fontWeight: '600',
    lineHeight: 19,
  },
  phoneTopResourceTitle: {
    fontSize: 12.5,
  },
  topResourceButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  phoneTopResourceButtons: {
    width: '100%',
    justifyContent: 'flex-start',
  },
  resourcePyqBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#38BDF8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  resourcePyqBtnText: {
    color: '#09090b',
    fontSize: 12.5,
    fontWeight: '700',
  },
  resourceSellBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  resourceSellBtnText: {
    color: '#F8FAFC',
    fontSize: 12.5,
    fontWeight: '600',
  },
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
