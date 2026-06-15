import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  ScrollView, // 👈 New import
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router'; // 👈 Added usePathname
import { COLORS, RADIUS, SPACING } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';

// 👈 Naye Features Array (Aap isme aur bhi add kar sakte hain baad me)
const NAV_ITEMS = [
  { id: 'home', name: 'Home', path: '/home', icon: 'home-outline', activeIcon: 'home' },
  { id: 'market', name: 'Marketplace', path: '/marketplace', icon: 'cart-outline', activeIcon: 'cart' },
  { id: 'academic', name: 'PyQ & Notes', path: '/academic', icon: 'book-outline', activeIcon: 'book' },
  { id: 'lostfound', name: 'Lost & Found', path: '/lost-found', icon: 'search-outline', activeIcon: 'search' },
  { id: 'events', name: 'Campus Fests', path: '/events', icon: 'calendar-outline', activeIcon: 'calendar' },
];

export const Navbar = () => {
  const { user } = useAuthStore();
  const unreadNotifications = useChatStore((state) => state.unreadNotifications);
  const router = useRouter();
  const currentPath = usePathname(); // 👈 Active tab pata karne ke liye
  const { width } = useWindowDimensions();

  const isPhone = width <= 480;
  const isMobile = width < 600;

  return (
    <View style={styles.wrapper}>
      {/* --- UPPER BAR (Aapka Purana Code) --- */}
      <View style={[styles.header, isPhone && styles.phoneHeader]}>
        <TouchableOpacity style={styles.brandContainer} onPress={() => router.push('/home')}>
          <Ionicons name="cart" size={24} color={COLORS.primary} />
          {!isMobile && <Text style={styles.brandText}>CampusCart</Text>}
        </TouchableOpacity>

        {!isMobile && (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
            <TextInput
              placeholder="Search for books, electronics, PyQs..."
              placeholderTextColor={COLORS.textMuted}
              style={styles.searchInput}
            />
          </View>
        )}

        <View style={[styles.rightIcons, isPhone && styles.phoneRightIcons]}>
          <TouchableOpacity
            style={[styles.sellBtn, isPhone && styles.phoneSellBtn]}
            onPress={() => router.push('/add-product')}
          >
            <Ionicons name="add" size={isPhone ? 24 : 18} color="#fff" />
            {!isPhone && <Text style={styles.sellBtnText}>Sell</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={[styles.iconButton, isPhone && styles.phoneIconButton]} onPress={() => router.push('/messages')}>
            <Ionicons name="chatbubble-ellipses-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.iconButton, isPhone && styles.phoneIconButton]} onPress={() => router.push('/notifications')}>
            <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
            {unreadNotifications > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadNotifications > 9 ? '9+' : unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={[styles.profileBtn, isPhone && styles.phoneProfileBtn]} onPress={() => router.push('/profile')}>
            <Text style={styles.profileInitial}>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- LOWER BAR (Naye Features Navigation) --- */}
      <View style={styles.subHeader}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={[styles.navScrollContent, isPhone && styles.phoneNavScrollContent]}
        >
          {NAV_ITEMS.map((item) => {
            // Check agar URL us item ke path se match karta hai
            const isActive = currentPath === item.path || currentPath.startsWith(`${item.path}/`);

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.navItem, isActive && styles.activeNavItem]}
                onPress={() => router.push(item.path as any)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isActive ? (item.activeIcon as any) : (item.icon as any)}
                  size={16}
                  color={isActive ? COLORS.primary : COLORS.textMuted}
                />
                <Text style={[styles.navText, isActive && styles.activeNavText]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Naya Wrapper jo dono bars ko ek jaisa dikhayega
  wrapper: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 10,
    // Web shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
  },
  phoneHeader: {
    height: 63,
    paddingHorizontal: 18,
  },

  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: -0.5,
    marginLeft: SPACING.xs,
  },

  searchContainer: {
    flex: 1,
    maxWidth: 500,
    marginHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.round,
    paddingHorizontal: SPACING.md,
    height: 44,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneRightIcons: {
    gap: 14,
  },

  sellBtn: {
    backgroundColor: COLORS.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.round,
    marginRight: SPACING.sm,
    gap: 4,
  },
  phoneSellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginRight: 0,
    justifyContent: 'center',
  },
  sellBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  iconButton: {
    padding: SPACING.xs,
    position: 'relative',
    marginRight: SPACING.md,
  },
  phoneIconButton: {
    padding: 0,
    marginRight: 0,
    width: 26,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  badge: {
    position: 'absolute',
    top: 4,
    right: 6,
    minWidth: 18,
    height: 18,
    backgroundColor: COLORS.danger,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },

  profileBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneProfileBtn: {
    width: 36,
    height: 36,
    backgroundColor: COLORS.primaryLight,
  },
  profileInitial: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  // --- NAYE SUB-NAVBAR KE STYLES ---
  subHeader: {
    height: 48,
    borderTopWidth: 1,
    borderTopColor: COLORS.surface, // Dono bars ke beech ek halki line
  },
  navScrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18, // Buttons ke beech ka gap
  },
  phoneNavScrollContent: {
    paddingHorizontal: 18,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.round,
    gap: 6,
    backgroundColor: 'transparent',
  },
  activeNavItem: {
    backgroundColor: COLORS.surface, // Active tab ka light background
  },
  navText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  activeNavText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});