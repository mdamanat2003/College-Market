import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Navbar } from '../../components/layout/Navbar';
import { useEventStore } from '../../store/eventStore';
import { COLORS, RADIUS, SPACING } from '../../theme/colors';
import { compressImage } from '../../utils/imageCompressor';

const CATEGORIES = ['Cultural', 'Technical', 'Sports', 'Workshop', 'Other'];

export default function CreateEvent() {
  const router = useRouter();
  const { createEvent, isLoading } = useEventStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('Cultural');
  const [registrationLink, setRegistrationLink] = useState('');
  const [image, setImage] = useState<string | null>(null);
  
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery access is required.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1, // Capture highest quality first
    });

    if (!result.canceled) {
      const compressedUri = await compressImage(result.assets[0].uri);
      setImage(compressedUri);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const newDate = new Date(date);
      newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      setDate(newDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
      setDate(newDate);
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !organizer || !location) {
      Alert.alert('Missing Info', 'Please fill all required fields.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('organizer', organizer);
      formData.append('location', location);
      formData.append('category', category);
      formData.append('date', date.toISOString());
      if (registrationLink) formData.append('registrationLink', registrationLink);

      if (image) {
        let filename = image.split('/').pop() || 'event_banner.jpg';
        if (!filename.includes('.')) filename = 'event_banner.jpg';
        
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        if (Platform.OS === 'web') {
          const response = await fetch(image);
          const blob = await response.blob();
          formData.append('image', blob, filename);
        } else {
          formData.append('image', {
            uri: Platform.OS === 'ios' ? image.replace('file://', '') : image,
            name: filename,
            type,
          } as any);
        }
      }

      const success = await createEvent(formData);
      if (success) {
        Alert.alert('Success', 'Event created successfully!');
        router.back();
      } else {
        // useEventStore will have updated the 'error' state
        Alert.alert('Failed', useEventStore.getState().error || 'Could not create event.');
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
          <Text style={styles.headerTitle}>Host an Event</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.formCard}>
          {/* Banner Upload */}
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.pickedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={32} color={COLORS.primary} />
                <Text style={styles.imagePlaceholderText}>Upload Event Banner</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event Title *</Text>
            <TextInput style={styles.input} placeholder="e.g. Annual Tech Fest" value={title} onChangeText={setTitle} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Organizer / Club Name *</Text>
            <TextInput style={styles.input} placeholder="e.g. Coding Club" value={organizer} onChangeText={setOrganizer} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
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

          {/* Date & Time Pickers */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Date *</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  style={{...styles.input, width: '100%', outline: 'none'} as any}
                  value={date.toISOString().split('T')[0]}
                  onChange={(e: any) => {
                    const newDate = new Date(e.target.value);
                    if (!isNaN(newDate.getTime())) {
                      newDate.setHours(date.getHours(), date.getMinutes());
                      setDate(newDate);
                    }
                  }}
                />
              ) : (
                <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowDatePicker(true)}>
                  <Ionicons name="calendar-outline" size={20} color={COLORS.text} />
                  <Text style={styles.pickerText}>{date.toLocaleDateString()}</Text>
                </TouchableOpacity>
              )}
              {showDatePicker && Platform.OS !== 'web' && (
                <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} />
              )}
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Time *</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="time"
                  style={{...styles.input, width: '100%', outline: 'none'} as any}
                  value={`${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`}
                  onChange={(e: any) => {
                    if (e.target.value) {
                      const [hours, minutes] = e.target.value.split(':');
                      const newDate = new Date(date);
                      newDate.setHours(parseInt(hours, 10), parseInt(minutes, 10));
                      setDate(newDate);
                    }
                  }}
                />
              ) : (
                <TouchableOpacity style={styles.pickerBtn} onPress={() => setShowTimePicker(true)}>
                  <Ionicons name="time-outline" size={20} color={COLORS.text} />
                  <Text style={styles.pickerText}>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </TouchableOpacity>
              )}
              {showTimePicker && Platform.OS !== 'web' && (
                <DateTimePicker value={date} mode="time" display="default" onChange={onTimeChange} />
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location *</Text>
            <TextInput style={styles.input} placeholder="e.g. Main Auditorium" value={location} onChangeText={setLocation} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Registration Link (Optional)</Text>
            <TextInput style={styles.input} placeholder="https://forms.gle/..." value={registrationLink} onChangeText={setRegistrationLink} keyboardType="url" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="About the event..." value={description} onChangeText={setDescription} multiline numberOfLines={4} />
          </View>

          <TouchableOpacity style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]} onPress={handleSubmit} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color={COLORS.background} /> : <Text style={styles.submitBtnText}>Create Event</Text>}
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
  
  imagePicker: { height: 160, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, marginBottom: SPACING.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  imagePlaceholderText: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  pickedImage: { width: '100%', height: '100%', resizeMode: 'cover' },

  inputGroup: { marginBottom: SPACING.md },
  row: { flexDirection: 'row', gap: SPACING.md },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted, marginBottom: 8, textTransform: 'uppercase' },
  input: { backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: 16, height: 50, color: COLORS.heading },
  textArea: { height: 100, paddingTop: 12, textAlignVertical: 'top' },
  
  pickerBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: 16, height: 50, gap: 8 },
  pickerText: { color: COLORS.heading, fontSize: 15 },

  chipScroll: { gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.round, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  activeChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  activeChipText: { color: COLORS.background },

  submitBtn: { backgroundColor: COLORS.primary, height: 56, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginTop: SPACING.lg },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: COLORS.background, fontSize: 16, fontWeight: '700' },
});