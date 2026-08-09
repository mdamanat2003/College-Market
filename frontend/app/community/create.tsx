import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { COLORS, RADIUS } from '../../theme/colors';
import { useCommunityStore } from '../../store/communityStore';
import { useAuthStore } from '../../store/authStore';
import { Navbar } from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const CATEGORIES = [
  'Academic & Exam Prep',
  'Campus Life & Advice',
  'Career & Internships',
  'Tech & Coding',
  'General Discussion',
  'Confessions & Opinions',
];

export default function CreatePostScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { createPost, isSubmitting } = useCommunityStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [tags, setTags] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Gallery permission is needed to upload an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Login Required', 'You must be logged in to post a question.');
      router.push('/(auth)/login');
      return;
    }

    if (!title.trim() || !content.trim()) {
      Alert.alert('Missing fields', 'Please enter a title and question description.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content.trim());
    formData.append('category', category);
    formData.append('tags', tags.trim());
    formData.append('isAnonymous', String(isAnonymous));

    if (imageUri) {
      const filename = imageUri.split('/').pop() || 'post.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      if (Platform.OS === 'web') {
        try {
          const res = await fetch(imageUri);
          const blob = await res.blob();
          formData.append('image', blob, filename);
        } catch (err) {
          console.error('[createPost] Failed to convert web image uri to blob:', err);
        }
      } else {
        formData.append('image', {
          uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
          name: filename,
          type,
        } as any);
      }
    }

    const success = await createPost(formData);
    if (success) {
      router.replace('/community' as any);
    } else {
      const storeError = useCommunityStore.getState().error;
      Alert.alert('Error', storeError || 'Failed to publish post. Please try again.');
    }
  };

  const scrollRef = React.useRef<ScrollView>(null);
  const handleBackToTop = () => scrollRef.current?.scrollTo({ y: 0, animated: true });

  return (
    <View style={styles.container}>
      <Navbar />

      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.contentWrapper}>
          {/* Back Navigation */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/community' as any)}>
            <Ionicons name="arrow-back" size={20} color="#38BDF8" />
            <Text style={styles.backBtnText}>Back to Community</Text>
          </TouchableOpacity>

          <View style={styles.formCard}>
            <View style={styles.headerRow}>
              <Ionicons name="create" size={24} color="#38BDF8" />
              <Text style={styles.formTitle}>Ask a Question / Share Thought</Text>
            </View>
            <Text style={styles.formSubtitle}>
              Get answers from campus peers, seniors, and classmates.
            </Text>

            {/* Category Selection */}
            <Text style={styles.label}>Select Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryPicker}
            >
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catPill, category === cat && styles.catPillActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.catPillText, category === cat && styles.catPillTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Question Title */}
            <Text style={styles.label}>Question / Topic Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. How to prepare for Data Structures end-sem exam?"
              placeholderTextColor="#64748B"
              value={title}
              onChangeText={setTitle}
            />

            {/* Question Content / Details */}
            <Text style={styles.label}>Detailed Explanation / Opinion *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Provide background context or detail so others can give you helpful answers..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={6}
              value={content}
              onChangeText={setContent}
            />

            {/* Tags */}
            <Text style={styles.label}>Tags (Optional, comma separated)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. dsa, exam, python, campus"
              placeholderTextColor="#64748B"
              value={tags}
              onChangeText={setTags}
            />

            {/* Image Picker */}
            <Text style={styles.label}>Attach Image (Optional)</Text>
            {imageUri ? (
              <View style={styles.imagePreviewBox}>
                <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
                <TouchableOpacity style={styles.removeImgBtn} onPress={() => setImageUri(null)}>
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
                <Ionicons name="camera-outline" size={24} color="#38BDF8" />
                <Text style={styles.uploadBtnText}>Upload Photo or Diagram</Text>
              </TouchableOpacity>
            )}

            {/* Anonymous Toggle */}
            <View style={styles.anonymousBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.anonymousTitle}>Post Anonymously</Text>
                <Text style={styles.anonymousDesc}>
                  Hide your name and profile picture from other students.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsAnonymous(!isAnonymous)}>
                <Ionicons
                  name={isAnonymous ? 'toggle' : 'toggle-outline'}
                  size={36}
                  color={isAnonymous ? '#38BDF8' : '#64748B'}
                />
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && styles.disabledSubmitBtn]}
              disabled={isSubmitting}
              onPress={handleSubmit}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#09090b" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#09090b" />
                  <Text style={styles.submitBtnText}>Publish Question / Post</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <Footer onBackToTop={handleBackToTop} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 0,
  },
  contentWrapper: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backBtnText: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '700',
  },
  formCard: {
    backgroundColor: '#18181b',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  formSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#CBD5E1',
    marginBottom: 8,
    marginTop: 12,
  },
  categoryPicker: {
    gap: 8,
    paddingBottom: 4,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.round,
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  catPillActive: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  catPillText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  catPillTextActive: {
    color: '#09090b',
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#09090b',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#F8FAFC',
    fontSize: 14.5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  uploadBtn: {
    backgroundColor: '#09090b',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderStyle: 'dashed',
  },
  uploadBtnText: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: 14,
  },
  imagePreviewBox: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  removeImgBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 14,
  },
  anonymousBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#09090b',
    padding: 16,
    borderRadius: 14,
    marginTop: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  anonymousTitle: {
    color: '#F8FAFC',
    fontWeight: '800',
    fontSize: 15,
  },
  anonymousDesc: {
    color: '#94A3B8',
    fontSize: 12.5,
    marginTop: 2,
  },
  submitBtn: {
    backgroundColor: '#38BDF8',
    borderRadius: RADIUS.round,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    ...Platform.select({
      web: { boxShadow: '0 4px 16px rgba(56, 189, 248, 0.4)' } as any,
    }),
  },
  disabledSubmitBtn: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#09090b',
    fontSize: 16,
    fontWeight: '800',
  },
});
