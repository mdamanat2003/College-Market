import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Platform, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore'; // <-- Chat Store import
import { COLORS } from '../theme/colors';
import { InstallAppBanner } from '../components/layout/InstallAppBanner';
import { NotificationToast } from '../components/ui/NotificationToast';
import { OfflineBanner } from '../components/ui/OfflineBanner';

export const unstable_settings = {
  anchor: '(tabs)',
};


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { checkAuth, user } = useAuthStore();

  // ✅ FIX: Hooks hamesha component ke andar hote hain
  const { connectSocket, disconnectSocket } = useChatStore();

  const segments = useSegments();
  const pathname = usePathname();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }

    const styleId = 'ooplabdh-web-reset';
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      html, body, #root {
        margin: 0;
        min-height: 100%;
        width: 100%;
      }

      body {
        overflow-x: hidden;
        background: ${COLORS.background};
      }

      /* Web Hover Animations */
      [data-testid="nav-item"] {
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      [data-testid="nav-item"]:hover {
        transform: translateY(-2px) !important;
        opacity: 0.85 !important;
      }
      [data-testid="logo-btn"] {
        transition: all 0.25s ease !important;
      }
      [data-testid="logo-btn"]:hover {
        transform: scale(1.03) !important;
        opacity: 0.95 !important;
      }
      [data-testid="login-btn"] {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      [data-testid="login-btn"]:hover {
        transform: translateY(-1px) scale(1.02) !important;
        box-shadow: 0 8px 20px rgba(56, 189, 248, 0.4) !important;
        filter: brightness(1.1) !important;
      }
      [data-testid="sell-btn"] {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      [data-testid="sell-btn"]:hover {
        transform: translateY(-1px) scale(1.02) !important;
        box-shadow: 0 8px 20px rgba(56, 189, 248, 0.35) !important;
        filter: brightness(1.1) !important;
      }

      /* Landing Page Primary Buttons Hover */
      [data-testid="hero-primary"],
      [data-testid="btn-primary"] {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      [data-testid="hero-primary"]:hover,
      [data-testid="btn-primary"]:hover {
        transform: translateY(-2px) scale(1.02) !important;
        box-shadow: 0 8px 24px rgba(255, 255, 255, 0.15) !important;
        filter: brightness(1.05) !important;
      }

      /* Landing Page Secondary Buttons Hover */
      [data-testid="hero-secondary"],
      [data-testid="btn-secondary"] {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      [data-testid="hero-secondary"]:hover,
      [data-testid="btn-secondary"]:hover {
        transform: translateY(-2px) scale(1.02) !important;
        background-color: rgba(255, 255, 255, 0.14) !important;
      }

      /* Review & Rating Button Hover */
      [data-testid="btn-review"] {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      [data-testid="btn-review"]:hover {
        transform: translateY(-2px) scale(1.02) !important;
        box-shadow: 0 8px 20px rgba(251, 191, 36, 0.35) !important;
        filter: brightness(1.05) !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

  // 1. Initial Auth Check
  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setIsReady(true);
    };
    initAuth();
  }, [checkAuth]);

  // 2. Routing Logic (Login/Home Redirect)
  useEffect(() => {
    if (!isReady) return;

    const currentSegment = segments[0];
    const inAuthGroup = currentSegment === '(auth)';
    const inAdminRoute = currentSegment === 'admin';
    const inTabsGroup = currentSegment === '(tabs)';
    const isPublicRoute = (pathname === '/' || pathname === '/home' || pathname === '/about' || pathname === '/contact' || pathname === '/faq' || pathname === '/privacy' || pathname === '/terms' || pathname === '/safety') && !inTabsGroup;

    if (inAdminRoute && (!user || user.role !== 'admin')) {
      if (user && user.role !== 'admin') {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/login');
      }
      return;
    }

    if (!user && !inAuthGroup) {
      if (isPublicRoute) {
        return;
      }
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, segments, pathname, isReady, router]);

  // 3. Socket Connection Logic (Real-time Live Engine)
  useEffect(() => {
    if (user && user._id) {
      connectSocket(user._id); // User login hote hi online mark ho jayega
      useChatStore.getState().fetchUnreadNotificationsCount();

      // Web Browser Notification Permission Request
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          Notification.requestPermission().catch(() => {});
        }
      }
    } else {
      disconnectSocket(); // Logout par connection cut
    }
  }, [user, connectSocket, disconnectSocket]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
        <InstallAppBanner />
        <NotificationToast />
        <OfflineBanner />
      </View>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
