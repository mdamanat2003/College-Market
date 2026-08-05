import { Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export const useDemoRestriction = () => {
  const router = useRouter();
  const { ensureRealUser, logout } = useAuthStore();

  const checkRestriction = (actionName: string = 'this action') => {
    if (!ensureRealUser()) {
      if (Platform.OS === 'web') {
        const wantsLogin = window.confirm(`Bhai, ${actionName} karne ke liye aapko login karna padega. Demo mode mein ye allow nahi hai. Login now?`);
        if (wantsLogin) {
          logout();
          router.replace('/(auth)/login');
        }
      } else {
        Alert.alert(
          'Login Required',
          `Bhai, ${actionName} karne ke liye aapko login karna padega. Demo mode mein ye allow nahi hai.`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Login Now',
              onPress: () => {
                logout(); // Logout demo user
                router.replace('/(auth)/login');
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
