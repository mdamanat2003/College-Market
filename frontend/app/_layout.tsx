import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
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
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

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

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/');
    }
  }, [user, segments, isReady, router]);

  // 3. Socket Connection Logic (Real-time Live Engine)
  useEffect(() => {
    if (user && user._id) {
      connectSocket(user._id); // User login hote hi online mark ho jayega
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
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        {/* Make sure your main files like index.tsx or product/[id].tsx are caught by Expo Router naturally */}
        <Stack.Screen name="index" options={{ headerShown: false }} /> 
        <Stack.Screen name="add-product" options={{ headerShown: false }} />
        <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}