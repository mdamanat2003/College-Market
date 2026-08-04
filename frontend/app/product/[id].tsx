import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, 
  TouchableOpacity, ActivityIndicator, useWindowDimensions, Platform, Alert,
  Modal, TextInput, Image
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useChatStore } from '../../store/chatStore';
import { useProductStore } from '../../store/productStore';
import { useAuthStore } from '../../store/authStore';
import { useDemoRestriction } from '../../hooks/use-demo-restriction';
import { Button } from '../../components/ui/Button';
import { PlaceholderImage } from '../../components/ui/PlaceholderImage';
import { SafeImage } from '../../components/ui/SafeImage';
import { compressImage } from '../../utils/imageCompressor';
import { COLORS, SPACING, RADIUS } from '../../theme/colors';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { fetchProductById, isLoading, toggleWishlist, updateProduct, deleteProduct } = useProductStore();
  const { user } = useAuthStore();
  const { checkRestriction } = useDemoRestriction();
  const { width } = useWindowDimensions();
  const { startConversation } = useChatStore();

  const [product, setProduct] = useState<any>(null);
  const [isChatStarting, setIsChatStarting] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  // Edit Modal States
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editMarketPrice, setEditMarketPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editCondition, setEditCondition] = useState('');
  const [editStatus, setEditStatus] = useState('Available');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const categories = ['Electronics', 'Books', 'Furniture', 'Vehicles', 'Others'];
  const conditions = ['New', 'Like New', 'Good', 'Fair'];
  const statuses = ['Available', 'Sold', 'Reserved'];
  
  // Carousel ki width dynamically set karne ke liye
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

  if (isLoading && !loadFailed && !product) {
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
  
  const images = product.images || [];

  const handleWishlist = async () => {
    if (!checkRestriction('wishlist')) return;
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
    if (user && !user.isVerified) {
      Alert.alert('Verification Required', 'Your student account is not verified yet. Please wait for an admin to verify your College ID card.');
      return;
    }
    if (!checkRestriction('chat')) return;
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
    if (user && !user.isVerified) {
      Alert.alert('Verification Required', 'Your student account is not verified yet. Please wait for an admin to verify your College ID card.');
      return;
    }
    if (!checkRestriction('buy now')) return;
    if (!user) {
      router.push('/(auth)/login');
      return;
    }
    router.push(`/checkout/${product._id}`);
  };

  // Open Edit Modal & Populate Form
  const handleOpenEditModal = () => {
    setEditTitle(product.title || '');
    setEditPrice(product.price ? String(product.price) : '');
    setEditMarketPrice(product.marketPrice ? String(product.marketPrice) : '');
    setEditDescription(product.description || '');
    setEditCategory(product.category || 'Others');
    setEditCondition(product.condition || 'Good');
    setEditStatus(product.status || 'Available');
    setEditImages(product.images ? [...product.images] : []);
    setIsEditModalVisible(true);
  };

  const addImageToEditArray = (uri: string) => {
    if (editImages.length >= 3) {
      Alert.alert('Limit Reached', 'Maximum 3 photos allowed per listing.');
      return;
    }
    setEditImages([...editImages, uri]);
  };

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission Denied!', 'Gallery access is required.');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 1 * 1024 * 1024) {
        Alert.alert('File Too Large', 'Product image size should be less than 1MB.');
        return;
      }
      const compressedUri = await compressImage(asset.uri);
      addImageToEditArray(compressedUri);
    }
  };

  const addFromLink = () => {
    if (!linkInput.trim()) return;
    if (!linkInput.startsWith('http://') && !linkInput.startsWith('https://')) {
      Alert.alert('Invalid URL', 'Please enter a valid URL starting with http:// or https://');
      return;
    }
    addImageToEditArray(linkInput.trim());
    setLinkInput('');
  };

  const removeEditImage = (indexToRemove: number) => {
    setEditImages(editImages.filter((_, index) => index !== indexToRemove));
  };

  // Submit Listing Edits
  const handleSaveListing = async () => {
    if (!editTitle.trim()) return Alert.alert('Error', 'Product title is required.');
    if (!editPrice.trim() || isNaN(Number(editPrice))) return Alert.alert('Error', 'Please enter a valid selling price.');
    if (!editDescription.trim()) return Alert.alert('Error', 'Product description is required.');
    if (editImages.length === 0) return Alert.alert('Error', 'Please provide at least 1 product image.');

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', editTitle.trim());
      formData.append('price', editPrice.trim());
      if (editMarketPrice.trim()) formData.append('marketPrice', editMarketPrice.trim());
      formData.append('description', editDescription.trim());
      formData.append('category', editCategory);
      formData.append('condition', editCondition);
      formData.append('status', editStatus);

      for (let i = 0; i < editImages.length; i++) {
        const uri = editImages[i];
        const isExistingUrl = uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('/uploads') || uri.startsWith('data:image');
        
        if (isExistingUrl) {
          formData.append('imageLinks', uri);
        } else {
          let filename = uri.split('/').pop() || `image_${i}.jpg`;
          if (!filename.includes('.')) filename += '.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image/jpeg`;

          if (Platform.OS === 'web') {
            try {
              const response = await fetch(uri);
              const blob = await response.blob();
              formData.append('productImages', blob, filename);
            } catch (fetchErr) {
              console.warn("Blob conversion failed, passing URI directly:", fetchErr);
              formData.append('imageLinks', uri);
            }
          } else {
            formData.append('productImages', {
              uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
              name: filename,
              type,
            } as any);
          }
        }
      }

      const success = await updateProduct(product._id, formData);
      if (success) {
        Alert.alert('Success', 'Listing updated successfully!');
        setIsEditModalVisible(false);
        // Refresh local product view
        const updatedData = await fetchProductById(product._id);
        if (updatedData) setProduct(updatedData);
      } else {
        const errorMsg = useProductStore.getState().error || 'Failed to update listing. Please try again.';
        Alert.alert('Update Failed', errorMsg);
      }
    } catch (err: any) {
      console.error('Update product error:', err);
      Alert.alert('Error', err?.message || 'Something went wrong while saving changes.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Listing Confirmation
  const handleDeleteListing = () => {
    Alert.alert(
      'Delete Listing',
      'Are you sure you want to permanently delete this product listing?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              const success = await deleteProduct(product._id);
              if (success) {
                Alert.alert('Deleted', 'Your listing has been deleted.');
                setIsEditModalVisible(false);
                router.replace('/(tabs)/marketplace');
              } else {
                Alert.alert('Error', 'Failed to delete listing.');
              }
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
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
          
          {/* SWIPEABLE IMAGE CAROUSEL SECTION */}
          {(() => {
            const carouselHeight = width <= 560 ? 280 : 400;
            return (
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
                      <View key={index} style={{ width: carouselWidth, height: carouselHeight }}>
                        <SafeImage uri={img} style={styles.mainImage} resizeMode="contain" />
                      </View>
                    ))
                  ) : (
                    <View style={{ width: carouselWidth, height: carouselHeight }}>
                      <PlaceholderImage style={styles.mainImage} size={42} />
                    </View>
                  )}
                </ScrollView>

                {images.length > 1 && (
                  <View style={styles.paginationContainer}>
                    {images.map((_: any, index: number) => (
                      <View key={index} style={styles.dot} />
                    ))}
                  </View>
                )}
              </View>
            );
          })()}

          <View style={[styles.detailsSection, isWebLarge && { flex: 1, paddingLeft: SPACING.xl }]}>
            <Text style={styles.title}>{product.title}</Text>
            <View style={styles.priceRow}>
              <Text style={styles.price}>₹{product.price}</Text>
              {product.marketPrice ? (
                <Text style={styles.marketPrice}>₹{product.marketPrice}</Text>
              ) : null}
            </View>

            <View style={styles.badgesRow}>
              <View style={styles.badge}><Text style={styles.badgeText}>{product.category}</Text></View>
              <View style={styles.badge}><Text style={styles.badgeText}>{product.condition}</Text></View>
              <View style={[styles.badgeLight, product.status === 'Sold' && { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}><Text style={[styles.badgeTextDark, product.status === 'Sold' && { color: COLORS.danger }]}>{product.status}</Text></View>
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
                <Button title="Edit Listing" onPress={handleOpenEditModal} variant="outline" />
              ) : (
                <Button title="Seller unavailable" onPress={() => {}} variant="outline" disabled />
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* EDIT PRODUCT MODAL */}
      <Modal visible={isEditModalVisible} transparent={true} animationType="slide" onRequestClose={() => setIsEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Product Listing</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              {/* Product Status Selector */}
              <Text style={styles.inputLabel}>Status</Text>
              <View style={styles.chipRow}>
                {statuses.map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.chip, editStatus === st && styles.chipActive]}
                    onPress={() => setEditStatus(st)}
                  >
                    <Text style={[styles.chipText, editStatus === st && styles.chipTextActive]}>{st}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Title */}
              <Text style={styles.inputLabel}>Product Title *</Text>
              <TextInput
                style={styles.textInput}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="e.g. Scientific Calculator FX-991EX"
                placeholderTextColor={COLORS.textMuted}
              />

              {/* Price & Market Price */}
              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: SPACING.xs }}>
                  <Text style={styles.inputLabel}>Selling Price (₹) *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editPrice}
                    onChangeText={setEditPrice}
                    keyboardType="numeric"
                    placeholder="e.g. 500"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: SPACING.xs }}>
                  <Text style={styles.inputLabel}>Market Price (₹)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={editMarketPrice}
                    onChangeText={setEditMarketPrice}
                    keyboardType="numeric"
                    placeholder="e.g. 1200"
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>
              </View>

              {/* Category */}
              <Text style={styles.inputLabel}>Category *</Text>
              <View style={styles.chipRow}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, editCategory === cat && styles.chipActive]}
                    onPress={() => setEditCategory(cat)}
                  >
                    <Text style={[styles.chipText, editCategory === cat && styles.chipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Condition */}
              <Text style={styles.inputLabel}>Condition *</Text>
              <View style={styles.chipRow}>
                {conditions.map((cond) => (
                  <TouchableOpacity
                    key={cond}
                    style={[styles.chip, editCondition === cond && styles.chipActive]}
                    onPress={() => setEditCondition(cond)}
                  >
                    <Text style={[styles.chipText, editCondition === cond && styles.chipTextActive]}>{cond}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Description */}
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={editDescription}
                onChangeText={setEditDescription}
                multiline
                numberOfLines={4}
                placeholder="Describe your item..."
                placeholderTextColor={COLORS.textMuted}
              />

              {/* Images Manager */}
              <Text style={styles.inputLabel}>Product Images (Max 3)</Text>
              <View style={styles.imageThumbnailsRow}>
                {editImages.map((uri, idx) => (
                  <View key={idx} style={styles.thumbContainer}>
                    <Image source={{ uri }} style={styles.thumbImage} />
                    <TouchableOpacity style={styles.removeThumbBtn} onPress={() => removeEditImage(idx)}>
                      <Ionicons name="close-circle" size={22} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              {editImages.length < 3 && (
                <View style={styles.addImageActions}>
                  <TouchableOpacity style={styles.pickImageBtn} onPress={pickImageFromGallery}>
                    <Ionicons name="image-outline" size={18} color={COLORS.accent} />
                    <Text style={styles.pickImageBtnText}>Choose Photo</Text>
                  </TouchableOpacity>

                  <View style={styles.linkRow}>
                    <TextInput
                      style={[styles.textInput, { flex: 1, marginBottom: 0 }]}
                      value={linkInput}
                      onChangeText={setLinkInput}
                      placeholder="Paste Image URL..."
                      placeholderTextColor={COLORS.textMuted}
                    />
                    <TouchableOpacity style={styles.addLinkBtn} onPress={addFromLink}>
                      <Text style={styles.addLinkBtnText}>Add URL</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={handleDeleteListing}
                disabled={isSaving || isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator color={COLORS.danger} size="small" />
                ) : (
                  <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                )}
              </TouchableOpacity>

              <View style={styles.modalFooterRight}>
                <TouchableOpacity
                  style={styles.cancelModalBtn}
                  onPress={() => setIsEditModalVisible(false)}
                  disabled={isSaving || isDeleting}
                >
                  <Text style={styles.cancelModalBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveModalBtn, isSaving && { opacity: 0.7 }]}
                  onPress={handleSaveListing}
                  disabled={isSaving || isDeleting}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.saveModalBtnText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

          </View>
        </View>
      </Modal>
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
  
  imageSection: { width: '100%', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, overflow: 'hidden', position: 'relative' },
  mainImage: { width: '100%', height: '100%' },
  paginationContainer: { position: 'absolute', bottom: 15, width: '100%', flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255, 255, 255, 0.9)', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.5, shadowRadius: 2, elevation: 3 },

  detailsSection: { width: '100%', marginTop: SPACING.lg },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
    marginBottom: SPACING.md,
  },
  price: { fontSize: 32, fontWeight: '800', color: COLORS.accent },
  marketPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
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

  /* Modal Styles */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: SPACING.md },
  modalContainer: { width: '100%', maxWidth: 550, maxHeight: '90%', backgroundColor: COLORS.card, borderRadius: RADIUS.lg, overflow: 'hidden', flexDirection: 'column' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  modalCloseBtn: { padding: 4 },
  modalBody: { padding: SPACING.lg },
  inputLabel: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6, marginTop: SPACING.xs },
  textInput: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.sm, paddingHorizontal: SPACING.md, paddingVertical: 10, fontSize: 14, color: COLORS.text, marginBottom: SPACING.md },
  textArea: { height: 90, textAlignVertical: 'top' },
  rowInputs: { flexDirection: 'row', width: '100%' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: SPACING.md },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.round, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  chipText: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  chipTextActive: { color: '#09090b', fontWeight: '700' },
  imageThumbnailsRow: { flexDirection: 'row', gap: 12, marginBottom: SPACING.md },
  thumbContainer: { position: 'relative', width: 70, height: 70, borderRadius: RADIUS.sm, overflow: 'hidden' },
  thumbImage: { width: '100%', height: '100%' },
  removeThumbBtn: { position: 'absolute', top: 2, right: 2, backgroundColor: '#fff', borderRadius: 12 },
  addImageActions: { marginBottom: SPACING.md },
  pickImageBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.accent, borderRadius: RADIUS.sm, marginBottom: SPACING.sm },
  pickImageBtnText: { color: COLORS.accent, fontSize: 14, fontWeight: '600' },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  addLinkBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 14, paddingVertical: 11, borderRadius: RADIUS.sm },
  addLinkBtnText: { color: '#09090b', fontSize: 13, fontWeight: '700' },
  modalFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.card },
  deleteBtn: { width: 42, height: 42, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.danger, justifyContent: 'center', alignItems: 'center' },
  modalFooterRight: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  cancelModalBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  cancelModalBtnText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
  saveModalBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 20, paddingVertical: 10, borderRadius: RADIUS.sm },
  saveModalBtnText: { color: '#09090b', fontSize: 14, fontWeight: '700' },
});
