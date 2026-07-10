import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdminStore } from '../../store/adminStore';
import { COLORS, SPACING, RADIUS } from '../../theme/colors';

export default function EscrowTransactionsScreen() {
  const router = useRouter();
  const { escrows, fetchEscrows, resolveEscrow, isLoading } = useAdminStore();

  useEffect(() => {
    fetchEscrows();
  }, []);

  const handleAction = (id: string, action: 'release' | 'refund') => {
    const actionText = action === 'release' ? 'Release funds to Seller' : 'Refund money to Buyer';
    
    if (Platform.OS === 'web') {
      const confirmAction = window.confirm(`Are you sure you want to ${actionText}? This cannot be undone.`);
      if (confirmAction) resolveEscrow(id, action);
    } else {
      Alert.alert(
        "Confirm Action",
        `Are you sure you want to ${actionText}?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Confirm", style: action === 'release' ? "default" : "destructive", onPress: () => resolveEscrow(id, action) }
        ]
      );
    }
  };

  const renderEscrowItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>Order ID: {item._id.slice(-6).toUpperCase()}</Text>
        <View style={styles.amountBadge}>
          <Text style={styles.amountText}>₹{item.totalAmount || item.price || item.amount}</Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.productTitle} numberOfLines={1}>{item.product?.title || 'Product Deleted'}</Text>
        
        <View style={styles.userRow}>
          <Ionicons name="arrow-up-circle" size={16} color={COLORS.danger} />
          <Text style={styles.userText}>Buyer: {item.buyer?.name || 'Unknown'}</Text>
        </View>
        
        <View style={styles.userRow}>
          <Ionicons name="arrow-down-circle" size={16} color={COLORS.success} />
          <Text style={styles.userText}>Seller: {item.seller?.name || 'Unknown'}</Text>
        </View>
      </View>

      {/* 👇 NAYA CODE: ADMIN ALERTS 👇 */}
      {item.isDisputed && (
        <View style={styles.alertRed}>
          <Text style={styles.alertRedTitle}>⚠️ Refund Requested</Text>
          <Text style={styles.alertRedText}>Reason: {item.disputeReason}</Text>
          {item.disputeDescription ? (
             <Text style={styles.alertRedDesc}>Desc: {item.disputeDescription}</Text>
          ) : null}
        </View>
      )}

      {item.deliveryStatus === 'Received' && !item.isDisputed && (
        <View style={styles.alertGreen}>
          <Text style={styles.alertGreenTitle}>✅ Buyer Received Item</Text>
          <Text style={styles.alertGreenText}>It is safe to release payment to the seller.</Text>
        </View>
      )}
      {/* 👆 NAYA CODE END 👆 */}

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.btn, styles.refundBtn]} 
          onPress={() => handleAction(item._id, 'refund')}
        >
          <Ionicons name="return-down-back-outline" size={18} color="#DC2626" />
          <Text style={styles.refundBtnText}>Refund Buyer</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btn, styles.releaseBtn]} 
          onPress={() => handleAction(item._id, 'release')}
        >
          <Ionicons name="checkmark-circle-outline" size={18} color="#059669" />
          <Text style={styles.releaseBtnText}>Release to Seller</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Escrow Transactions</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={escrows}
          keyExtractor={(item) => item._id}
          renderItem={renderEscrowItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No pending escrow transactions right now.</Text>
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
  
  listContainer: { padding: SPACING.md, paddingTop: SPACING.lg, gap: SPACING.md },
  card: { backgroundColor: COLORS.card, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden' },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: COLORS.surface },
  orderId: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted },
  amountBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.lg },
  amountText: { color: '#059669', fontWeight: 'bold', fontSize: 14 },
  
  detailsContainer: { padding: SPACING.md, gap: 8 },
  productTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  userText: { fontSize: 14, color: COLORS.textMuted },

  // Naye Styles Alerts ke liye
  alertRed: { backgroundColor: '#FEE2E2', padding: 10, marginHorizontal: SPACING.md, marginBottom: SPACING.md, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: '#FCA5A5' },
  alertRedTitle: { color: '#DC2626', fontWeight: 'bold', fontSize: 14 },
  alertRedText: { color: '#DC2626', fontSize: 13, marginTop: 2 },
  alertRedDesc: { color: '#991B1B', fontSize: 12, marginTop: 2 },
  
  alertGreen: { backgroundColor: '#D1FAE5', padding: 10, marginHorizontal: SPACING.md, marginBottom: SPACING.md, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: '#6EE7B7' },
  alertGreenTitle: { color: '#059669', fontWeight: 'bold', fontSize: 14 },
  alertGreenText: { color: '#047857', fontSize: 12, marginTop: 2 },
  
  actionsContainer: { flexDirection: 'row', flexWrap: 'wrap', padding: SPACING.md, gap: SPACING.md, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.1)' },
  btn: { flex: 1, minWidth: 130, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: RADIUS.sm, gap: 6, borderWidth: 1 },
  refundBtn: { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' },
  refundBtnText: { color: '#DC2626', fontWeight: '600', fontSize: 14 },
  releaseBtn: { backgroundColor: '#D1FAE5', borderColor: '#6EE7B7' },
  releaseBtnText: { color: '#059669', fontWeight: '600', fontSize: 14 },
  emptyText: { textAlign: 'center', color: COLORS.textMuted, marginTop: SPACING.xl, fontSize: 15 }
});