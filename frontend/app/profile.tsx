import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../store/authStore';
import { useOrderStore } from '../store/orderStore';
import OrderCard from '../components/OrderCard';
import { Button } from '../components/ui/Button';
import { PlaceholderImage } from '../components/ui/PlaceholderImage';
import { COLORS, SPACING, RADIUS } from '../theme/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { orders, fetchMyOrders, releaseEscrow, isLoading } = useOrderStore();
  
  const [activeTab, setActiveTab] = useState<'Purchases' | 'Sales'>('Purchases');

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  const handleReleaseEscrow = async (orderId: string) => {
    Alert.alert(
      'Confirm receipt',
      'Are you sure you have received the item in good condition? Admin will review and release payment to the seller.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const success = await releaseEscrow(orderId);
            if (success) Alert.alert('Success', 'Marked as received. Admin will release the seller payment.');
          }
        }
      ]
    );
  };

  // ✅ FIX: Bulletproof ID matching logic for filtering orders
  const displayedOrders = orders.filter(order => {
    const buyerId = typeof order.buyer === 'object' ? order.buyer?._id : order.buyer;
    const sellerId = typeof order.seller === 'object' ? order.seller?._id : order.seller;
    
    const currentUserId = String(user?._id);

    if (activeTab === 'Purchases') {
      return String(buyerId) === currentUserId;
    } else {
      return String(sellerId) === currentUserId;
    }
  });

  const purchaseOrders = displayedOrders.filter(order => {
    const buyerId = typeof order.buyer === 'object' ? order.buyer?._id : order.buyer;
    return String(buyerId) === String(user?._id);
  });

  const salesOrders = displayedOrders.filter(order => {
    const sellerId = typeof order.seller === 'object' ? order.seller?._id : order.seller;
    return String(sellerId) === String(user?._id);
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Dashboard</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.backBtn}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={styles.collegeBadge}>
              <Ionicons name="school-outline" size={12} color={COLORS.primary} />
              <Text style={styles.collegeText}>{user?.college || 'My University'}</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tab, activeTab === 'Purchases' && styles.activeTab]} onPress={() => setActiveTab('Purchases')}>
            <Text style={[styles.tabText, activeTab === 'Purchases' && styles.activeTabText]}>My Purchases</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'Sales' && styles.activeTab]} onPress={() => setActiveTab('Sales')}>
            <Text style={[styles.tabText, activeTab === 'Sales' && styles.activeTabText]}>My Sales</Text>
          </TouchableOpacity>
        </View>

        {/* Orders List */}
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : activeTab === 'Purchases' && purchaseOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} yet.</Text>
          </View>
        ) : activeTab === 'Sales' && salesOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} yet.</Text>
          </View>
        ) : activeTab === 'Purchases' ? (
          <FlatList
            data={purchaseOrders}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <OrderCard item={item} refreshOrders={fetchMyOrders} />}
            scrollEnabled={false}
          />
        ) : (
          salesOrders.map((order) => {
            // ✅ FIX: Safe ID check here as well
            const buyerIdForCheck = typeof order.buyer === 'object' ? order.buyer?._id : order.buyer;
            const isBuyer = String(user?._id) === String(buyerIdForCheck);
            
            const product = order.product;
            const isEscrowLocked = order.status === 'Paid' || order.status === 'EscrowLocked';

            return (
              <View key={order._id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>Order #{order._id.slice(-6).toUpperCase()}</Text>
                  <View style={[styles.statusBadge, order.status === 'Completed' ? styles.statusCompleted : styles.statusPending]}>
                    <Text style={[styles.statusText, order.status === 'Completed' && styles.statusTextCompleted]}>
                      {order.status === 'Completed' ? 'Completed' : 'Escrow Locked'}
                    </Text>
                  </View>
                </View>

                <View style={styles.productRow}>
                  {product?.images?.[0] ? (
                    <Image source={{ uri: product.images[0] }} style={styles.productImg} />
                  ) : (
                    <PlaceholderImage style={styles.productImg} label="" size={20} />
                  )}
                  <View style={styles.productDetails}>
                    <Text style={styles.productTitle}>{product?.title}</Text>
                    <Text style={styles.productPrice}>₹{order.amount}</Text>
                    <Text style={styles.partnerText}>
                      {isBuyer ? `Seller: ${order.seller?.name || 'User'}` : `Buyer: ${order.buyer?.name || 'User'}`}
                    </Text>
                  </View>
                </View>

                {/* ESCROW ACTION BUTTONS */}
                {isBuyer && isEscrowLocked && (
                  <View style={styles.actionBox}>
                    <Text style={styles.actionHint}>Have you received the item from the seller?</Text>
                    <Button 
                      title="Item Received" 
                      onPress={() => handleReleaseEscrow(order._id)} 
                    />
                  </View>
                )}

                {!isBuyer && isEscrowLocked && (
                  <View style={styles.actionBoxInfo}>
                    <Ionicons name="information-circle-outline" size={20} color={COLORS.warning} />
                    <Text style={styles.actionHintInfo}>Funds are secure in Escrow. Deliver the item to the buyer so they can release your payment.</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { height: 60, backgroundColor: COLORS.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  scrollContent: { padding: SPACING.lg, maxWidth: 800, width: '100%', alignSelf: 'center' },
  
  profileCard: { flexDirection: 'row', backgroundColor: COLORS.card, padding: SPACING.lg, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.xl, alignItems: 'center' },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.lg },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  userInfo: { flex: 1 },
  name: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  email: { fontSize: 14, color: COLORS.textMuted, marginBottom: 4 },
  collegeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.round, alignSelf: 'flex-start' },
  collegeText: { fontSize: 12, color: COLORS.primary, marginLeft: 4, fontWeight: '500' },
  
  tabContainer: { flexDirection: 'row', marginBottom: SPACING.lg, backgroundColor: COLORS.card, borderRadius: RADIUS.md, padding: 4, borderWidth: 1, borderColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: RADIUS.sm },
  activeTab: { backgroundColor: COLORS.surface },
  tabText: { fontSize: 15, fontWeight: '600', color: COLORS.textMuted },
  activeTabText: { color: COLORS.primary },

  emptyState: { alignItems: 'center', marginTop: SPACING.xxl },
  emptyText: { fontSize: 16, color: COLORS.textMuted, marginTop: SPACING.sm },

  orderCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.surface, paddingBottom: SPACING.sm, marginBottom: SPACING.sm },
  orderId: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.sm },
  statusPending: { backgroundColor: '#FEF3C7' },
  statusCompleted: { backgroundColor: '#D1FAE5' },
  statusText: { fontSize: 12, fontWeight: '700', color: '#B45309' },
  statusTextCompleted: { color: '#065F46' },
  
  productRow: { flexDirection: 'row', alignItems: 'center' },
  productImg: { width: 60, height: 60, borderRadius: RADIUS.sm, backgroundColor: COLORS.surface, marginRight: SPACING.md },
  productDetails: { flex: 1 },
  productTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  productPrice: { fontSize: 16, fontWeight: '700', color: COLORS.primary, marginTop: 2 },
  partnerText: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },

  actionBox: { marginTop: SPACING.md, backgroundColor: '#F8FAFC', padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  actionHint: { fontSize: 13, color: COLORS.text, marginBottom: SPACING.sm, textAlign: 'center', fontWeight: '500' },
  actionBoxInfo: { marginTop: SPACING.md, backgroundColor: '#FFFBEB', padding: SPACING.md, borderRadius: RADIUS.md, flexDirection: 'row', alignItems: 'flex-start' },
  actionHintInfo: { fontSize: 13, color: '#92400E', marginLeft: SPACING.sm, flex: 1, lineHeight: 18 }
});
