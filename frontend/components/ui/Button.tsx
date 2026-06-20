import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../../theme/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  style?: any;
}

export const Button = ({ title, onPress, loading, variant = 'primary', disabled , style}: ButtonProps) => {
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        isOutline ? styles.outline : styles.primary,
        disabled && styles.disabled,
        style
      ]} 
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? COLORS.primary : COLORS.background} />
      ) : (
        <Text style={[
          styles.text, 
          isOutline ? styles.textOutline : styles.textPrimary
        ]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    width: '100%',
    marginVertical: SPACING.sm,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  textPrimary: {
    color: COLORS.background,
  },
  textOutline: {
    color: COLORS.text,
  }
});