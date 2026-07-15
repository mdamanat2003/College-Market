import React from 'react';
import { Platform, StyleProp, StyleSheet, Text, View, ViewStyle, Image } from 'react-native';

type OoplabdhLogoProps = {
  compact?: boolean;
  markOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
};

const sizes = {
  sm: { mark: 30, text: 18, gap: 8, paddingH: 10, paddingV: 6 },
  md: { mark: 36, text: 21, gap: 10, paddingH: 14, paddingV: 8 },
  lg: { mark: 54, text: 40, gap: 16, paddingH: 40, paddingV: 20 },
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
      <View style={[styles.mark, { width: markSize, height: markSize, borderRadius: markSize * 0.28 }]}>
        <View
          style={{
            width: markSize * 0.72,
            height: markSize * 0.72,
            borderRadius: (markSize * 0.72) / 2,
            borderWidth: markSize * 0.18,
            borderLeftColor: '#F59E0B', // Golden
            borderTopColor: '#1E3A8A',  // Dark Blue
            borderRightColor: '#38BDF8', // Light Blue (Image 2 color)
            borderBottomColor: '#000000', // Black
            transform: [{ rotate: '-30deg' }],
            position: 'absolute',
            left: markSize * 0.14,
            top: markSize * 0.14,
          }}
        />
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
  web: { boxShadow: '0 0 12px rgba(255, 255, 255, 0.15)' } as ViewStyle,
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
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    position: 'relative',
    ...markGlow,
  },
  crescentLeft: {},
  crescentRight: {},
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
