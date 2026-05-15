import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '../../store/chatStore';

import { useProductStore } from '../../store/productStore';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { COLORS, SPACING, RADIUS } from '../../theme/colors';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { fetchProductById, isLoading } = useProductStore();
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();
  const { startConversation } = useChatStore();
  
  const [product, setProduct] = useState<any>(null);

  const isWebLarge = Platform.OS === 'web' && width > 768;

  useEffect(() => {
    const loadProduct = async () => {
      if (id) {
        const data = await fetchProductById(id as string);
        setProduct(data);
      }
    };
    loadProduct();
  }, [id, fetchProductById]);

  if (isLoading || !product) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isOwner = user?._id === product.seller?._id;
  const mainImage = product.images?.length > 0 ? product.images[0] : 'https://via.placeholder.com/600x400.png?text=No+Image';

  const handleChat = async () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    
    // Create or fetch conversation
    const conversationId = await startConversation(product._id, product.seller._id);
    
    if (conversationId) {
      // Navigate to chat room
      router.push(`/chat/${conversationId}`);
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    // Checkout screen par bhej do
    router.push(`/checkout/${product._id}`);
  };

  return (
    <View style={styles.container}>
      {/* Premium Sticky Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{product.title}</Text>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="heart-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.mainLayout, isWebLarge && styles.mainLayoutWeb]}>
          
          {/* Image Gallery Area */}
          <View style={[styles.imageSection, isWebLarge && { flex: 1 }]}>
            <Image source={{ uri: mainImage }} style={styles.mainImage} resizeMode="cover" />
          </View>

          {/* Product Details Area */}
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
                <Text style={styles.sellerCollege}><Ionicons name="location-outline" size={14} /> {product.seller?.college}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionContainer}>
              {!isOwner ? (
                <>
                  <Button title="Chat with Seller" variant="outline" onPress={handleChat} />
                  <Button title="Book Now (Escrow)" onPress={handleBuyNow} />
                </>
              ) : (
                <Button title="Edit Listing" onPress={() => console.log('Edit')} variant="outline" />
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
  header: { height: 60, backgroundColor: COLORS.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.border, zIndex: 10 },
  backBtn: { padding: SPACING.xs },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: COLORS.text, textAlign: 'center', marginHorizontal: SPACING.md },
  scrollContent: { padding: SPACING.lg, alignItems: 'center' },
  mainLayout: { width: '100%', maxWidth: 1200, flexDirection: 'column' },
  mainLayoutWeb: { flexDirection: 'row', alignItems: 'flex-start' },
  imageSection: { width: '100%', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, overflow: 'hidden' },
  mainImage: { width: '100%', height: 400 },
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
  sellerCollege: { fontSize: 14, color: COLORS.textMuted, marginTop: 2 },
  actionContainer: { gap: SPACING.md },
});
