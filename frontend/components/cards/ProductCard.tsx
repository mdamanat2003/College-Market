import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../theme/colors';
import { useRouter } from 'expo-router';
import { PlaceholderImage } from '../ui/PlaceholderImage';

interface ProductCardProps {
  product: any;
  // onPress hata diya gaya hai kyunki routing ab yahi handle hogi
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const router = useRouter();

  const handlePress = () => {
    // Dynamic URL par navigate karna
    router.push(`/product/${product._id}`);
  };

  const imageUrl = product.images?.[0];

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.9}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <PlaceholderImage style={styles.image} />
      )}
      
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{product.title}</Text>
          <Text style={styles.price}>₹{product.price}</Text>
        </View>
        
        <Text style={styles.category}>{product.category} • {product.condition}</Text>
        
        <View style={styles.footer}>
          <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.college} numberOfLines={1}>{product.college}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

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
  image: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.surface,
  },
  content: {
    padding: SPACING.md,
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
    fontSize: 18,
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
  }
});
