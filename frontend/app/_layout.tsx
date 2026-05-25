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

    const styleId = 'campuscart-web-reset';
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
    const isPublicRoute = (pathname === '/home' || pathname === '/about' || pathname === '/contact') && !inTabsGroup;

    if (inAdminRoute && (!user || user.role !== 'admin')) {
      router.replace('/(auth)/login');
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
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
