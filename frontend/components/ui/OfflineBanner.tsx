import React, { useEffect, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '@/theme/colors';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(false);
  const translateY = useState(new Animated.Value(-60))[0];

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      setIsOffline(!navigator.onLine);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isOffline ? 0 : -60,
      duration: 300,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [isOffline]);

  if (!isOffline) return null;

  return (
    <Animated.View style={[styles.bannerContainer, { transform: [{ translateY }] }]}>
      <View style={styles.bannerContent}>
        <Ionicons name="wifi-outline" size={16} color="#FFF" style={{ marginRight: 6 }} />
        <Text style={styles.bannerText}>Low / Offline Connection — Showing cached campus data</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 10 : 36,
    left: 0,
    right: 0,
    zIndex: 99998,
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D97706', // Amber 600
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.round,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  bannerText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
