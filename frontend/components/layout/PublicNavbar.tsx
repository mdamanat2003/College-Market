import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; 

import { COLORS, RADIUS, SPACING } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { OoplabdhLogo } from '../brand/OoplabdhLogo';

type ActiveRoute = 'home' | 'about' | 'contact';

type PublicNavbarProps = {
  activeRoute: ActiveRoute;
};

export function PublicNavbar({ activeRoute }: PublicNavbarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { width } = useWindowDimensions();
  const isCompact = width < 720;
  const isTiny = width < 390;

  const navItems = [
    { label: 'Home', href: '/home', key: 'home' as const },
    { label: 'About', href: '/about', key: 'about' as const },
    { label: 'Contact', href: '/contact', key: 'contact' as const },
  ];

  const navigateTo = (href: string) => {
    setIsMenuOpen(false);
    router.push(href as never);
  };

  const profileInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const authAction = user ? (
    <TouchableOpacity
      style={styles.profileButton}
      onPress={() => navigateTo('/profile')}
      accessibilityRole="button"
      accessibilityLabel="Open profile"
    >
      <Text style={styles.profileInitial}>{profileInitial}</Text>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity style={styles.loginButton} onPress={() => navigateTo('/(auth)/login')}>
      <Ionicons name="log-in-outline" size={16} color={COLORS.primary} />
      <Text style={styles.loginButtonText}>Login</Text>
    </TouchableOpacity>
  );

  const mobileAuthAction = user ? (
    <TouchableOpacity style={styles.mobileProfileButton} onPress={() => navigateTo('/profile')}>
      <View style={styles.mobileProfileIcon}>
        <Text style={styles.profileInitial}>{profileInitial}</Text>
      </View>
      <Text style={styles.loginButtonText}>Profile</Text>
    </TouchableOpacity>
  ) : (
    <TouchableOpacity style={styles.mobileLoginButton} onPress={() => navigateTo('/(auth)/login')}>
      <Ionicons name="log-in-outline" size={16} color={COLORS.primary} />
      <Text style={styles.loginButtonText}>Login</Text>
    </TouchableOpacity>
  );

  if (isCompact) {
    return (
      <View style={{ paddingTop: insets.top }}>
        <View style={[styles.navbar, styles.navbarMobile]}>
        <View style={styles.mobileTopRow}>
          <TouchableOpacity style={styles.brandRow} onPress={() => navigateTo('/home')}>
            <OoplabdhLogo size="sm" compact={isTiny} markOnly={isTiny} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setIsMenuOpen((value) => !value)}
            accessibilityRole="button"
            accessibilityLabel={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            <Ionicons name={isMenuOpen ? 'close-outline' : 'menu-outline'} size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {isMenuOpen && (
          <View style={styles.mobileMenu}>
            {navItems.map((item) => {
              const isActive = activeRoute === item.key;

              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.mobileMenuItem, isActive && styles.mobileMenuItemActive]}
                  onPress={() => navigateTo(item.href)}
                >
                  <Text style={[styles.mobileMenuText, isActive && styles.navLinkTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}

            {mobileAuthAction}
          </View>
        )}
      </View>
      </View>
    );
  }

  return (
    <View style={{ paddingTop: insets.top }}>
      <View style={[styles.navbar, isCompact && styles.navbarCompact]}>
      <TouchableOpacity style={styles.brandRow} onPress={() => navigateTo('/home')}>
        <OoplabdhLogo size="sm" />
      </TouchableOpacity>

      <View style={[styles.navActions, isCompact && styles.navActionsCompact]}>
        {navItems.map((item) => {
          const isActive = activeRoute === item.key;

          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.navLink, isCompact && styles.navItemCompact, isActive && styles.navLinkActive]}
              onPress={() => navigateTo(item.href)}
            >
              <Text style={[styles.navLinkText, isActive && styles.navLinkTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}

        {authAction}
      </View>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: SPACING.md,
    width: '100%',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: 28,
    backgroundColor: 'rgba(18, 18, 20, 0.85)',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  navbarCompact: {
    alignItems: 'stretch',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 22,
  },
  navbarMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 12,
  },
  mobileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    flexShrink: 1,
  },
  navActionsCompact: {
    justifyContent: 'space-between',
    width: '100%',
    gap: 6,
  },
  navLink: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: RADIUS.round,
  },
  navItemCompact: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 74,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  navLinkActive: {
    backgroundColor: COLORS.primary,
  },
  navLinkText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  navLinkTextActive: {
    color: '#09090b',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  profileButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  loginButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mobileMenu: {
    gap: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  mobileMenuItem: {
    minHeight: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  mobileMenuItemActive: {
    backgroundColor: COLORS.primary,
  },
  mobileMenuText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  mobileLoginButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mobileProfileButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mobileProfileIcon: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
