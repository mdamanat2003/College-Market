import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useToastStore, ToastType } from '@/store/toastStore';
import { COLORS, RADIUS, SPACING } from '@/theme/colors';

const getToastConfig = (type: ToastType = 'info', iconOverride?: string) => {
  switch (type) {
    case 'success':
      return {
        borderColor: COLORS.success,
        iconName: (iconOverride || 'checkmark-circle-outline') as any,
        iconColor: COLORS.success,
      };
    case 'warning':
      return {
        borderColor: COLORS.warning,
        iconName: (iconOverride || 'warning-outline') as any,
        iconColor: COLORS.warning,
      };
    case 'error':
      return {
        borderColor: COLORS.danger,
        iconName: (iconOverride || 'alert-circle-outline') as any,
        iconColor: COLORS.danger,
      };
    case 'info':
    default:
      return {
        borderColor: COLORS.accent,
        iconName: (iconOverride || 'notifications-outline') as any,
        iconColor: COLORS.accent,
      };
  }
};

export const NotificationToast: React.FC = () => {
  const { currentToast, hideToast } = useToastStore();
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (currentToast) {
      // Slide Down Entrance
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();

      // Auto Dismiss Timer
      const timer = setTimeout(() => {
        dismissToast();
      }, currentToast.duration || 4000);

      return () => clearTimeout(timer);
    } else {
      translateY.setValue(-120);
      opacity.setValue(0);
    }
  }, [currentToast]);

  const dismissToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      hideToast();
    });
  };

  if (!currentToast) return null;

  const { title, message, type, icon, onPress } = currentToast;
  const config = getToastConfig(type, icon);

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
    dismissToast();
  };

  return (
    <View pointerEvents="box-none" style={styles.overlayContainer}>
      <Animated.View
        style={[
          styles.toastCard,
          { borderColor: config.borderColor },
          {
            transform: [{ translateY }],
            opacity,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.touchArea}
          onPress={handlePress}
        >
          <View style={[styles.iconBox, { backgroundColor: `${config.iconColor}18` }]}>
            <Ionicons name={config.iconName} size={22} color={config.iconColor} />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.titleText} numberOfLines={1}>
              {title}
            </Text>
            <Text style={styles.messageText} numberOfLines={2}>
              {message}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeBtn} onPress={dismissToast} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="close" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : Platform.OS === 'web' ? 20 : 40,
    left: 0,
    right: 0,
    zIndex: 99999,
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  toastCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#18181b', // Zinc 900
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  touchArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.sm + 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm + 4,
  },
  textContainer: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  titleText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  messageText: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  closeBtn: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});
