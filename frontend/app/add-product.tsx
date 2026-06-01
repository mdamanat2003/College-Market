import React, { useState } from 'react';
import { 
  View, Text, TouchableOpacity, Image, StyleSheet, 
  Alert, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, SafeAreaView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore'; 
import { API_URL } from '../services/api';

export default function AddItemScreen() {
  const router = useRouter();
  const { token } = useAuthStore(); 

  // Form Fields States
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
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
      quality: 0.9,
    });

    if (!result.canceled) addImageToArray(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission Denied!', 'Camera access is required.');

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.9,
    });

    if (!result.canceled) addImageToArray(result.assets[0].uri);
  };

  const addFromLink = () => {
    if (!linkInput) return;
    if (!linkInput.startsWith('http://') && !linkInput.startsWith('https://')) {
      Alert.alert('Invalid Link', 'Bhai, sahi URL dalo (http:// ya https:// se shuru hone wala).');
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
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) newErrors.title = 'Product title is required';
    if (!price.trim()) newErrors.price = 'Price is required';
    if (!category) newErrors.category = 'Please select a category';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (images.length === 0) newErrors.images = 'Please upload at least 1 photo or paste a link';

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
          'Authorization': `Bearer ${token}`,
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.mainTitle}>Sell an Item</Text>

          {/* Title Field */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Product Title</Text>
            <TextInput 
              style={[styles.inputField, errors.title ? styles.inputFieldError : null]} 
              placeholder="e.g., Engineering Mathematics Book" 
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
              keyboardType="numeric" 
              value={price} 
              onChangeText={(text) => {
                setPrice(text);
                if (errors.price) setErrors({ ...errors, price: '' });
              }} 
            />
            {errors.price && <Text style={styles.errorText}>⚠️ {errors.price}</Text>}
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
            {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Add Now</Text>}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { 
    flexGrow: 1,
    padding: 24, 
    backgroundColor: '#f9fafb',
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  mainTitle: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: '#111827', 
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
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  inputField: { 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    borderRadius: 12,
    paddingHorizontal: 16, 
    height: 52, 
    fontSize: 16, 
    backgroundColor: '#ffffff',
    color: '#111827',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  chipsContainer: {
    paddingVertical: 4,
    gap: 10,
    flexDirection: 'row',
  },
  chipButton: {
    backgroundColor: '#edf2f7', 
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipButtonActive: {
    backgroundColor: '#2563eb', 
    borderColor: '#2563eb',
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  chipTextActive: {
    color: '#ffffff',
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
    color: '#374151', 
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
    borderRadius: 14, 
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  deleteBadge: { 
    position: 'absolute', 
    top: -6, 
    right: -6, 
    backgroundColor: '#ef4444', 
    width: 22, 
    height: 22, 
    borderRadius: 11, 
    justifyContent: 'center', 
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3
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
    backgroundColor: '#ffffff', 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 2, 
    borderColor: '#e5e7eb', 
    borderStyle: 'dashed' 
  },
  placeholderText: { 
    color: '#9ca3af', 
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
    backgroundColor: '#2563eb', 
    paddingVertical: 14, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  galleryButton: { 
    backgroundColor: '#10b981' 
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: '700',
    fontSize: 15
  },
  orText: { 
    textAlign: 'center', 
    marginVertical: 12, 
    fontWeight: '700', 
    color: '#9ca3af',
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
    borderColor: '#e5e7eb', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    height: 52, 
    backgroundColor: '#ffffff' 
  },
  linkButton: { 
    backgroundColor: '#4b5563', 
    paddingHorizontal: 18, 
    justifyContent: 'center', 
    borderRadius: 12 
  },
  submitButton: { 
    backgroundColor: '#2563eb', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    shadowColor: '#2563eb', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 8, 
    elevation: 4,
    marginTop: 10,
    marginBottom: 30
  },
  submitButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '700' 
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    paddingLeft: 4,
  },
  inputFieldError: {
    borderColor: '#ef4444',
    backgroundColor: '#fff5f5',
  }
});