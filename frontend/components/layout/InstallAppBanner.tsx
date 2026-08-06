import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, RADIUS, SPACING } from '../../theme/colors';
import { OoplabdhLogo } from '../brand/OoplabdhLogo';
import { SOCKET_URL } from '../../services/api';

export function InstallAppBanner() {
  const { width } = useWindowDimensions();
  const [isVisible, setIsVisible] = useState(false);

  const isMobile = width < 768; // Standard mobile screen width

  useEffect(() => {
    // Show only on web environment and when width matches mobile devices
    if (Platform.OS !== 'web' || !isMobile) {
      setIsVisible(false);
      return;
    }

    const checkDismissState = async () => {
      try {
        const isDismissed = await AsyncStorage.getItem('installBannerDismissed');
        if (isDismissed !== 'true') {
          setIsVisible(true);
        }
      } catch (err) {
        // Fallback to visible if storage lookup fails
        setIsVisible(true);
      }
    };

    checkDismissState();
  }, [isMobile]);

  const handleDismiss = async () => {
    setIsVisible(false);
    try {
      await AsyncStorage.setItem('installBannerDismissed', 'true');
    } catch (err) {
      console.warn('Failed to save banner dismiss state:', err);
    }
  };

  const handleDownload = () => {
    // Construct APK URL hosted on backend server static folder
    const baseUrl = SOCKET_URL.replace(/\/$/, '');
    const apkUrl = `${baseUrl}/uploads/app-release.apk`;

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const link = document.createElement('a');
        link.href = apkUrl;
        link.download = 'app-release.apk';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch {
        window.location.href = apkUrl;
      }
    } else {
      Linking.openURL(apkUrl).catch((err) => {
        console.error('[InstallAppBanner] Failed to open APK download link:', err);
      });
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <View style={styles.bannerContainer}>
      <View style={styles.contentRow}>
        <View style={styles.leftSection}>
          <TouchableOpacity style={styles.closeButton} onPress={handleDismiss} activeOpacity={0.7}>
            <Ionicons name="close" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
          <View style={styles.logoWrapper}>
            <OoplabdhLogo size="sm" markOnly={true} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>Ooplabdh App</Text>
            <Text style={styles.subtitleText} numberOfLines={1}>
              Install our Android APK for the best experience!
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.downloadButton} onPress={handleDownload} activeOpacity={0.8}>
          <Ionicons name="cloud-download-outline" size={16} color="#09090b" style={styles.downloadIcon} />
          <Text style={styles.downloadButtonText}>Install</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(24, 24, 27, 0.95)', // Glassmorphic Zinc 900
    borderTopWidth: 1,
    borderTopColor: 'rgba(56, 189, 248, 0.25)', // Subtle Sky 400 outline
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 99999,
    // Web shadow and backdrop filter styling
    ...Platform.select({
      web: {
        boxShadow: '0 -10px 25px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(12px)',
      } as any,
    }),
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
    gap: 8,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  closeButton: {
    padding: 4,
    marginRight: -2,
  },
  logoWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitleText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent, // Sky 400 accent background
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: RADIUS.md,
  },
  downloadIcon: {
    marginRight: 6,
  },
  downloadButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#09090b', // Zinc 950 contrast text
  },
});
