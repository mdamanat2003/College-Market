import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Navbar } from '../../components/layout/Navbar';
import { useLostFoundStore } from '../../store/lostFoundStore';
import { useDemoRestriction } from '../../hooks/use-demo-restriction';
import { COLORS, RADIUS, SPACING } from '../../theme/colors';
import { compressImage } from '../../utils/imageCompressor';

const CATEGORIES = ['Electronics', 'Documents', 'Keys', 'Wallets', 'Bags', 'Others'];

export default function ReportLostFound() {
  const router = useRouter();
  const { reportItem, isLoading } = useLostFoundStore();
  const { checkRestriction } = useDemoRestriction();

  const [type, setType] = useState<'Lost' | 'Found'>('Lost');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Others');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery access is required to upload images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!checkRestriction('report item')) return;
    if (!title || !description || !location) {
      Alert.alert('Missing Info', 'Please fill in the title, description, and location.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('type', type);
      formData.append('category', category);
      formData.append('location', location);
      formData.append('date', new Date().toISOString());

      if (image) {
        let filename = image.split('/').pop() || 'lost_found.jpg';
        if (!filename.includes('.')) {
          filename = 'lost_found.jpg';
        }
        
        if (Platform.OS === 'web') {
          const response = await fetch(image);
          const blob = await response.blob();
          formData.append('image', blob, filename);
        } else {
          formData.append('image', {
            uri: Platform.OS === 'ios' ? image.replace('file://', '') : image,
            name: filename,
            type: 'image/jpeg',
          } as any);
        }
      }

      const success = await reportItem(formData);
      if (success) {
        Alert.alert('Reported Successfully', 'Your report has been posted to the campus community.');
        router.back();
      } else {
        Alert.alert('Failed', 'Could not post your report. Please try again.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <View style={styles.container}>
      <Navbar />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.heading} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Report Item</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.formCard}>
          {/* Type Toggle */}
          <View style={styles.typeContainer}>
            <TouchableOpacity 
              style={[styles.typeBtn, type === 'Lost' && styles.typeBtnLost]} 
              onPress={() => setType('Lost')}
            >
              <Text style={[styles.typeBtnText, type === 'Lost' && styles.activeTypeText]}>I Lost Something</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.typeBtn, type === 'Found' && styles.typeBtnFound]} 
              onPress={() => setType('Found')}
            >
              <Text style={[styles.typeBtnText, type === 'Found' && styles.activeTypeText]}>I Found Something</Text>
            </TouchableOpacity>
          </View>

          {/* Image Picker */}
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.pickedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={32} color={COLORS.primary} />
                <Text style={styles.imagePlaceholderText}>Add Photo (Optional)</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Item Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Black leather wallet"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity 
                  key={cat}
                  style={[styles.chip, category === cat && styles.activeChip]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.chipText, category === cat && styles.activeChipText]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Where was it {type.toLowerCase()}?</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Main Library or Canteen"
              value={location}
              onChangeText={setLocation}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add more details (color, brand, specific marks...)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]} 
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Post Report</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.heading },
  
  formCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border },
  
  typeContainer: { flexDirection: 'row', gap: 10, marginBottom: SPACING.lg },
  typeBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  typeBtnLost: { backgroundColor: '#FEE2E2', borderColor: '#F87171' },
  typeBtnFound: { backgroundColor: '#D1FAE5', borderColor: '#34D399' },
  typeBtnText: { fontWeight: '700', fontSize: 13, color: COLORS.textMuted },
  activeTypeText: { color: COLORS.heading },

  imagePicker: { height: 160, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, marginBottom: SPACING.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  imagePlaceholderText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  pickedImage: { width: '100%', height: '100%', resizeMode: 'cover' },

  inputGroup: { marginBottom: SPACING.md },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted, marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: 16, height: 50, color: COLORS.heading },
  textArea: { height: 100, paddingTop: 12, textAlignVertical: 'top' },

  chipScroll: { gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.round, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  activeChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  activeChipText: { color: '#fff' },

  submitBtn: { backgroundColor: COLORS.primary, height: 56, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginTop: SPACING.lg },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});