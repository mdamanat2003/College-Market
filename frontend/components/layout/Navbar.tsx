import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';

export const Navbar = () => {
  const { user } = useAuthStore();
  const unreadNotifications = useChatStore((state) => state.unreadNotifications);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 600;

  return (
    <View style={styles.header}>
      <View style={styles.brandContainer}>
        <Ionicons name="cart" size={24} color={COLORS.primary} />
        {!isMobile && <Text style={styles.brandText}>CampusCart</Text>}
      </View>

      {!isMobile && (
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} style={styles.searchIcon} />
          <TextInput
            placeholder="Search for books, electronics, cycles..."
            placeholderTextColor={COLORS.textMuted}
            style={styles.searchInput}
          />
        </View>
      )}

      <View style={styles.rightIcons}>
        {!isMobile && (
          <TouchableOpacity style={styles.homeBtn} onPress={() => router.push('/home')}>
            <Ionicons name="home-outline" size={18} color={COLORS.text} />
            <Text style={styles.homeBtnText}>Home</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.sellBtn, isMobile && styles.sellBtnMobile]}
          onPress={() => router.push('/add-product')}
        >
          <Ionicons name="add" size={18} color="#fff" />
          {!isMobile && <Text style={styles.sellBtnText}>Sell</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/messages')}>
          <Ionicons name="chatbubble-ellipses-outline" size={22} color={COLORS.text} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/notifications')}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
          {unreadNotifications > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/profile')}>
          <Text style={styles.profileInitial}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 70,
    backgroundColor: COLORS.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 10,
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
    flex: 1, // Available space lene ke liye
    height: 40,
    backgroundColor: COLORS.surface, // Ya koi light gray code jaise '#F1F5F9'
    borderRadius: RADIUS.md, // Ya manually 8 de sakte hain
    paddingHorizontal: SPACING.md, // Text aur border ke beech ki space
    fontSize: 14,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  homeBtn: {
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.round,
    marginRight: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  homeBtnText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },

  sellBtn: {
    backgroundColor: COLORS.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.round,
    marginRight: SPACING.sm,
    gap: 2,
  },

  sellBtnMobile: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },

  sellBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  iconButton: {
    padding: SPACING.xs,
    position: 'relative',
    marginRight: SPACING.md,
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

  profileInitial: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});