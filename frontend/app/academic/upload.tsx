import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useAcademicStore } from '../../store/academicStore';
import { useDemoRestriction } from '../../hooks/use-demo-restriction';
import { COLORS, RADIUS, SPACING } from '../../theme/colors';

const BRANCHES = ['CSE', 'ECE', 'EE', 'ME', 'CE', 'IT'];
const SEMESTERS = ['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'];

export default function UploadAcademic() {
  const router = useRouter();
  const { branch: paramBranch, semester: paramSemester, subject: paramSubject } = useLocalSearchParams();
  const { user } = useAuthStore();
  const { uploadMaterial, isLoading } = useAcademicStore();
  const { checkRestriction } = useDemoRestriction();

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState((paramSubject as string) || '');
  const [branch, setBranch] = useState((paramBranch as string) || 'CSE');
  const [semester, setSemester] = useState((paramSemester as string) || '8th Sem');
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedFile = result.assets[0];
        if (selectedFile.size && selectedFile.size > 15 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Document file size 15MB se kam honi chahiye.');
          return;
        }
        setFile(selectedFile);
      }
    } catch (err) {
      console.error('Document picker error:', err);
    }
  };

  const handleUpload = async () => {
    if (!checkRestriction('academic upload')) return;
    if (!title || !subject || !branch || !semester || !file) {
      Alert.alert('Incomplete Form', 'Please fill all fields and select a file.');
      return;
    }

    try {
      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        // 🌐 WEB FIX: Browser me URI ko Blob me convert karna padta hai
        const response = await fetch(file.uri);
        const blob = await response.blob();
        formData.append('file', blob, file.name);
      } else {
        // 📱 MOBILE FIX: Expo default tareeka
        formData.append('file', {
          uri: Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri,
          name: file.name,
          type: file.mimeType || 'application/pdf',
        } as any);
      }

      formData.append('title', title);
      formData.append('subject', subject);
      formData.append('branch', branch);
      formData.append('semester', semester);
      formData.append('uploadedBy', user?._id || '');

      const ok = await uploadMaterial(formData);

      if (ok) {
        Alert.alert('Success!', 'Your document has been uploaded successfully.');
        router.back();
      } else {
        const storeErr = useAcademicStore.getState().error || 'There was an error uploading your file. Please try again.';
        if (storeErr.includes('authorized') || storeErr.includes('token')) {
          Alert.alert(
            'Login Required',
            'Bhai, upload karne ke liye aapko login karna padega.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Login Now', onPress: () => router.push('/(auth)/login') }
            ]
          );
        } else {
          Alert.alert('Upload Failed', storeErr);
        }
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      Alert.alert('Upload Failed', error?.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={COLORS.heading} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Upload Materials</Text>
          <View style={{ width: 24 }} />
        </View>

      <View style={styles.formCard}>
        <TouchableOpacity style={styles.filePickerBtn} onPress={pickDocument}>
          <Ionicons 
            name={file ? "checkmark-circle" : "cloud-upload-outline"} 
            size={40} 
            color={file ? COLORS.success : COLORS.primary} 
          />
          <Text style={[styles.filePickerText, file && { color: COLORS.success }]}>
            {file ? file.name : 'Tap to select PDF or Image'}
          </Text>
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Document Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 2024 End Sem PyQ"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Subject Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Operating Systems"
            value={subject}
            onChangeText={setSubject}
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Select Branch</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={BRANCHES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.chip, branch === item && styles.activeChip]}
                onPress={() => setBranch(item)}
              >
                <Text style={[styles.chipText, branch === item && styles.activeChipText]}>{item}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.chipScroll}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Select Semester</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={SEMESTERS}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[styles.chip, semester === item && styles.activeChip]}
                onPress={() => setSemester(item)}
              >
                <Text style={[styles.chipText, semester === item && styles.activeChipText]}>{item}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.chipScroll}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
          onPress={handleUpload}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <Text style={styles.submitBtnText}>Upload Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xl },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.heading },
  formCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.lg, borderWidth: 1, borderColor: COLORS.border },
  filePickerBtn: { height: 120, borderWidth: 2, borderColor: COLORS.primaryLight, borderStyle: 'dashed', borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.lg, backgroundColor: COLORS.surface },
  filePickerText: { marginTop: 8, color: COLORS.text, fontWeight: '500', textAlign: 'center', paddingHorizontal: 16 },
  inputGroup: { marginBottom: SPACING.lg },
  label: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  input: { height: 50, borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, fontSize: 15, color: COLORS.heading, backgroundColor: COLORS.background },
  chipScroll: { gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.round, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  activeChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  activeChipText: { color: COLORS.background },
  submitBtn: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md,
    ...Platform.select({
      web: { boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)' } as any,
      default: {
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 4,
      },
    }),
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: COLORS.background, fontSize: 16, fontWeight: '700' },
});