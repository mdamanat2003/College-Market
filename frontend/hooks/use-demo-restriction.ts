import { Alert, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export const useAuthRestriction = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { ensureRealUser } = useAuthStore();

  const checkRestriction = (actionName: string = 'this action', targetUrl?: string) => {
    if (!ensureRealUser()) {
      const message = `${actionName} karne ke liye aapko pehle login karna hoga.`;
      const returnUrl = targetUrl || pathname || '/(tabs)/marketplace';
      const loginUrl = `/(auth)/login?redirect=${encodeURIComponent(returnUrl)}` as any;

      if (Platform.OS === 'web') {
        const wantsLogin = window.confirm(`${message} Login now?`);
        if (wantsLogin) {
          router.push(loginUrl);
        }
      } else {
        Alert.alert(
          'Login Required',
          message,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Login Now',
              onPress: () => {
                router.push(loginUrl);
              },
            },
          ]
        );
      }
      return false;
    }
    return true;
  };

  return { checkRestriction };
};

export const useDemoRestriction = useAuthRestriction;
