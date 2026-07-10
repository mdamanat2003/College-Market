import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions, Platform } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../../store/authStore';
import { useAdminStore } from '../../store/adminStore';
import { useChatStore } from '../../store/chatStore';
import { api } from '../../services/api';
import { COLORS, SPACING, RADIUS } from '../../theme/colors';
import { OoplabdhLogo } from '../../components/brand/OoplabdhLogo';

export default function AdminDashboardScreen() {
  const { width } = useWindowDimensions();
  const isWebLarge = Platform.OS === 'web' && width > 768;

  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { stats, escrows, transactions, isLoading, fetchStats, fetchEscrows, fetchTransactions } = useAdminStore();
  const { fetchUnreadNotificationsCount } = useChatStore();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
      fetchEscrows();
      fetchTransactions();
      fetchNotifications();
    }, [fetchEscrows, fetchStats, fetchTransactions])
  );

  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
      if (fetchUnreadNotificationsCount) await fetchUnreadNotificationsCount();
    } catch (err) {
      console.error('Failed to load admin notifications', err);
      setNotifications([]);
    } finally {
      setNotifLoading(false);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((cur) => cur.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
      if (fetchUnreadNotificationsCount) await fetchUnreadNotificationsCount();
    } catch (err) {
      console.error('Failed to mark notification read', err);
    }
  };

  const recentEscrows = escrows.slice(0, 3);

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login' as any);
  };

  const navItems = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'grid-outline' },
    { label: 'Manage Users', route: '/admin/users', icon: 'people-outline' },
    { label: 'Manage Products', route: '/admin/products', icon: 'list-outline' },
    { label: 'Escrow Transactions', route: '/admin/escrow', icon: 'receipt-outline' },
    { label: 'Manage Requests', route: '/admin/requests', icon: 'mail-outline' },
    { label: 'Notes & PyQ Requests', route: '/admin/academic-requests', icon: 'book-outline' },
  ];

  return (
    <View style={styles.container}>
      {/* Admin Header (Only on Mobile) */}
      {!isWebLarge ? (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => setIsDrawerOpen(true)} style={styles.menuBtn}>
              <Ionicons name="menu-outline" size={26} color={COLORS.text} />
            </TouchableOpacity>
            <OoplabdhLogo size="sm" style={styles.brandLogo} />
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#EF4444" />
              <Text style={styles.adminBadgeText}>Admin</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      ) : null}

      <ScrollView 
        contentContainerStyle={[
          styles.scrollContent, 
          isWebLarge && styles.scrollContentWeb
        ]} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeBox}>
          <Text style={styles.welcomeText}>Welcome, {user?.name}</Text>
          <Text style={styles.roleText}>Super Administrator Dashboard</Text>
        </View>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>Overview</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginVertical: SPACING.xl }} />
        ) : (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={32} color={COLORS.primary} />
              <Text style={styles.statNumber}>{stats?.totalUsers || 0}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="cube" size={32} color={COLORS.accent} />
              <Text style={styles.statNumber}>{stats?.activeProducts || 0}</Text>
              <Text style={styles.statLabel}>Active Listings</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="wallet" size={32} color={COLORS.success} />
              <Text style={styles.statNumber}>₹{stats?.totalEscrow || 0}</Text>
              <Text style={styles.statLabel}>In Escrow</Text>
            </View>

            <View style={styles.statCard}>
              <Ionicons name="alert-circle" size={32} color={COLORS.warning} />
              <Text style={styles.statNumber}>{escrows.length}</Text>
              <Text style={styles.statLabel}>Open Escrow Cases</Text>
            </View>
          </View>
        )}

        <View style={styles.escrowPanel}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.sectionTitle}>Recent Escrow Activity</Text>
              <Text style={styles.panelSubtitle}>Live refund and received-item requests from students</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/admin/escrow' as any)}>
              <Text style={styles.panelLink}>View all</Text>
            </TouchableOpacity>
          </View>

          {recentEscrows.length === 0 ? (
            <View style={styles.emptyPanelState}>
              <Ionicons name="receipt-outline" size={22} color={COLORS.textMuted} />
              <Text style={styles.emptyPanelText}>No active escrow requests right now.</Text>
            </View>
          ) : (
            recentEscrows.map((order) => {
              const isRefund = Boolean(order.isDisputed);
              const statusLabel = isRefund
                ? 'Refund requested'
                : order.deliveryStatus === 'Received'
                  ? 'Buyer marked received'
                  : 'Escrow held';

              return (
                <View key={order._id} style={styles.escrowItem}>
                  <View style={styles.escrowItemTopRow}>
                    <Text style={styles.escrowItemTitle} numberOfLines={1}>
                      {order.product?.title || 'Product removed'}
                    </Text>
                    <Text style={[styles.escrowStatus, isRefund ? styles.escrowStatusDanger : styles.escrowStatusSuccess]}>
                      {statusLabel}
                    </Text>
                  </View>
                  <Text style={styles.escrowItemMeta} numberOfLines={1}>
                    Buyer: {order.buyer?.name || 'Unknown'} · Seller: {order.seller?.name || 'Unknown'}
                  </Text>
                  {isRefund ? (
                    <Text style={styles.escrowReason} numberOfLines={2}>
                      Reason: {order.disputeReason || 'Not provided'}
                    </Text>
                  ) : (
                    <Text style={styles.escrowReason} numberOfLines={2}>
                      Admin can release funds for order #{String(order._id).slice(-6).toUpperCase()}.
                    </Text>
                  )}
                </View>
              );
            })
          )}
        </View>

        <View style={styles.notifPanel}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.sectionTitle}>Admin Notifications</Text>
              <Text style={styles.panelSubtitle}>Persisted alerts for admin actions</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/notifications' as any)}>
              <Text style={styles.panelLink}>Open all</Text>
            </TouchableOpacity>
          </View>

          {notifLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : notifications.length === 0 ? (
            <View style={styles.emptyPanelState}>
              <Ionicons name="notifications-off-outline" size={20} color={COLORS.textMuted} />
              <Text style={styles.emptyPanelText}>No notifications yet.</Text>
            </View>
          ) : (
            notifications.slice(0,5).map((n) => (
              <View key={n._id} style={styles.notifRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.notifTitle} numberOfLines={2}>{n.title}</Text>
                  <Text style={styles.notifTime}>{new Date(n.createdAt).toLocaleString()}</Text>
                </View>
                {!n.isRead && (
                  <TouchableOpacity onPress={() => markNotificationRead(n._id)} style={styles.markReadBtn}>
                    <Text style={styles.markReadText}>Mark read</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
        </View>

        <View style={styles.pastPanel}>
          <Text style={styles.sectionTitle}>Past Transactions</Text>
          {transactions.length === 0 ? (
            <Text style={styles.emptyText}>No historical transactions yet.</Text>
          ) : (
            transactions.slice(0,5).map((t: any) => (
              <View key={t._id} style={styles.transactionRow}>
                <Text style={styles.transactionTitle} numberOfLines={1}>{t.product?.title || 'Product removed'}</Text>
                <Text style={styles.transactionMeta}>{t.paymentStatus} · ₹{t.amount} · {t.status}</Text>
              </View>
            ))
          )}
        </View>



      </ScrollView>

      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <TouchableOpacity 
          activeOpacity={1} 
          style={styles.drawerOverlay} 
          onPress={() => setIsDrawerOpen(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.drawerContent}>
            <View style={styles.drawerHeader}>
              <OoplabdhLogo size="sm" style={styles.brandLogo} />
              <TouchableOpacity onPress={() => setIsDrawerOpen(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.drawerItems}>
              {navItems.map((item) => (
                <TouchableOpacity 
                  key={item.route}
                  style={styles.drawerItem}
                  onPress={() => {
                    setIsDrawerOpen(false);
                    router.push(item.route as any);
                  }}
                >
                  <Ionicons name={item.icon as any} size={20} color={COLORS.text} style={{ marginRight: 12 }} />
                  <Text style={styles.drawerItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { height: 70, backgroundColor: COLORS.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  brandLogo: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    gap: 4,
    marginLeft: SPACING.sm,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  logoutBtn: { padding: SPACING.xs },
  
  mainLayout: { flex: 1, flexDirection: 'column' },
  mainLayoutWeb: { flexDirection: 'row' },
  
  sidebarContainer: {
    width: 260,
    backgroundColor: COLORS.card,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  sidebarTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
  },
  sidebarModuleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sidebarIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  sidebarModuleInfo: {
    flex: 1,
  },
  sidebarModuleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },

  scrollContent: { padding: SPACING.lg, paddingTop: 36, maxWidth: 800, width: '100%', alignSelf: 'center' },
  scrollContentWeb: { padding: SPACING.lg, paddingTop: 36, maxWidth: 1000, width: '100%', alignSelf: 'stretch' },
  
  welcomeBox: { marginBottom: SPACING.xl },
  welcomeText: { fontSize: 24, fontWeight: '700', color: COLORS.text },
  roleText: { fontSize: 14, color: COLORS.accent, fontWeight: '600', marginTop: 4 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, marginBottom: SPACING.xl },
  statCard: { flex: 1, minWidth: 100, backgroundColor: COLORS.card, padding: SPACING.lg, borderRadius: RADIUS.lg, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginTop: SPACING.sm },
  statLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 4, fontWeight: '500', textAlign: 'center' },

  escrowPanel: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.xl },
  panelHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: SPACING.md, marginBottom: SPACING.md },
  panelSubtitle: { marginTop: 4, fontSize: 13, color: COLORS.textMuted, lineHeight: 18 },
  panelLink: { fontSize: 13, fontWeight: '700', color: COLORS.accent },
  emptyPanelState: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: SPACING.sm },
  emptyPanelText: { color: COLORS.textMuted, fontSize: 13 },
  escrowItem: { paddingVertical: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.surface },
  escrowItemTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.sm },
  escrowItemTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.text },
  escrowStatus: { fontSize: 11, fontWeight: '700', borderRadius: RADIUS.round, paddingHorizontal: 8, paddingVertical: 4, overflow: 'hidden' },
  escrowStatusDanger: { color: '#B91C1C', backgroundColor: '#FEE2E2' },
  escrowStatusSuccess: { color: '#047857', backgroundColor: '#D1FAE5' },
  escrowItemMeta: { marginTop: 4, fontSize: 12, color: COLORS.textMuted },
  escrowReason: { marginTop: 6, fontSize: 12, color: COLORS.text, lineHeight: 18 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  pastPanel: { backgroundColor: COLORS.card, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md },
  transactionRow: { paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.surface },
  transactionTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  transactionMeta: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  emptyText: { color: COLORS.textMuted, fontSize: 13, marginTop: SPACING.sm },
  notifPanel: { backgroundColor: COLORS.card, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.md },
  notifRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.surface },
  notifTitle: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  notifTime: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  markReadBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#EEF2FF', borderRadius: 8, marginLeft: 12 },
  markReadText: { fontSize: 12, color: '#2563EB', fontWeight: '700' },
  
  moduleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, padding: SPACING.md, borderRadius: RADIUS.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  moduleInfo: { flex: 1 },
  moduleTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  moduleDesc: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  
  menuBtn: {
    marginRight: SPACING.xs,
    padding: SPACING.xs,
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1000,
  },
  drawerContent: {
    width: 280,
    height: '100%',
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xl,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  drawerItems: {
    gap: SPACING.md,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  drawerItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
});