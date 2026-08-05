import React, { useCallback, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Animated, 
  PanResponder, 
  Platform 
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '../services/api';
import Footer from '../components/layout/Footer';
import { useChatStore } from '../store/chatStore';
import { COLORS, RADIUS, SPACING } from '../theme/colors';

// Helper to determine notification icon, color, and name based on read state
function getNotificationIconMeta(type: string, isRead: boolean) {
  if (isRead) {
    // SEEN / READ: Simple muted outline icons
    switch (type) {
      case 'Wishlist':
        return { name: 'heart-outline' as const, color: '#64748B', bg: 'rgba(255, 255, 255, 0.04)' };
      case 'Message':
        return { name: 'chatbubble-ellipses-outline' as const, color: '#64748B', bg: 'rgba(255, 255, 255, 0.04)' };
      case 'Offer':
        return { name: 'pricetag-outline' as const, color: '#64748B', bg: 'rgba(255, 255, 255, 0.04)' };
      case 'Order':
        return { name: 'bag-handle-outline' as const, color: '#64748B', bg: 'rgba(255, 255, 255, 0.04)' };
      case 'LostFound':
        return { name: 'search-outline' as const, color: '#64748B', bg: 'rgba(255, 255, 255, 0.04)' };
      default:
        return { name: 'notifications-outline' as const, color: '#64748B', bg: 'rgba(255, 255, 255, 0.04)' };
    }
  } else {
    // UNREAD: Active glowing icons
    switch (type) {
      case 'Wishlist':
        return { name: 'heart' as const, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' };
      case 'Message':
        return { name: 'chatbubble-ellipses' as const, color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)' };
      case 'Offer':
        return { name: 'pricetag' as const, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'Order':
        return { name: 'bag-handle' as const, color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'LostFound':
        return { name: 'search' as const, color: '#A855F7', bg: 'rgba(168, 85, 247, 0.15)' };
      default:
        return { name: 'notifications' as const, color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)' };
    }
  }
}

// Swipeable Card Item with PanResponder for Right Slide to Delete
const SwipeableNotificationCard = React.memo(({
  item,
  activeId,
  onPress,
  onDelete
}: {
  item: any;
  activeId: string | null;
  onPress: (item: any) => void;
  onDelete: (id: string) => void;
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const isRead = item.isRead;
  const isWishlistAlert = item.type === 'Wishlist';
  const iconMeta = getNotificationIconMeta(item.type, isRead);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Capture horizontal swipe moving right
        return Math.abs(gestureState.dx) > 12 && Math.abs(gestureState.dy) < 15 && gestureState.dx > 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx > 0) {
          pan.setValue({ x: gestureState.dx, y: 0 });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 80 || gestureState.vx > 0.5) {
          // Slide out right completely then call onDelete
          Animated.timing(pan, {
            toValue: { x: 500, y: 0 },
            duration: 220,
            useNativeDriver: false,
          }).start(() => {
            onDelete(item._id);
          });
        } else {
          // Spring back to start position
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            bounciness: 6,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.swipeContainer}>
      {/* Background revealed on slide right */}
      <View style={styles.deleteBackground}>
        <View style={styles.deleteContent}>
          <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
          <Text style={styles.deleteText}>Release to Delete</Text>
        </View>
      </View>

      {/* Sliding Foreground Card */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.card,
          !isRead && styles.unreadCard,
          { transform: [{ translateX: pan.x }] }
        ]}
      >
        <TouchableOpacity
          style={styles.cardInner}
          activeOpacity={0.85}
          onPress={() => onPress(item)}
        >
          {/* Notification Icon */}
          <View style={[styles.iconWrap, { backgroundColor: iconMeta.bg }]}>
            <Ionicons name={iconMeta.name} size={18} color={iconMeta.color} />
            {!isRead && <View style={styles.unreadDot} />}
          </View>

          {/* Content Details */}
          <View style={styles.content}>
            <Text style={[styles.title, !isRead && styles.unreadTitle]}>{item.title}</Text>
            <Text style={[styles.message, !isRead && styles.unreadMessage]}>{item.message}</Text>
          </View>

          {/* Actions & Delete Button */}
          <View style={styles.rightActionsRow}>
            {isWishlistAlert && (
              <View style={styles.actionBox}>
                <Text style={styles.actionText}>{activeId === item._id ? 'Opening...' : 'Chat'}</Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.quickDeleteBtn} 
              onPress={() => {
                Animated.timing(pan, {
                  toValue: { x: 500, y: 0 },
                  duration: 200,
                  useNativeDriver: false,
                }).start(() => onDelete(item._id));
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={16} color="#64748B" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
});

export default function NotificationsScreen() {
  const router = useRouter();
  const { startConversation, fetchUnreadNotificationsCount, setUnreadNotifications } = useChatStore();
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
  }, [setUnreadNotifications]);

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

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((current) => current.map((n) => ({ ...n, isRead: true })));
      await fetchUnreadNotificationsCount();
    } catch (error) {
      console.error('Failed to mark all notifications read:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      // Optimistic update
      setNotifications((current) => current.filter((item) => item._id !== notificationId));
      await api.delete(`/notifications/${notificationId}`);
      await fetchUnreadNotificationsCount();
    } catch (error) {
      console.error('Failed to delete notification:', error);
      // Reload on failure to restore state
      loadNotifications();
    }
  };

  const handleItemPress = async (item: any) => {
    // Mark as read immediately on click
    if (!item.isRead) {
      await markRead(item._id);
    }

    if (item.type === 'Wishlist') {
      const buyerId = item.sender?._id || item.sender;
      const productId = item.relatedId?._id || item.relatedId;

      if (buyerId && productId) {
        setActiveId(item._id);
        try {
          const conversationId = await startConversation(productId, buyerId);
          if (conversationId) {
            router.push(`/chat/${conversationId}`);
          }
        } finally {
          setActiveId(null);
        }
      }
    } else if (item.type === 'LostFound') {
      router.push('/lost-found');
    } else if (item.type === 'Message') {
      router.push('/messages');
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <SwipeableNotificationCard
      item={item}
      activeId={activeId}
      onPress={handleItemPress}
      onDelete={handleDelete}
    />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notifications</Text>
          
          {notifications.some(n => !n.isRead) ? (
            <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
              <Ionicons name="checkmark-done-outline" size={18} color={COLORS.primary} style={{ marginRight: 4 }} />
              <Text style={styles.markAllText}>Read All</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 60 }} />
          )}
        </View>

        {/* Swipe Hint Banner */}
        {notifications.length > 0 && (
          <View style={styles.swipeHintBar}>
            <Ionicons name="arrow-forward-circle-outline" size={14} color="#64748B" />
            <Text style={styles.swipeHintText}>Slide right on any notification to delete it</Text>
          </View>
        )}

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : notifications.length === 0 ? (
          <View style={{ flex: 1 }}>
            <View style={styles.center}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="notifications-off-outline" size={44} color="#38BDF8" />
              </View>
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptyText}>You're all caught up! Updates about messages, lost & found, and offers will appear here.</Text>
            </View>
            <Footer onBackToTop={handleBackToTop} />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    height: 60, 
    backgroundColor: '#18181b', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: SPACING.md, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255, 255, 255, 0.08)' 
  },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#F8FAFC' },
  markAllBtn: { flexDirection: 'row', alignItems: 'center', padding: 6 },
  markAllText: { fontSize: 12.5, fontWeight: '700', color: COLORS.primary },
  
  swipeHintBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: 'rgba(39, 39, 42, 0.4)', 
    paddingVertical: 6, 
    gap: 6, 
    borderBottomWidth: 1, 
    borderBottomColor: 'rgba(255, 255, 255, 0.05)' 
  },
  swipeHintText: { fontSize: 11.5, color: '#64748B', fontWeight: '600' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.xl },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(56, 189, 248, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#F8FAFC', marginBottom: 6 },
  emptyText: { fontSize: 13.5, color: '#94A3B8', textAlign: 'center', maxWidth: 360, lineHeight: 20, marginBottom: 30 },

  listContent: { flexGrow: 1, padding: SPACING.md },

  /* Swipe Container & Delete Background */
  swipeContainer: { 
    position: 'relative', 
    marginBottom: SPACING.sm, 
    borderRadius: RADIUS.lg, 
    overflow: 'hidden' 
  },
  deleteBackground: { 
    position: 'absolute', 
    top: 0, 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: '#EF4444', 
    borderRadius: RADIUS.lg, 
    justifyContent: 'center', 
    paddingLeft: 20 
  },
  deleteContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8 
  },
  deleteText: { 
    color: '#FFFFFF', 
    fontSize: 13, 
    fontWeight: '800' 
  },

  /* Card Styles */
  card: { 
    backgroundColor: '#18181b', 
    borderRadius: RADIUS.lg, 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.08)' 
  },
  unreadCard: { 
    borderColor: 'rgba(56, 189, 248, 0.3)', 
    backgroundColor: 'rgba(24, 24, 27, 0.95)' 
  },
  cardInner: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    gap: 12, 
    padding: 14 
  },

  iconWrap: { 
    width: 38, 
    height: 38, 
    borderRadius: 19, 
    alignItems: 'center', 
    justifyContent: 'center', 
    position: 'relative',
    marginTop: 2
  },
  unreadDot: { 
    position: 'absolute', 
    top: 2, 
    right: 2, 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: '#38BDF8', 
    borderWidth: 1.5, 
    borderColor: '#18181b' 
  },

  content: { flex: 1 },
  title: { fontSize: 14.5, fontWeight: '600', color: '#94A3B8', marginBottom: 3 },
  unreadTitle: { fontWeight: '800', color: '#F8FAFC' },
  message: { fontSize: 13, color: '#64748B', lineHeight: 18 },
  unreadMessage: { color: '#CBD5E1' },

  rightActionsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'center' },
  actionBox: { backgroundColor: 'rgba(56, 189, 248, 0.12)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.3)' },
  actionText: { fontSize: 12, color: '#38BDF8', fontWeight: '800' },
  quickDeleteBtn: { padding: 6 },

  footerWrapper: { marginHorizontal: -SPACING.md, marginTop: 'auto', width: '100%' },
});