import React, { useCallback, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { api } from '../services/api';
import Footer from '../components/layout/Footer';
import { useChatStore } from '../store/chatStore';
import { COLORS, RADIUS, SPACING } from '../theme/colors';

export default function NotificationsScreen() {
  const router = useRouter();
  const { startConversation } = useChatStore();
  const { fetchUnreadNotificationsCount, setUnreadNotifications } = useChatStore();
  const listRef = useRef<FlatList>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications || []);
      setUnreadNotifications(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  const handleBackToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const markRead = async (notificationId: string) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications((current) =>
        current.map((item) => (item._id === notificationId ? { ...item, isRead: true } : item))
      );
      await fetchUnreadNotificationsCount();
    } catch (error) {
      console.error('Failed to mark notification read:', error);
    }
  };

  const openBuyerChat = async (notification: any) => {
    const buyerId = notification.sender?._id || notification.sender;
    const productId = notification.relatedId?._id || notification.relatedId;

    if (!buyerId || !productId) return;

    setActiveId(notification._id);
    try {
      await markRead(notification._id);
      const conversationId = await startConversation(productId, buyerId);
      if (conversationId) {
        router.push(`/chat/${conversationId}`);
      }
    } finally {
      await fetchUnreadNotificationsCount();
      setActiveId(null);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isWishlistAlert = item.type === 'Wishlist';
    const buyerId = item.sender?._id || item.sender;

    return (
      <TouchableOpacity
        style={[styles.card, !item.isRead && styles.unreadCard]}
        activeOpacity={0.8}
        onPress={() => isWishlistAlert && openBuyerChat(item)}
      >
        <View style={styles.iconWrap}>
          <Ionicons
            name={isWishlistAlert ? 'heart' : 'notifications-outline'}
            size={20}
            color={isWishlistAlert ? 'red' : COLORS.primary}
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>

          {isWishlistAlert && (
            <>
              <Text style={styles.meta}>Buyer ID: {buyerId}</Text>
              <Text style={styles.meta}>Product ID: {item.relatedId?._id || item.relatedId}</Text>
            </>
          )}
        </View>

        {isWishlistAlert && (
          <View style={styles.actionBox}>
            <Text style={styles.actionText}>{activeId === item._id ? 'Opening...' : 'Chat'}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="notifications-off-outline" size={60} color={COLORS.border} />
          <Text style={styles.emptyText}>No notifications yet.</Text>
          <View style={styles.footerWrapper}>
            <Footer onBackToTop={handleBackToTop} />
          </View>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <View style={styles.footerWrapper}>
              <Footer onBackToTop={handleBackToTop} />
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { height: 60, backgroundColor: COLORS.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  emptyText: { fontSize: 16, color: COLORS.textMuted, marginTop: SPACING.md, marginBottom: 40 },
  listContent: { flexGrow: 1, padding: SPACING.md },
  card: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border },
  unreadCard: { borderColor: COLORS.primaryLight },
  iconWrap: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface },
  content: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  message: { fontSize: 13, color: COLORS.textMuted, lineHeight: 18 },
  meta: { fontSize: 12, color: COLORS.primary, marginTop: 4, fontWeight: '600' },
  actionBox: { justifyContent: 'center', alignItems: 'center', paddingLeft: SPACING.sm },
  actionText: { fontSize: 12, color: 'red', fontWeight: '700' },
  footerWrapper: { marginHorizontal: -SPACING.md, marginTop: 'auto', width: '100%' },
});