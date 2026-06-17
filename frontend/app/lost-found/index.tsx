import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Navbar } from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useLostFoundStore } from '../../store/lostFoundStore';
import { useAuthStore } from '../../store/authStore';
import { COLORS, RADIUS, SPACING } from '../../theme/colors';

const CATEGORIES = ['All', 'Electronics', 'Documents', 'Keys', 'Wallets', 'Bags', 'Others'];

const LostFoundCard = React.memo(({ item, user, handleResolve }: { item: any, user: any, handleResolve: (id: string) => void }) => (
  <View style={[styles.itemCard, item.status === 'Resolved' && styles.resolvedCard]}>
    {item.image ? (
      <Image source={{ uri: item.image }} style={styles.itemImage} />
    ) : (
      <View style={styles.placeholderImage}>
        <Ionicons name="image-outline" size={32} color={COLORS.textMuted} />
      </View>
    )}
    <View style={styles.itemInfo}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, item.status === 'Resolved' ? styles.statusResolved : styles.statusActive]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
      <View style={styles.itemMeta}>
        <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
        <Text style={styles.metaText}>{item.location}</Text>
      </View>
      <View style={styles.itemFooter}>
        <View style={styles.reporterBox}>
          <Ionicons name="person-circle-outline" size={16} color={COLORS.primary} />
          <Text style={styles.reporterText}>{item.reporter?.name || 'Unknown User'}</Text>
        </View>
        {item.reporter?._id === user?._id && item.status === 'Active' && (
          <TouchableOpacity 
            style={styles.resolveBtn}
            onPress={() => handleResolve(item._id)}
          >
            <Text style={styles.resolveBtnText}>Mark Resolved</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  </View>
));

export default function LostFoundList() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, fetchItems, isLoading, updateStatus, error } = useLostFoundStore();
  const listRef = useRef<FlatList>(null);
  
  const [activeTab, setActiveTab] = useState<'Lost' | 'Found'>('Lost');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    fetchItems({ type: activeTab, category: selectedCategory, search });
  }, [activeTab, selectedCategory, search]);

  const handleSearch = () => {
    setSearch(searchInput);
  };

  const handleBackToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleResolve = React.useCallback(async (id: string) => {
    const success = await updateStatus(id, 'Resolved');
    if (success) {
      Alert.alert('Success', 'Item marked as resolved!');
    } else {
      // Alert me store se error message nikal kar dikhayenge
      const errorMessage = useLostFoundStore.getState().error;
      Alert.alert('Update Failed', errorMessage || 'Something went wrong while updating status.');
    }
  }, [updateStatus]);

  const renderItem = React.useCallback(({ item }: { item: any }) => (
    <LostFoundCard item={item} user={user} handleResolve={handleResolve} />
  ), [user, handleResolve]);

  const keyExtractor = React.useCallback((item: any) => item._id, []);

  return (
    <View style={styles.container}>
      <Navbar />
      
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>Lost & Found</Text>
          <TouchableOpacity 
            style={styles.reportBtn} 
            onPress={() => router.push('/lost-found/report')}
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.reportBtnText}>Report Item</Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={20} color={COLORS.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Lost' && styles.activeTab]} 
            onPress={() => setActiveTab('Lost')}
          >
            <Text style={[styles.tabText, activeTab === 'Lost' && styles.activeTabText]}>Lost Items</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'Found' && styles.activeTab]} 
            onPress={() => setActiveTab('Found')}
          >
            <Text style={[styles.tabText, activeTab === 'Found' && styles.activeTabText]}>Found Items</Text>
          </TouchableOpacity>
        </View>

        {/* Search & Categories */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for items..."
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearch}
            placeholderTextColor={COLORS.textMuted}
            returnKeyType="search"
          />
        </View>

        <View style={styles.categoryScroll}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CATEGORIES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.chip, selectedCategory === item && styles.activeChip]}
                onPress={() => setSelectedCategory(item)}
              >
                <Text style={[styles.chipText, selectedCategory === item && styles.activeChipText]}>{item}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.chipList}
          />
        </View>

        {/* Items List */}
        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={items}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            removeClippedSubviews={true}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={5}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={64} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No items found.</Text>
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
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: SPACING.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  pageTitle: { fontSize: 24, fontWeight: '800', color: COLORS.heading },
  reportBtn: { flexDirection: 'row', backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADIUS.md, gap: 6, alignItems: 'center' },
  reportBtnText: { color: '#fff', fontWeight: '600' },
  
  tabContainer: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 4, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: RADIUS.md },
  activeTab: { backgroundColor: COLORS.primary },
  tabText: { fontWeight: '600', color: COLORS.textMuted },
  activeTabText: { color: '#fff' },

  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, paddingHorizontal: 12, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md },
  searchInput: { flex: 1, height: 44, color: COLORS.text, paddingLeft: 8 },

  categoryScroll: { marginBottom: SPACING.lg },
  chipList: { gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.round, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  activeChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  activeChipText: { color: '#fff' },

  listContent: { flexGrow: 1, gap: SPACING.md, paddingBottom: 0 },
  itemCard: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  resolvedCard: { opacity: 0.7 },
  itemImage: { width: 100, height: '100%', minHeight: 120 },
  placeholderImage: { width: 100, height: '100%', minHeight: 120, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  itemInfo: { flex: 1, padding: 12 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  itemTitle: { fontSize: 16, fontWeight: '700', color: COLORS.heading, flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusActive: { backgroundColor: '#DEF7EC' },
  statusResolved: { backgroundColor: '#F3F4F6' },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  itemDesc: { fontSize: 13, color: COLORS.text, marginVertical: 6 },
  itemMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  metaText: { fontSize: 12, color: COLORS.textMuted },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  reporterText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  reporterBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', padding: 10, borderRadius: RADIUS.md, marginBottom: SPACING.md, gap: 8 },
  errorText: { color: COLORS.danger, fontSize: 13, fontWeight: '600' },
  resolveBtn: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  resolveBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },

  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 60, gap: 12 },
  emptyText: { color: COLORS.textMuted, fontSize: 16 },
  footerWrapper: { marginHorizontal: -SPACING.lg, marginTop: 40 },
});