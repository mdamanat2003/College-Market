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

  const numColumns = width > 1200 ? 4 : width > 768 ? 3 : width > 480 ? 2 : 1;

  const handleBackToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  useEffect(() => {
    fetchProducts(activeCategory);
  }, [activeCategory, fetchProducts]);

  return (
    <View style={styles.container}>
      <Navbar />

      <View style={styles.mainContent}>
        <View style={styles.categoryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryPill, activeCategory === cat && styles.activePill]}
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
            keyExtractor={(item) => item._id}
            numColumns={numColumns}
            contentContainerStyle={styles.gridList}
            columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
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
            renderItem={({ item }) => (
              <View style={[styles.cardWrapper, { width: `${100 / numColumns}%` }]}>
                <ProductCard product={item} />
              </View>
            )}
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
  categoryScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
  },
  categoryPill: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: 'transparent',
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
  row: {
    justifyContent: 'flex-start',
  },
  cardWrapper: {
    padding: SPACING.sm,
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
