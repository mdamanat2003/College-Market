import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';

export const MobileBottomNav = () => {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const unreadNotifications = useChatStore((state) => state.unreadNotifications);

  // Show only on mobile screens (< 768px)
  if (width >= 768) {
    return null;
  }

  const normalized = (pathname || '').toLowerCase();

  // Hide on auth, admin, checkout, creation, or active 1-on-1 chat screens
  if (
    normalized.startsWith('/(auth)') ||
    normalized.startsWith('/admin') ||
    normalized.startsWith('/opadmin') ||
    normalized.startsWith('/checkout') ||
    normalized.startsWith('/chat/') ||
    normalized === '/add-product' ||
    normalized === '/academic/upload' ||
    normalized === '/lost-found/report' ||
    normalized === '/events/create' ||
    normalized === '/community/create'
  ) {
    return null;
  }

  const isMarket = normalized === '/marketplace' || normalized === '/' || normalized === '/(tabs)/marketplace';
  const isAcademic = normalized.startsWith('/academic');
  const isMessages = normalized.startsWith('/messages');
  const isProfile = normalized.startsWith('/profile');

  const handleNav = (targetPath: string, requiresAuth = false) => {
    if (requiresAuth && !user) {
      router.push(`/(auth)/login?redirect=${encodeURIComponent(targetPath)}` as any);
      return;
    }
    router.push(targetPath as any);
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {/* 1. Marketplace */}
      <TouchableOpacity
        style={styles.navTab}
        onPress={() => handleNav('/marketplace')}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isMarket ? 'cart' : 'cart-outline'}
          size={22}
          color={isMarket ? '#38BDF8' : '#94A3B8'}
        />
        <Text style={[styles.tabLabel, isMarket && styles.activeTabLabel]}>Market</Text>
      </TouchableOpacity>

      {/* 2. PyQ & Notes */}
      <TouchableOpacity
        style={styles.navTab}
        onPress={() => handleNav('/academic')}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isAcademic ? 'book' : 'book-outline'}
          size={22}
          color={isAcademic ? '#38BDF8' : '#94A3B8'}
        />
        <Text style={[styles.tabLabel, isAcademic && styles.activeTabLabel]}>PyQs</Text>
      </TouchableOpacity>

      {/* 3. Sell (Prominent Center Button) */}
      <TouchableOpacity
        style={styles.sellTabContainer}
        onPress={() => handleNav('/add-product', true)}
        activeOpacity={0.85}
      >
        <View style={styles.sellCircle}>
          <Ionicons name="add" size={26} color="#09090b" />
        </View>
        <Text style={styles.sellLabel}>Sell</Text>
      </TouchableOpacity>

      {/* 4. Messages / Chats */}
      <TouchableOpacity
        style={styles.navTab}
        onPress={() => handleNav('/messages', true)}
        activeOpacity={0.7}
      >
        <View style={styles.iconWrapper}>
          <Ionicons
            name={isMessages ? 'chatbubbles' : 'chatbubbles-outline'}
            size={22}
            color={isMessages ? '#38BDF8' : '#94A3B8'}
          />
          {unreadNotifications > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadNotifications > 9 ? '9+' : unreadNotifications}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.tabLabel, isMessages && styles.activeTabLabel]}>Chats</Text>
      </TouchableOpacity>

      {/* 5. Account / Profile */}
      <TouchableOpacity
        style={styles.navTab}
        onPress={() => handleNav(user ? '/profile' : '/(auth)/login')}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isProfile ? 'person' : 'person-outline'}
          size={22}
          color={isProfile ? '#38BDF8' : '#94A3B8'}
        />
        <Text style={[styles.tabLabel, isProfile && styles.activeTabLabel]}>
          {user ? 'Profile' : 'Login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(9, 9, 11, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 8,
    zIndex: 9999,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px)',
        position: 'fixed' as any,
      },
      default: {
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
      },
    }),
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    marginTop: 3,
  },
  activeTabLabel: {
    color: '#38BDF8',
    fontWeight: '600',
  },
  sellTabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -10,
  },
  sellCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 6,
  },
  sellLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#38BDF8',
    marginTop: 2,
  },
  iconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: COLORS.danger,
    borderRadius: 9,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
});
