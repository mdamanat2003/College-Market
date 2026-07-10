import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdminStore } from '../../store/adminStore';
import { COLORS, SPACING, RADIUS } from '../../theme/colors';

export default function ManageProductsScreen() {
  const router = useRouter();
  const { products, fetchProducts, deleteProduct, isLoading } = useAdminStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = () => {
    fetchProducts(search);
  };

  const handleDelete = (id: string, title: string) => {
    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm(`Are you sure you want to delete "${title}"?`);
      if (confirmDelete) deleteProduct(id);
    } else {
      Alert.alert(
        "Delete Product",
        `Are you sure you want to delete "${title}"?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => deleteProduct(id) }
        ]
      );
    }
  };

  const renderProductItem = ({ item }: { item: any }) => (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.productPrice}>₹{item.price}</Text>
          {item.marketPrice ? (
            <Text style={styles.productMarketPrice}>₹{item.marketPrice}</Text>
          ) : null}
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="person-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.productDetail}>{item.seller?.name || 'Unknown Seller'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="folder-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.productDetail}>{item.category}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.deleteBtn}
        onPress={() => handleDelete(item._id, item.title)}
      >
        <Ionicons name="trash-outline" size={20} color="#DC2626" />
        <Text style={styles.deleteBtnText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Products</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search listings by title or category..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>

      {/* Products List */}
      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={renderProductItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No products found.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { height: 60, backgroundColor: COLORS.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, margin: SPACING.md, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  searchIcon: { marginRight: SPACING.sm },
  searchInput: { flex: 1, height: 45, color: COLORS.text, fontSize: 15 },

  listContainer: { padding: SPACING.md, paddingTop: SPACING.lg, gap: SPACING.sm },
  productCard: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.card, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', gap: SPACING.sm },
  productInfo: { flex: 1, minWidth: 200, gap: 4, paddingRight: SPACING.md },
  productTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  productPrice: { fontSize: 15, fontWeight: '600', color: COLORS.success },
  productMarketPrice: {
    fontSize: 12,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  productDetail: { fontSize: 13, color: COLORS.textMuted },
  
  deleteBtn: { backgroundColor: '#FEE2E2', paddingHorizontal: SPACING.md, paddingVertical: 10, borderRadius: RADIUS.sm, flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#FCA5A5' },
  deleteBtnText: { fontSize: 13, fontWeight: '600', color: '#DC2626' },
  emptyText: { textAlign: 'center', color: COLORS.textMuted, marginTop: SPACING.xl, fontSize: 15 }
});