import React from 'react';
import { Platform, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

type OoplabdhLogoProps = {
  compact?: boolean;
  markOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
};

const sizes = {
  sm: { mark: 34, text: 20, gap: 10, paddingH: 12, paddingV: 8 },
  md: { mark: 42, text: 24, gap: 12, paddingH: 16, paddingV: 10 },
  lg: { mark: 64, text: 48, gap: 20, paddingH: 48, paddingV: 24 },
};

export function OoplabdhLogo({ compact = false, markOnly = false, size = 'md', style }: OoplabdhLogoProps) {
  const token = sizes[size];
  const markSize = compact ? Math.min(token.mark, 36) : token.mark;
  const textSize = compact ? Math.min(token.text, 20) : token.text;

  return (
    <View
      style={[
        styles.container,
        {
          gap: compact ? 8 : token.gap,
          paddingHorizontal: markOnly ? 0 : token.paddingH,
          paddingVertical: markOnly ? 0 : token.paddingV,
        },
        markOnly && styles.markOnlyContainer,
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel="Ooplabdh logo"
    >
      <View style={[styles.mark, { width: markSize, height: markSize, borderRadius: markSize / 2 }]}>
        <View style={[styles.orbit, { borderRadius: markSize / 2 }]} />
        <View style={[styles.boltTop, { borderLeftWidth: markSize * 0.22, borderRightWidth: markSize * 0.09, borderBottomWidth: markSize * 0.48 }]} />
        <View style={[styles.boltBottom, { borderLeftWidth: markSize * 0.09, borderRightWidth: markSize * 0.22, borderTopWidth: markSize * 0.48 }]} />
      </View>

      {!markOnly && (
        <Text style={[styles.wordmark, { fontSize: textSize, lineHeight: Math.round(textSize * 1.12) }]} numberOfLines={1}>
          Ooplabdh<Text style={styles.dot}>.</Text>
        </Text>
      )}
    </View>
  );
}

const webShadow = Platform.select({
  web: {
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(10px)',
  } as ViewStyle,
  default: {},
});

const nativeShadow = Platform.select({
  web: {},
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.28,
    shadowRadius: 40,
    elevation: 8,
  } as ViewStyle,
});

const markGlow = Platform.select({
  web: { boxShadow: '0 0 18px rgba(245, 158, 11, 0.38)' } as ViewStyle,
  default: {},
});

const dotGlow = Platform.select({
  web: { textShadow: '0 0 15px rgba(245, 158, 11, 0.6)' },
  default: {
    textShadowColor: 'rgba(245, 158, 11, 0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    maxWidth: '100%',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(11,15,25,0.94)',
    ...nativeShadow,
    ...webShadow,
  },
  markOnlyContainer: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    ...Platform.select({
      web: { boxShadow: 'none' } as ViewStyle,
      default: { shadowOpacity: 0, elevation: 0 } as ViewStyle,
    }),
  },
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: '#1E293B',
    backgroundColor: '#0B0F19',
    ...markGlow,
  },
  orbit: {
    position: 'absolute',
    top: 2,
    right: 2,
    bottom: 2,
    left: 2,
    borderWidth: 2,
    borderTopColor: '#FDE047',
    borderRightColor: 'transparent',
    borderBottomColor: '#F59E0B',
    borderLeftColor: 'transparent',
    transform: [{ rotate: '-24deg' }],
  },
  boltTop: {
    position: 'absolute',
    top: '19%',
    left: '31%',
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FDE047',
    transform: [{ skewX: '-18deg' }],
  },
  boltBottom: {
    position: 'absolute',
    bottom: '15%',
    right: '25%',
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#F59E0B',
    transform: [{ skewX: '-18deg' }],
  },
  wordmark: {
    flexShrink: 1,
    color: '#FFFFFF',
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: 0,
  },
  dot: {
    color: '#F59E0B',
    ...dotGlow,
  },
});
