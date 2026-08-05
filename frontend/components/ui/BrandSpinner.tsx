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

  // Calculate precise concentric dimensions & centered offsets
  const logoSize = size;
  // 54% of logo size perfectly covers the inner book badge while keeping outer gold & black ring visible
  const bookSize = Math.round(logoSize * 0.54);
  const bookOffset = (logoSize - bookSize) / 2;

  const rotatingStyle = Platform.OS === 'web'
    ? ({ animation: 'brandSpin 1.8s linear infinite', transformOrigin: 'center center' } as any)
    : { transform: [{ rotate: spin }] };

  return (
    <View style={[styles.container, style]}>
      <View style={{ width: logoSize, height: logoSize, position: 'relative' }}>
        
        {/* === LAYER 1: ROTATING OUTER GOLD (#C99A2E) & BLACK RING === */}
        <Animated.View
          style={[
            styles.rotatingRingLayer,
            {
              width: logoSize,
              height: logoSize,
              borderRadius: logoSize / 2,
              top: 0,
              left: 0,
            },
            rotatingStyle,
          ]}
        >
          <Image
            source={require('../../assets/images/ooplabdh-logo.png')}
            style={{ width: logoSize, height: logoSize, borderRadius: logoSize / 2 }}
            resizeMode="cover"
          />
        </Animated.View>

        {/* === LAYER 2: 100% FIXED CENTER BOOK ICON === */}
        <View
          style={[
            styles.fixedBookLayer,
            {
              width: bookSize,
              height: bookSize,
              borderRadius: bookSize / 2,
              top: bookOffset,
              left: bookOffset,
            },
          ]}
        >
          {/* Exact center book portion cropped from the original logo, perfectly aligned */}
          <Image
            source={require('../../assets/images/ooplabdh-logo.png')}
            style={{
              width: logoSize,
              height: logoSize,
              position: 'absolute',
              top: -bookOffset,
              left: -bookOffset,
            }}
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
  rotatingRingLayer: {
    position: 'absolute',
    overflow: 'hidden',
    zIndex: 1,
  },
  fixedBookLayer: {
    position: 'absolute',
    overflow: 'hidden',
    zIndex: 10,
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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





