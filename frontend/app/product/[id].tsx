import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, 
  TouchableOpacity, ActivityIndicator, useWindowDimensions, Platform 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useChatStore } from '../../store/chatStore';
import { useProductStore } from '../../store/productStore';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { PlaceholderImage } from '../../components/ui/PlaceholderImage';
import { COLORS, SPACING, RADIUS } from '../../theme/colors';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { fetchProductById, isLoading, toggleWishlist } = useProductStore();
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();
  const { startConversation } = useChatStore();

  const [product, setProduct] = useState<any>(null);
  const [isChatStarting, setIsChatStarting] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  
  // Carousel ki width dynamically set karne ke liye (Web aur Mobile dono par perfect chalega)
  const [carouselWidth, setCarouselWidth] = useState(width);

  const isWebLarge = Platform.OS === 'web' && width > 768;

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;

      setLoadFailed(false);
      const data = await fetchProductById(id as string);
      if (!data) {
        setProduct(null);
        setLoadFailed(true);
        return;
      }

      setProduct(data);

      if (data && user) {
        const wishlistIds = Array.isArray(data.wishlistedBy) ? data.wishlistedBy : [];
        const wishlisted = wishlistIds.some((wishlistedUserId: any) => wishlistedUserId?.toString() === user._id);
        setIsWishlisted(wishlisted);
      }
    };

    loadProduct();
  }, [id, fetchProductById, user]);

  if (isLoading && !loadFailed) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (loadFailed || !product) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={styles.unavailableTitle}>Product unavailable</Text>
        <Text style={styles.unavailableText}>This listing or its seller account is no longer available.</Text>
        <Button title="Go back" onPress={() => router.back()} variant="outline" />
      </View>
    );
  }

  const sellerId = typeof product.seller === 'object' ? product.seller?._id : product.seller;
  const isOwner = user?._id === sellerId;
  const canChat = Boolean(sellerId) && !isOwner;
  
  // Ab humein array of images chahiye
  const images = product.images || [];

  const handleWishlist = async () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }

    setIsWishlistLoading(true);
    const previousState = isWishlisted;
    setIsWishlisted((current) => !current);

    try {
      const result = await toggleWishlist(product._id);
      if (result === null) {
        setIsWishlisted(previousState);
      } else {
        setIsWishlisted(result);
      }
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleChat = async () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    if (!sellerId) return;

    setIsChatStarting(true);
    try {
      const conversationId = await startConversation(product._id, sellerId);
      if (conversationId) {
        router.push(`/chat/${conversationId}`);
      }
    } finally {
      setIsChatStarting(false);
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    router.push(`/checkout/${product._id}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{product.title}</Text>
        <TouchableOpacity onPress={handleWishlist} style={styles.backBtn} disabled={isWishlistLoading}>
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={24}
            color={isWishlisted ? 'red' : COLORS.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.mainLayout, isWebLarge && styles.mainLayoutWeb]}>
          
          {/* 👇 SWIPEABLE IMAGE CAROUSEL SECTION 👇 */}
          <View 
            style={[styles.imageSection, isWebLarge && { flex: 1 }]}
            onLayout={(e) => setCarouselWidth(e.nativeEvent.layout.width)}
          >
            <ScrollView 
              horizontal 
              pagingEnabled 
              showsHorizontalScrollIndicator={false}
              snapToInterval={carouselWidth}
              decelerationRate="fast"
            >
              {images.length > 0 ? (
                images.map((img: string, index: number) => (
                  <View key={index} style={{ width: carouselWidth, height: 400 }}>
                    <Image source={{ uri: img }} style={styles.mainImage} resizeMode="cover" />
                  </View>
                ))
              ) : (
                <View style={{ width: carouselWidth, height: 400 }}>
                  <PlaceholderImage style={styles.mainImage} size={42} />
                </View>
              )}
            </ScrollView>

            {/* Pagination Dots (Agar 1 se zyada images hain) */}
            {images.length > 1 && (
              <View style={styles.paginationContainer}>
                {images.map((_: any, index: number) => (
                  <View key={index} style={styles.dot} />
                ))}
              </View>
            )}
          </View>
          {/* 👆 CAROUSEL END 👆 */}

          <View style={[styles.detailsSection, isWebLarge && { flex: 1, paddingLeft: SPACING.xl }]}>
            <Text style={styles.title}>{product.title}</Text>
            <Text style={styles.price}>₹{product.price}</Text>

            <View style={styles.badgesRow}>
              <View style={styles.badge}><Text style={styles.badgeText}>{product.category}</Text></View>
              <View style={styles.badge}><Text style={styles.badgeText}>{product.condition}</Text></View>
              <View style={styles.badgeLight}><Text style={styles.badgeTextDark}>{product.status}</Text></View>
            </View>

            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>

            <View style={styles.sellerCard}>
              <View style={styles.sellerAvatar}>
                <Text style={styles.sellerInitial}>{product.seller?.name?.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.sellerInfo}>
                <Text style={styles.sellerName}>{product.seller?.name}</Text>
                <View style={styles.sellerCollegeRow}>
                  <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
                  <Text style={styles.sellerCollege}>{product.seller?.college}</Text>
                </View>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={14} color="#F59E0B" />
                  <Text style={styles.ratingText}>
                    {product.seller?.rating ? `${Number(product.seller.rating).toFixed(1)} / 5` : 'No ratings yet'}
                  </Text>
                  {product.seller?.ratingCount ? (
                    <Text style={styles.ratingCountText}>({product.seller.ratingCount})</Text>
                  ) : null}
                </View>
              </View>
            </View>

            <View style={styles.actionContainer}>
              {canChat ? (
                <>
                  <Button title="Chat with Seller" variant="outline" onPress={handleChat} loading={isChatStarting} />
                  <Button title="Book Now (Escrow)" onPress={handleBuyNow} />
                </>
              ) : isOwner ? (
                <Button title="Edit Listing" onPress={() => console.log('Edit')} variant="outline" />
              ) : (
                <Button title="Seller unavailable" onPress={() => {}} variant="outline" disabled />
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  unavailableTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  unavailableText: { fontSize: 14, color: COLORS.textMuted, marginBottom: SPACING.lg, textAlign: 'center' },
  header: { height: 60, backgroundColor: COLORS.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border, zIndex: 10 },
  backBtn: { padding: SPACING.xs },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: COLORS.text, textAlign: 'center', marginHorizontal: SPACING.md },
  scrollContent: { padding: SPACING.lg, alignItems: 'center' },
  mainLayout: { width: '100%', maxWidth: 1200, flexDirection: 'column' },
  mainLayoutWeb: { flexDirection: 'row', alignItems: 'flex-start' },
  
  /* Naya Image Section Design */
  imageSection: { width: '100%', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, overflow: 'hidden', position: 'relative' },
  mainImage: { width: '100%', height: '100%' },
  paginationContainer: { position: 'absolute', bottom: 15, width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.9)', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.5, shadowRadius: 2, elevation: 3 },
  /* ---------------------- */

  detailsSection: { width: '100%', marginTop: SPACING.lg },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  price: { fontSize: 32, fontWeight: '800', color: COLORS.primary, marginBottom: SPACING.md },
  badgesRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  badge: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.round },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  badgeLight: { backgroundColor: COLORS.surface, paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.round, borderWidth: 1, borderColor: COLORS.border },
  badgeTextDark: { color: COLORS.text, fontSize: 12, fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  description: { fontSize: 15, color: COLORS.textMuted, lineHeight: 24, marginBottom: SPACING.xl },
  sellerCard: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, backgroundColor: COLORS.card, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.xl },
  sellerAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.accent, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  sellerInitial: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  sellerInfo: { flex: 1 },
  sellerName: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  sellerCollegeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  sellerCollege: { fontSize: 14, color: COLORS.textMuted },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6, flexWrap: 'wrap' },
  ratingText: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  ratingCountText: { fontSize: 12, color: COLORS.textMuted },
  actionContainer: { gap: SPACING.md },
});
