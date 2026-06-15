import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import Footer from '../../components/layout/Footer';
import { Navbar } from '../../components/layout/Navbar';
import { ProductCard } from '../../components/cards/ProductCard';
import { useProductStore } from '../../store/productStore';
import { COLORS, SPACING, RADIUS } from '../../theme/colors';

const CATEGORIES = ['All', 'Electronics', 'Books', 'Furniture', 'Vehicles', 'Others'];

export default function MarketplaceHome() {
  const { products, fetchProducts, isLoading } = useProductStore();
  const [activeCategory, setActiveCategory] = useState('All');
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<any>>(null);

  const isPhone = width <= 480;
  const numColumns = width >= 1100 ? 4 : width >= 768 ? 3 : width >= 540 ? 2 : 1;
  const H_PADDING = SPACING.md * 2;
  const CARD_GAP = SPACING.sm * 2;
  const cardWidth = Math.floor((width - H_PADDING - CARD_GAP * numColumns) / numColumns);

  const handleBackToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const renderItem = React.useCallback(({ item }: { item: any }) => (
    <View style={[styles.cardWrapper, isPhone && styles.phoneCardWrapper, { width: isPhone ? `${100 / numColumns}%` : cardWidth }]}>
      <ProductCard product={item} />
    </View>
  ), [isPhone, numColumns, cardWidth]);

  const keyExtractor = React.useCallback((item: any) => item._id, []);

  useEffect(() => {
    fetchProducts(activeCategory);
  }, [activeCategory, fetchProducts]);

  return (
    <View style={styles.container}>
      <Navbar />

      <View style={styles.mainContent}>
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
    justifyContent: 'flex-start',
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
