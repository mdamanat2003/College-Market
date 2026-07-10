import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, Image, StyleSheet, 
  Alert, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore'; 
import { useDemoRestriction } from '../hooks/use-demo-restriction';
import { API_URL } from '../services/api';
import Footer from '../components/layout/Footer';
import { compressImage } from '../utils/imageCompressor';
import { COLORS, RADIUS, SPACING } from '../theme/colors';

export default function AddItemScreen() {
  const router = useRouter();
  const { accessToken } = useAuthStore(); 
  const { checkRestriction } = useDemoRestriction();

  // Form Fields States
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [marketPrice, setMarketPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(''); 
  const [condition, setCondition] = useState('Good'); 

  // Images & Validation States
  const [images, setImages] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const campusCategories = ['Electronics', 'Books', 'Furniture', 'Vehicles', 'Others'];

  const addImageToArray = (uri: string) => {
    if (images.length >= 3) {
      Alert.alert('Limit Reached', 'maximum 3 photos is allowed!');
      return;
    }
    setImages([...images, uri]);
    if (errors.images) setErrors({ ...errors, images: '' });
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission Denied!', 'Gallery access is required.');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1, // Start with high quality, then compress
    });

    if (!result.canceled) {
      const compressedUri = await compressImage(result.assets[0].uri);
      addImageToArray(compressedUri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission Denied!', 'Camera access is required.');

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1, // Start with high quality, then compress
    });

    if (!result.canceled) {
      const compressedUri = await compressImage(result.assets[0].uri);
      addImageToArray(compressedUri);
    }
  };

  const addFromLink = () => {
    if (!linkInput) return;
    if (!linkInput.startsWith('http://') && !linkInput.startsWith('https://')) {
      Alert.alert('Invalid Link', 'please, enter valid URL (http:// or start with https:// ).');
      return;
    }
    addImageToArray(linkInput);
    setLinkInput('');
  };

  const removeImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  // 👇 VALIDATION LOGIC INCLUDED 👇
  // 👇 API CALL TO SERVER 👇
  const handleSubmit = async () => {
    if (!checkRestriction('product add')) return;
    
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) newErrors.title = 'Product title is required';
    if (!price.trim()) newErrors.price = 'Price is required';
    if (!category) newErrors.category = 'Please select a category';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (images.length === 0) newErrors.images = 'Please upload at least 1 photo or paste a link';

    if (marketPrice.trim() && isNaN(Number(marketPrice))) {
      newErrors.marketPrice = 'Market price must be a valid number';
    } else if (marketPrice.trim() && price.trim() && Number(marketPrice) < Number(price)) {
      newErrors.marketPrice = 'Market price should be greater than or equal to selling price';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('price', price);
      if (marketPrice.trim()) {
        formData.append('marketPrice', marketPrice);
      }
      formData.append('description', description);
      formData.append('category', category);
      formData.append('condition', condition);

      // 🚨 NAYA LOGIC YAHAN HAI (for loop lagaya taaki await kaam kare) 🚨
      for (let i = 0; i < images.length; i++) {
        const imageUri = images[i];
        
        // Agar normal web link hai (http/https se shuru aur blob nahi)
        if ((imageUri.startsWith('http://') || imageUri.startsWith('https://')) && !imageUri.startsWith('blob:')) {
          formData.append(`imageLinks`, imageUri);
        } else {
          // Local file ya Web Blob URL
          let filename = imageUri.split('/').pop() || `image_${i}.jpg`;
          
          // 💡 YAHI THA CHOR: Agar web blob me extension nahi hai, toh add karo
          if (!filename.includes('.')) {
            filename = `image_${i}.jpg`;
          }

          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image/jpeg`;

          if (Platform.OS === 'web') {
            // 🌐 WEB FIX: Browser me URL ko Blob me convert karo
            const response = await fetch(imageUri);
            const blob = await response.blob();
            // Yahan filename pass karna zaroori hai jisme .jpg ho
            formData.append('productImages', blob, filename);
          } else {
            // 📱 MOBILE FIX: Expo me ye default tareeka chalta hai
            formData.append('productImages', {
              uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
              name: filename,
              type,
            } as any);
          }
        }
      }

      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const responseText = await response.text();
      let data: any = null;

      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch {
          data = { message: responseText };
        }
      }

      if (response.ok) {
        Alert.alert('Success! 🎉', 'Product listed on marketplace.');
        setTitle('');
        setPrice('');
        setMarketPrice('');
        setDescription('');
        setCategory('');
        setImages([]);
        router.push('/(tabs)');
      } else {
        Alert.alert('Failed', data.message || 'Something went wrong');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Server connection failed. Is your backend running?');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.mainTitle}>Sell an Item</Text>

          {/* Title Field */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Product Title</Text>
            <TextInput 
              style={[styles.inputField, errors.title ? styles.inputFieldError : null]} 
              placeholder="e.g., Engineering Mathematics Book" 
              placeholderTextColor={COLORS.textMuted}
              value={title} 
              onChangeText={(text) => {
                setTitle(text);
                if (errors.title) setErrors({ ...errors, title: '' });
              }} 
            />
            {errors.title && <Text style={styles.errorText}>⚠️ {errors.title}</Text>}
          </View>

          {/* Price Field */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Price (₹)</Text>
            <TextInput 
              style={[styles.inputField, errors.price ? styles.inputFieldError : null]} 
              placeholder="e.g., 450" 
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric" 
              value={price} 
              onChangeText={(text) => {
                setPrice(text);
                if (errors.price) setErrors({ ...errors, price: '' });
              }} 
            />
            {errors.price && <Text style={styles.errorText}>⚠️ {errors.price}</Text>}
          </View>

          {/* Market Price Field */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Market Price (₹) - Optional</Text>
            <TextInput 
              style={[styles.inputField, errors.marketPrice ? styles.inputFieldError : null]} 
              placeholder="e.g., 600" 
              placeholderTextColor={COLORS.textMuted}
              keyboardType="numeric" 
              value={marketPrice} 
              onChangeText={(text) => {
                setMarketPrice(text);
                if (errors.marketPrice) setErrors({ ...errors, marketPrice: '' });
              }} 
            />
            {errors.marketPrice && <Text style={styles.errorText}>⚠️ {errors.marketPrice}</Text>}
          </View>

          {/* Category Field */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.chipsContainer}
            >
              {campusCategories.map((item, index) => {
                const isSelected = category === item;
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.chipButton,
                      isSelected && styles.chipButtonActive,
                      errors.category && !isSelected ? { borderColor: '#ef4444' } : null
                    ]}
                    onPress={() => {
                      setCategory(item);
                      if (errors.category) setErrors({ ...errors, category: '' });
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>{item}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {errors.category && <Text style={styles.errorText}>⚠️ {errors.category}</Text>}
          </View>

          {/* Description Field */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput 
              style={[styles.inputField, styles.textArea, errors.description ? styles.inputFieldError : null]} 
              placeholder="Describe your product condition, usage period, etc." 
              placeholderTextColor={COLORS.textMuted}
              multiline 
              numberOfLines={4} 
              value={description} 
              onChangeText={(text) => {
                setDescription(text);
                if (errors.description) setErrors({ ...errors, description: '' });
              }} 
            />
            {errors.description && <Text style={styles.errorText}>⚠️ {errors.description}</Text>}
          </View>

          <Text style={styles.title}>Upload Product Photos (Max 3)</Text>

          {/* Selected Images Preview */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewScroll}>
            {images.map((img, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: img }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.deleteBadge} onPress={() => removeImage(index)}>
                  <Text style={styles.deleteText}>X</Text>
                </TouchableOpacity>
              </View>
            ))}
            {images.length === 0 && (
              <View style={[styles.emptyBox, errors.images ? { borderColor: '#ef4444', backgroundColor: '#fff5f5' } : null]}>
                <Text style={styles.placeholderText}>No images added yet</Text>
              </View>
            )}
          </ScrollView>

          {/* Upload Options */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.button} onPress={takePhoto}>
              <Text style={styles.buttonText}>📸 Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.galleryButton]} onPress={pickFromGallery}>
              <Text style={styles.buttonText}>🖼️ Gallery</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.orText}>OR</Text>

          {/* Add via Link Option */}
          <View style={styles.linkInputContainer}>
            <TextInput 
              style={styles.input} 
              placeholder="Paste Cloudinary/Image URL here" 
              placeholderTextColor={COLORS.textMuted}
              value={linkInput}
              onChangeText={setLinkInput}
            />
            <TouchableOpacity style={styles.linkButton} onPress={addFromLink}>
              <Text style={styles.buttonText}>Add Link</Text>
            </TouchableOpacity>
          </View>

          {errors.images && <Text style={[styles.errorText, { textAlign: 'center', marginBottom: 15 }]}>⚠️ {errors.images}</Text>}

          {/* Submit Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <ActivityIndicator color={COLORS.background} /> : <Text style={styles.submitButtonText}>Add Now</Text>}
          </TouchableOpacity>

          <View style={styles.footerWrapper}>
            <Footer />
          </View>

          </ScrollView>
          </KeyboardAvoidingView>
          </SafeAreaView>
          );
          }

          const styles = StyleSheet.create({
  scrollContainer: { 
    flexGrow: 1,
    padding: 24, 
    backgroundColor: COLORS.background,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  mainTitle: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: COLORS.heading, 
    marginBottom: 6,
    letterSpacing: -0.5
  },
  formGroup: { 
    marginBottom: 20, 
    gap: 8 
  },
  label: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  inputField: { 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    borderRadius: RADIUS.md,
    paddingHorizontal: 16, 
    height: 52, 
    fontSize: 16, 
    backgroundColor: COLORS.card,
    color: COLORS.heading,
  },
  chipsContainer: {
    paddingVertical: 4,
    gap: 10,
    flexDirection: 'row',
  },
  chipButton: {
    backgroundColor: COLORS.surface, 
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipButtonActive: {
    backgroundColor: COLORS.primary, 
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  chipTextActive: {
    color: COLORS.background,
  },
  textArea: { 
    height: 120, 
    paddingTop: 14, 
    textAlignVertical: 'top' 
  },
  title: { 
    fontSize: 15, 
    fontWeight: '700', 
    marginBottom: 12, 
    color: COLORS.heading, 
    marginTop: 16 
  },
  previewScroll: { 
    maxHeight: 140, 
    marginBottom: 20 
  },
  imageWrapper: { 
    marginRight: 14, 
    position: 'relative', 
    marginTop: 5 
  },
  imagePreview: { 
    width: 110, 
    height: 110, 
    borderRadius: RADIUS.md, 
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  deleteBadge: { 
    position: 'absolute', 
    top: -6, 
    right: -6, 
    backgroundColor: COLORS.danger, 
    width: 22, 
    height: 22, 
    borderRadius: 11, 
    justifyContent: 'center', 
    alignItems: 'center',
  },
  deleteText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 11 
  },
  emptyBox: { 
    width: '100%', 
    height: 120, 
    minWidth: 320, 
    backgroundColor: COLORS.card, 
    borderRadius: RADIUS.md, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 2, 
    borderColor: COLORS.border, 
    borderStyle: 'dashed' 
  },
  placeholderText: { 
    color: COLORS.textMuted, 
    fontSize: 14,
    fontWeight: '500' 
  },
  buttonRow: { 
    flexDirection: 'row', 
    gap: 14, 
    marginBottom: 18 
  },
  button: { 
    flex: 1, 
    backgroundColor: COLORS.surface, 
    paddingVertical: 14, 
    borderRadius: RADIUS.md, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border
  },
  galleryButton: { 
    backgroundColor: COLORS.primaryLight,
    borderWidth: 0
  },
  buttonText: { 
    color: COLORS.text, 
    fontWeight: '700',
    fontSize: 15
  },
  orText: { 
    textAlign: 'center', 
    marginVertical: 12, 
    fontWeight: '700', 
    color: COLORS.textMuted,
    fontSize: 13
  },
  linkInputContainer: { 
    flexDirection: 'row', 
    gap: 10, 
    marginBottom: 32 
  },
  input: { 
    flex: 1, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    borderRadius: RADIUS.md, 
    paddingHorizontal: 16, 
    height: 52, 
    backgroundColor: COLORS.card,
    color: COLORS.heading
  },
  linkButton: { 
    backgroundColor: COLORS.surface, 
    paddingHorizontal: 18, 
    justifyContent: 'center', 
    borderRadius: RADIUS.md 
  },
  submitButton: { 
    backgroundColor: COLORS.primary, 
    padding: 16, 
    borderRadius: RADIUS.md, 
    alignItems: 'center', 
    marginTop: 10,
    marginBottom: 30
  },
  submitButtonText: { 
    color: COLORS.background, 
    fontSize: 16, 
    fontWeight: '700' 
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    paddingLeft: 4,
  },
  inputFieldError: {
    borderColor: COLORS.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  footerWrapper: {
    marginHorizontal: -24,
    marginTop: 40,
  },
});