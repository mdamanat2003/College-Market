import { Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export const useAuthRestriction = () => {
  const router = useRouter();
  const { ensureRealUser } = useAuthStore();

  const checkRestriction = (actionName: string = 'this action') => {
    if (!ensureRealUser()) {
      const message = `${actionName} karne ke liye aapko pehle login karna hoga.`;
      if (Platform.OS === 'web') {
        const wantsLogin = window.confirm(`${message} Login now?`);
        if (wantsLogin) {
          router.push('/(auth)/login');
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
                router.push('/(auth)/login');
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
