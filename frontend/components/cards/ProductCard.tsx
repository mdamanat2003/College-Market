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
      toValue: 1.02,
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
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scale, {
      toValue: isHovered ? 1.02 : 1,
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
    <Animated.View style={{ transform: [{ scale }], width: '100%', height: '100%' }}>
      <Pressable
        testID="product-card"
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
            borderColor: (isHovered || isPressed) ? 'rgba(56, 189, 248, 0.45)' : 'rgba(255, 255, 255, 0.08)',
          }
        ]}
      >
        <View style={styles.imageContainer}>
          <SafeImage 
            testID="product-image"
            uri={imageUrl} 
            style={[styles.image, isPhone && styles.phoneImage]} 
            resizeMode="cover" 
          />
        </View>

        <View style={[styles.content, isPhone && styles.phoneContent]}>
          <View style={styles.topSection}>
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
          </View>

          <View style={styles.footer}>
            <View style={styles.locationContainer}>
              <Ionicons name="location-outline" size={14} color="#94A3B8" />
              <Text style={styles.college} numberOfLines={1}>{product.college || 'N/A'}</Text>
            </View>
            <TouchableOpacity 
              testID="buy-btn"
              style={styles.buyButton} 
              onPress={handleBuyPress} 
              activeOpacity={0.8}
            >
              <Text style={styles.buyButtonText}>Buy</Text>
              <Ionicons name="chevron-forward" size={12} color="#09090b" />
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#18181b',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
      } as any,
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 4,
      },
    }),
  },
  phoneCard: {
    borderRadius: 16,
  },
  imageContainer: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'rgba(39, 39, 42, 0.5)',
  },
  image: {
    width: '100%',
    height: 235,
    backgroundColor: 'rgba(39, 39, 42, 0.5)',
  },
  phoneImage: {
    height: 205,
  },
  content: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
    gap: 12,
  },
  phoneContent: {
    padding: 14,
    gap: 10,
  },
  topSection: {
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    lineHeight: 22,
  },
  price: {
    fontSize: 19,
    fontWeight: '800',
    color: '#38BDF8',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  marketPrice: {
    fontSize: 12,
    color: 'rgba(148, 163, 184, 0.6)',
    textDecorationLine: 'line-through',
    marginTop: 1,
  },
  category: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  college: {
    fontSize: 12.5,
    color: '#94A3B8',
    marginLeft: 4,
    flex: 1,
    fontWeight: '500',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#38BDF8',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    gap: 4,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 10px rgba(56, 189, 248, 0.35)',
      } as any,
      default: {
        shadowColor: '#38BDF8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
      },
    }),
  },
  buyButtonText: {
    color: '#09090b',
    fontSize: 13,
    fontWeight: '800',
  },
});
