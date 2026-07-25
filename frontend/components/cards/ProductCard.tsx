import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions, Pressable, Animated, Platform } from 'react-native';
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

  const scale = useRef(new Animated.Value(1)).current;
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = () => {
    router.push(`/product/${product._id}`);
  };

  const handleHoverIn = () => {
    setIsHovered(true);
    Animated.spring(scale, {
      toValue: 1.03,
      useNativeDriver: true,
    }).start();
  };

  const handleHoverOut = () => {
    setIsHovered(false);
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scale, {
      toValue: isHovered ? 1.03 : 1,
      useNativeDriver: true,
    }).start();
  };

  const handleBuyPress = (e: any) => {
    if (Platform.OS === 'web' && e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    router.push(`/checkout/${product._id}`);
  };

  const imageUrl = product.images?.[0];

  return (
    <Animated.View style={{ transform: [{ scale }], width: '100%' }}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        // @ts-ignore
        onHoverIn={Platform.OS === 'web' ? handleHoverIn : undefined}
        // @ts-ignore
        onHoverOut={Platform.OS === 'web' ? handleHoverOut : undefined}
        style={[
          styles.card,
          isPhone && styles.phoneCard,
          {
            borderColor: (isHovered || isPressed) ? 'rgba(56, 189, 248, 0.5)' : COLORS.border,
          }
        ]}
      >
        <SafeImage uri={imageUrl} style={[styles.image, isPhone && styles.phoneImage]} resizeMode="contain" />

        <View style={[styles.content, isPhone && styles.phoneContent]}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>{product.title}</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>₹{product.price}</Text>
              {product.marketPrice ? (
                <Text style={styles.marketPrice}>₹{product.marketPrice}</Text>
              ) : null}
            </View>
          </View>

          <Text style={styles.category}>{product.category} • {product.condition}</Text>

          <View style={styles.footer}>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.college} numberOfLines={1}>{product.college || 'N/A'}</Text>
            </View>
            <TouchableOpacity style={styles.buyButton} onPress={handleBuyPress} activeOpacity={0.8}>
              <Text style={styles.buyButtonText}>Buy</Text>
              <Ionicons name="chevron-forward" size={11} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Animated.View>
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
    alignItems: 'flex-start',
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
    color: COLORS.accent,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  marketPrice: {
    fontSize: 12,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  category: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  college: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: 4,
    flex: 1,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    gap: 2,
  },
  buyButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
  },
});
