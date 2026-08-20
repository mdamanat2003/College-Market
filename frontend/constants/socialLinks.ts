import { Linking, Platform, Alert } from 'react-native';

export const SOCIAL_LINKS = {
  instagram: process.env.EXPO_PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/ooolabdh.shop?igsh=MWV6bHNkMnJoZnRk&igsi=MWV6bHNkMnJoZnRk',
  whatsapp: process.env.EXPO_PUBLIC_WHATSAPP_URL || 'https://whatsapp.com/channel/0029VbDLPdA5PO0vpqzBbY1q',
  telegram: process.env.EXPO_PUBLIC_TELEGRAM_URL || 'https://t.me/gotham_city_telegram',
  github: process.env.EXPO_PUBLIC_GITHUB_URL || 'https://github.com',
};

export const openSocialLink = async (url: string, platformName: string = 'Link') => {
  if (!url) {
    Alert.alert('Link unavailable', `The ${platformName} link is currently not set.`);
    return;
  }

  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        await Linking.openURL(url);
      }
    }
  } catch (error) {
    console.error(`[SocialLinks] Error opening ${platformName} URL (${url}):`, error);
    if (Platform.OS !== 'web') {
      Alert.alert('Error', `Unable to open ${platformName} link.`);
    }
  }
};
