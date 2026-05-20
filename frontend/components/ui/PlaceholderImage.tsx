import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '../../theme/colors';

type PlaceholderImageProps = {
  label?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function PlaceholderImage({ label = 'No image', size = 28, style }: PlaceholderImageProps) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="image-outline" size={size} color={COLORS.textMuted} />
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  label: {
    color: COLORS.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
});
