import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, ScrollView, TouchableOpacity, useWindowDimensions, Platform, RefreshControl } from 'react-native';
import Footer from '../../components/layout/Footer';
import { Navbar } from '../../components/layout/Navbar';
import { ProductCard } from '../../components/cards/ProductCard';
import { useProductStore } from '../../store/productStore';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../../theme/colors';

const CATEGORIES = ['All', 'Electronics', 'Books', 'Furniture', 'Vehicles', 'Others'];

export default function MarketplaceHome() {
  const { user } = useAuthStore();
  const { products, fetchProducts, isLoading, searchQuery } = useProductStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeCollege, setActiveCollege] = useState<string>(user?.college || 'All Colleges'); 
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

        {/* --- Segmented College Filter Chips (24px gap from Menu) --- */}
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

            {/* 2. My College Chip */}
            <TouchableOpacity 
              testID="category-chip"
              style={[
                styles.categoryPill, 
                isPhone && styles.phoneCategoryPill, 
                styles.collegeChipRow,
                activeCollege !== 'All Colleges' && styles.activePill
              ]} 
              onPress={() => setActiveCollege(user?.college || 'My College')}
              activeOpacity={0.75}
            >
              <Ionicons 
                name="school-outline" 
                size={16} 
                color={activeCollege !== 'All Colleges' ? '#09090b' : '#38BDF8'} 
              />
              <Text 
                numberOfLines={1}
                style={[
                  styles.categoryText, 
                  activeCollege !== 'All Colleges' && styles.activeText
                ]}
              >
                {user?.college ? `My College (${user.college})` : 'My College'}
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
});
