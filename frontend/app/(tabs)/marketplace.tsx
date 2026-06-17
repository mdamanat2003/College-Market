import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
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
  const { products, fetchProducts, isLoading } = useProductStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeCollege, setActiveCollege] = useState<string>(user?.college || 'All Colleges'); 
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<any>>(null);

  const isPhone = width <= 480;
  const numColumns = width >= 1100 ? 4 : width >= 768 ? 3 : width >= 540 ? 2 : 2; // 👈 Changed to 2 for mobile if width > 540 or just 2
  const H_PADDING = isPhone ? 12 : SPACING.md * 2;
  const CARD_GAP = isPhone ? 10 : SPACING.sm * 2;
  const cardWidth = Math.floor((width - H_PADDING - (CARD_GAP * (numColumns - 1))) / numColumns);

  const handleBackToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const renderItem = React.useCallback(({ item }: { item: any }) => (
    <View style={[styles.cardWrapper, isPhone && styles.phoneCardWrapper, { width: cardWidth, marginBottom: CARD_GAP }]}>
      <ProductCard product={item} />
    </View>
  ), [isPhone, cardWidth, CARD_GAP]);

  const keyExtractor = React.useCallback((item: any) => item._id, []);

  useEffect(() => {
    fetchProducts(activeCategory, '', activeCollege);
  }, [activeCategory, activeCollege, fetchProducts]);

  const toggleCollegeFilter = () => {
    if (activeCollege === 'All Colleges') {
      setActiveCollege(user?.college || 'All Colleges');
    } else {
      setActiveCollege('All Colleges');
    }
  };

  return (
    <View style={styles.container}>
      <Navbar />

      <View style={styles.mainContent}>
        {/* --- College Filter Bar --- */}
        <View style={styles.filterSection}>
          <TouchableOpacity 
            style={[styles.filterToggle, activeCollege !== 'All Colleges' && styles.filterToggleActive]} 
            onPress={toggleCollegeFilter}
          >
            <Ionicons 
              name={activeCollege === 'All Colleges' ? "business-outline" : "school"} 
              size={18} 
              color={activeCollege === 'All Colleges' ? COLORS.text : '#fff'} 
            />
            <Text style={[styles.filterToggleText, activeCollege !== 'All Colleges' && styles.filterToggleTextActive]}>
              {activeCollege === 'All Colleges' ? "Show My College Only" : `Showing: ${activeCollege}`}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.categoryContainer, isPhone && styles.phoneCategoryContainer]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.categoryScroll, isPhone && styles.phoneCategoryScroll]}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryPill, isPhone && styles.phoneCategoryPill, activeCategory === cat && styles.activePill]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.categoryText, activeCategory === cat && styles.activeText]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            key={numColumns}
            data={products}
            keyExtractor={keyExtractor}
            numColumns={numColumns}
            contentContainerStyle={[styles.gridList, isPhone && styles.phoneGridList]}
            columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
            removeClippedSubviews={true} // Performance optimization
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No products found in this category.</Text>
              </View>
            }
            ListFooterComponent={
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
  categoryContainer: {
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  phoneCategoryContainer: {
    paddingTop: 16,
    paddingBottom: 13,
  },
  categoryScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  phoneCategoryScroll: {
    paddingHorizontal: 17,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  phoneCategoryPill: {
    minWidth: 62,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 9,
  },
  activePill: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    color: COLORS.text,
    fontWeight: '500',
  },
  activeText: {
    color: '#fff',
  },
  gridList: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: 0,
  },
  phoneGridList: {
    paddingHorizontal: 18,
    paddingTop: 30,
  },
  row: {
    justifyContent: 'space-between',
  },
  cardWrapper: {
    padding: SPACING.sm,
  },
  phoneCardWrapper: {
    padding: 0,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    gap: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterToggleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  filterToggleTextActive: {
    color: '#fff',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontSize: 16,
  },
  footerWrapper: {
    marginHorizontal: -SPACING.md,
  },
});
