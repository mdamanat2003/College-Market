import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

export default function AdminLayout() {
  const { user } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  const inAdminRoute = segments[0] === 'admin';
  const isAdmin = user?.role === 'admin';
  const canAccessAdmin = !inAdminRoute || isAdmin;

  useEffect(() => {
    if (inAdminRoute && !isAdmin) {
      router.replace('/(auth)/login');
    }
  }, [inAdminRoute, isAdmin, router]);

  if (!canAccessAdmin) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
