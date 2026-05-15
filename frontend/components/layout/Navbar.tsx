import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS, SPACING } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  return (
    <View style={styles.header}>
      
      {/* Brand Logo */}
      <View style={styles.brandContainer}>
        <Ionicons name="cart" size={28} color={COLORS.primary} />
        <Text style={styles.brandText}>CampusCart</Text>
      </View>

      {/* Search Bar */}
      {Platform.OS === 'web' && (
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={COLORS.textMuted}
            style={styles.searchIcon}
          />

          <TextInput
            placeholder="Search for books, electronics, cycles..."
            placeholderTextColor={COLORS.textMuted}
            style={styles.searchInput}
          />
        </View>
      )}

      {/* Right Side Icons */}
      <View style={styles.rightIcons}>

        {/* Sell Button */}
        <TouchableOpacity 
          style={styles.sellBtn} 
          onPress={() => router.push('/add-product')}
        >
          <Ionicons name="add" size={18} color="#fff" style={styles.sellIcon} />
          <Text style={styles.sellBtnText}>Sell</Text>
        </TouchableOpacity>

        {/* Messages / Inbox Button */}
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => router.push('/messages')}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>

        {/* Notification Button */}
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color={COLORS.text}
          />

          {/* Notification Badge */}
          <View style={styles.badge} />
        </TouchableOpacity>

        {/* Profile Button */}
        {/* Profile Button (Ab logout ki jagah profile page par le jayega) */}
        <TouchableOpacity 
          style={styles.profileBtn} 
          onPress={() => router.push('/profile')} // <-- UPDATED
        >
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
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: COLORS.text,

    ...(Platform.OS === 'web'
      ? { outlineStyle: 'none' }
      : {}),
  },

  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  sellBtn: {
    backgroundColor: COLORS.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.round,
    marginRight: SPACING.md,
  },

  sellIcon: {
    marginRight: 2,
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
    width: 10,
    height: 10,
    backgroundColor: COLORS.danger,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: COLORS.card,
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