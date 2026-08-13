import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View, Platform, Image, StyleProp, ViewStyle } from 'react-native';

type BrandSpinnerProps = {
  size?: number;
  label?: string;
  showLabel?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function BrandSpinner({
  size = 90,
  label = 'Ooplabdh',
  showLabel = false,
  style,
}: BrandSpinnerProps) {
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (Platform.OS !== 'web') {
      const spinAnim = Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spinAnim.start();
      return () => spinAnim.stop();
    }
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const logoSize = size;
  const ringSize = Math.round(size * 1.18);

  const rotatingStyle = Platform.OS === 'web'
    ? ({ animation: 'brandSpin 1.8s linear infinite', transformOrigin: 'center center' } as any)
    : { transform: [{ rotate: spin }] };

  return (
    <View style={[styles.container, style]}>
      <View style={{ width: ringSize, height: ringSize, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        
        {/* === SINGLE CLEAN ROTATING ACCENT SPINNER HALO (OUTER RING) === */}
        <Animated.View
          style={[
            styles.spinnerRing,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
            },
            rotatingStyle,
          ]}
        />

        {/* === ORIGINAL UNIFIED OOPLABDH LOGO (NO OVERLAPPING CIRCLE LAYERS) === */}
        <View
          style={[
            styles.logoWrapper,
            {
              width: logoSize,
              height: logoSize,
              borderRadius: logoSize / 2,
            },
          ]}
        >
          <Image
            source={require('../../assets/images/ooplabdh-logo.png')}
            style={{ width: logoSize, height: logoSize, borderRadius: logoSize / 2 }}
            resizeMode="cover"
          />
        </View>

      </View>

      {showLabel && label ? (
        <View style={styles.labelWrapper}>
          <Text style={styles.label}>
            {label}
            <Text style={styles.dot}>.</Text>
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const dotGlow = Platform.select({
  web: { textShadow: '0 0 12px rgba(245, 158, 11, 0.8)' },
  default: {
    textShadowColor: 'rgba(245, 158, 11, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerRing: {
    position: 'absolute',
    borderWidth: 3,
    borderColor: 'transparent',
    borderTopColor: '#F59E0B',
    borderRightColor: '#38BDF8',
    zIndex: 1,
  },
  logoWrapper: {
    overflow: 'hidden',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  labelWrapper: {
    marginTop: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  dot: {
    color: '#F59E0B',
    ...dotGlow,
  },
});
