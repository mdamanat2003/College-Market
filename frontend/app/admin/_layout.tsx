import { useEffect } from 'react';
import { Stack, useRouter, useSegments, usePathname } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { COLORS, SPACING, RADIUS } from '../../theme/colors';
import { OoplabdhLogo } from '../../components/brand/OoplabdhLogo';

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isWebLarge = Platform.OS === 'web' && width > 768;

  const isLoginPage = pathname === '/admin/login';
  const inAdminRoute = segments[0] === 'admin';
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (inAdminRoute) {
      if (isLoginPage) {
        if (isAdmin) {
          router.replace('/admin/dashboard');
        }
      } else if (!isAdmin) {
        if (user && user.role !== 'admin') {
          router.replace('/(tabs)');
        } else {
          router.replace('/admin/login');
        }
      }
    }
  }, [inAdminRoute, isLoginPage, isAdmin, user, router]);

  if (!isLoginPage && !isAdmin) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.replace('/admin/login' as any);
  };

  const navItems = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'grid-outline' },
    { label: 'Manage Users', route: '/admin/users', icon: 'people-outline' },
    { label: 'Manage Products', route: '/admin/products', icon: 'list-outline' },
    { label: 'Escrow Transactions', route: '/admin/escrow', icon: 'receipt-outline' },
    { label: 'Manage Requests', route: '/admin/requests', icon: 'mail-outline' },
    { label: 'Notes & PyQ Requests', route: '/admin/academic-requests', icon: 'book-outline' },
  ];

  if (isLoginPage) {
    return <Stack screenOptions={{ headerShown: false }} />;
  }

  if (isWebLarge) {
    return (
      <View style={styles.webContainer}>
        {/* Admin Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <OoplabdhLogo size="sm" style={styles.brandLogo} />
            <View style={styles.adminBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#EF4444" />
              <Text style={styles.adminBadgeText}>Admin Panel</Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Split Content: Sidebar + Stack Navigation */}
        <View style={styles.mainLayout}>
          {/* Sidebar */}
          <View style={styles.sidebar}>
            <Text style={styles.sidebarTitle}>Admin Modules</Text>
            {navItems.map((item) => {
              const isActive = pathname === item.route;
              return (
                <TouchableOpacity 
                  key={item.route}
                  style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
                  onPress={() => router.push(item.route as any)}
                >
                  <Ionicons 
                    name={item.icon as any} 
                    size={20} 
                    color={isActive ? COLORS.background : COLORS.text} 
                    style={styles.sidebarIcon}
                  />
                  <Text style={[styles.sidebarText, isActive && styles.sidebarTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Right Container slot */}
          <View style={styles.content}>
            <Stack screenOptions={{ headerShown: false }} />
          </View>
        </View>
      </View>
    );
  }

  // Mobile View falls back to standard Stack
  return <Stack screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 70,
    backgroundColor: COLORS.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 10,
  },
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
    marginLeft: 110,
  },
  adminBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF4444',
  },
  logoutBtn: {
    padding: SPACING.xs,
  },
  mainLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 260,
    backgroundColor: COLORS.card,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.1)',
    padding: SPACING.lg,
    gap: SPACING.xs,
  },
  sidebarTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    marginBottom: 4,
  },
  sidebarItemActive: {
    backgroundColor: COLORS.primary,
  },
  sidebarIcon: {
    marginRight: SPACING.sm,
  },
  sidebarText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  sidebarTextActive: {
    color: COLORS.background,
  },
  content: {
    flex: 1,
  },
});
