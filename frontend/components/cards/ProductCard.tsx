import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../theme/colors';
import { useRouter } from 'expo-router';
import { SafeImage } from '../ui/SafeImage';

interface ProductCardProps {
  product: any;
}

export const ProductCard = React.memo(({ product }: ProductCardProps) => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isPhone = width <= 480;

  const handlePress = () => {
    router.push(`/product/${product._id}`);
  };

  const imageUrl = product.images?.[0];

  return (
    <TouchableOpacity style={[styles.card, isPhone && styles.phoneCard]} onPress={handlePress} activeOpacity={0.9}>
      <SafeImage uri={imageUrl} style={[styles.image, isPhone && styles.phoneImage]} resizeMode="cover" />

      <View style={[styles.content, isPhone && styles.phoneContent]}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{product.title}</Text>
          <Text style={styles.price}>₹{product.price}</Text>
        </View>

        <Text style={styles.category}>{product.category} • {product.condition}</Text>

        <View style={styles.footer}>
          <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.college} numberOfLines={1}>{product.college || 'N/A'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
    marginBottom: SPACING.md,
  },
  phoneCard: {
    borderRadius: 14,
    marginBottom: 0,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.surface,
  },
  phoneImage: {
    height: 188,
  },
  content: {
    padding: SPACING.md,
  },
  phoneContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 15,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  price: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primary,
  },
  category: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  college: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: 4,
    flex: 1,
  },
});
