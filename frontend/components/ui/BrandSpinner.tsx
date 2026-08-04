import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View, Platform, Image, StyleProp, ViewStyle } from 'react-native';
import { COLORS } from '../../theme/colors';

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
    const animation = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: Platform.OS !== 'web',
      })
    );
    animation.start();
    return () => animation.stop();
  }, [spinValue]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Calculate inner stationary book overlay size & offset
  const innerSize = Math.round(size * 0.48);
  const offset = (size - innerSize) / 2;

  const webSpinProps = Platform.OS === 'web' ? { className: 'brand-spinner-spin' } : {};

  return (
    <View style={[styles.container, style]}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        
        {/* === 1. ROTATING OUTER LOGO IMAGE (OUTER GOLD & BLACK CRESCENT RING SPINS 360°) === */}
        <Animated.View
          {...webSpinProps}
          style={[
            styles.rotatingOuter,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              transform: [{ rotate: spin }],
            },
          ]}
        >
          <Image
            source={require('../../assets/images/ooplabdh-logo.png')}
            style={{ width: size, height: size, borderRadius: size / 2 }}
            resizeMode="cover"
          />
        </Animated.View>

        {/* === 2. STATIONARY INNER BOOK (FIXED IN CENTER FROM EXACT SAME LOGO IMAGE) === */}
        <View
          style={[
            styles.stationaryInner,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
            },
          ]}
        >
          <Image
            source={require('../../assets/images/ooplabdh-logo.png')}
            style={{
              width: size,
              height: size,
              position: 'absolute',
              top: -offset,
              left: -offset,
            }}
            resizeMode="cover"
          />
        </View>

      </View>

      {showLabel && label ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rotatingOuter: {
    position: 'absolute',
    overflow: 'hidden',
  },
  stationaryInner: {
    position: 'absolute',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 5,
  },
  label: {
    marginTop: 18,
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.2,
  },
});
