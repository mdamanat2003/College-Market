import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Platform, View } from 'react-native';
import 'react-native-reanimated';

import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuthStore } from '../store/authStore';
import { useChatStore } from '../store/chatStore'; // <-- Chat Store import
import { COLORS } from '../theme/colors';
import { InstallAppBanner } from '../components/layout/InstallAppBanner';
import { NotificationToast } from '../components/ui/NotificationToast';
import { OfflineBanner } from '../components/ui/OfflineBanner';
import { BrandSpinner } from '../components/ui/BrandSpinner';

export const unstable_settings = {
  anchor: '(tabs)',
};


export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });
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
        background: linear-gradient(180deg, #09090b 0%, #0f172a 100%);
        background-attachment: fixed;
      }

      /* Branded Spinner Rotation Animation */
      @keyframes brandSpin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .brand-spinner-spin {
        animation: brandSpin 1.3s linear infinite !important;
        transform-origin: center center !important;
      }

      /* Custom Glowing Right-Side Scrollbar Slider */
      ::-webkit-scrollbar {
        width: 10px;
        height: 10px;
      }
      ::-webkit-scrollbar-track {
        background: #09090b;
        border-left: 1px solid rgba(255, 255, 255, 0.05);
      }
      ::-webkit-scrollbar-thumb {
        background: linear-gradient(180deg, #38BDF8 0%, #0284C7 100%);
        border-radius: 10px;
        border: 2px solid #09090b;
        box-shadow: 0 0 10px rgba(56, 189, 248, 0.5);
      }
      ::-webkit-scrollbar-thumb:hover {
        background: #38BDF8;
        box-shadow: 0 0 16px rgba(56, 189, 248, 0.8);
      }

      /* Global Input Focus Rectangle Removal */
      input, textarea, select {
        outline: none !important;
        box-shadow: none !important;
      }
      input:focus, textarea:focus, select:focus {
        outline: none !important;
        box-shadow: none !important;
        border-color: transparent !important;
      }

      /* Web Hover & Focus Micro-Interactions */
      [data-testid="product-card"] {
        transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      [data-testid="product-card"]:hover {
        transform: translateY(-6px) !important;
        box-shadow: 0 16px 36px rgba(0, 0, 0, 0.45), 0 0 20px rgba(56, 189, 248, 0.15) !important;
        border-color: rgba(56, 189, 248, 0.4) !important;
      }
      [data-testid="product-card"]:hover [data-testid="product-image"] {
        transform: scale(1.025) !important;
      }
      [data-testid="product-image"] {
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      [data-testid="buy-btn"] {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      [data-testid="buy-btn"]:hover {
        transform: scale(1.04) translateY(-1px) !important;
        box-shadow: 0 4px 14px rgba(56, 189, 248, 0.45) !important;
        filter: brightness(1.1) !important;
      }
      [data-testid="nav-item"] {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      [data-testid="nav-item"]:hover {
        transform: translateY(-1.5px) !important;
        background-color: rgba(255, 255, 255, 0.05) !important;
        border-color: rgba(255, 255, 255, 0.1) !important;
      }
      [data-testid="nav-item"]:hover i,
      [data-testid="nav-item"]:hover svg,
      [data-testid="nav-item"]:hover text {
        color: #38BDF8 !important;
      }
      [data-testid="logo-btn"] {
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      [data-testid="logo-btn"]:hover {
        transform: scale(1.05) !important;
        filter: brightness(1.1) !important;
      }
      [data-testid="sell-btn"] {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      [data-testid="sell-btn"]:hover {
        transform: scale(1.03) translateY(-1px) !important;
        box-shadow: 0 8px 24px rgba(56, 189, 248, 0.45) !important;
        filter: brightness(1.08) !important;
      }
      [data-testid="icon-btn"] {
        transition: all 0.2s ease !important;
      }
      [data-testid="icon-btn"]:hover {
        background-color: rgba(255, 255, 255, 0.1) !important;
        border-color: rgba(255, 255, 255, 0.18) !important;
        transform: translateY(-1px) scale(1.05) !important;
      }
      [data-testid="category-chip"] {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      [data-testid="category-chip"]:hover {
        transform: translateY(-2px) !important;
        border-color: rgba(56, 189, 248, 0.4) !important;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3) !important;
      }
      [data-testid="note-card"], [data-testid="lost-found-card"], [data-testid="event-card"] {
        transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      [data-testid="note-card"]:hover, [data-testid="lost-found-card"]:hover, [data-testid="event-card"]:hover {
        transform: translateY(-4px) !important;
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4), 0 0 16px rgba(56, 189, 248, 0.12) !important;
        border-color: rgba(56, 189, 248, 0.4) !important;
      }
      [data-testid="login-btn"] {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      [data-testid="login-btn"]:hover {
        transform: translateY(-1px) scale(1.02) !important;
        box-shadow: 0 8px 20px rgba(56, 189, 248, 0.4) !important;
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

    const currentSegment = (segments[0] || '').toLowerCase();
    const inAuthGroup = currentSegment === '(auth)';
    const inAdminRoute = currentSegment === 'admin' || currentSegment === 'opadmin';
    const normalizedPath = (pathname || '').toLowerCase();
    const isAdminLoginPage = normalizedPath === '/admin/login' || normalizedPath === '/opadmin/login' || normalizedPath === '/opadmin';
    const inTabsGroup = currentSegment === '(tabs)';
    const isPublicRoute = (pathname === '/' || pathname === '/home' || pathname === '/about' || pathname === '/contact' || pathname === '/faq' || pathname === '/privacy' || pathname === '/terms' || pathname === '/safety') && !inTabsGroup;

    if (inAdminRoute) {
      if (isAdminLoginPage) {
        if (user && user.role === 'admin') {
          router.replace('/admin/dashboard');
        }
        return;
      }
      if (!user || user.role !== 'admin') {
        if (user && user.role !== 'admin') {
          router.replace('/(tabs)');
        } else {
          router.replace('/Opadmin/login' as any);
        }
        return;
      }
    }

    if (!user && !inAuthGroup) {
      if (isPublicRoute || isAdminLoginPage) {
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

  if (!isReady || !fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <BrandSpinner size={100} label="Ooplabdh" showLabel />
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
