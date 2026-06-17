import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Navbar } from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAcademicStore } from '../../store/academicStore';
import { COLORS, RADIUS, SPACING } from '../../theme/colors';

const BRANCHES = ['CSE', 'ECE', 'EE', 'ME', 'CE', 'IT'];
const SEMESTERS = ['1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'];

const AcademicCard = React.memo(({ item, handleDownload }: { item: any; handleDownload: (url: string) => void }) => (
  <View style={styles.noteCard}>
    <View style={styles.noteIconBox}>
      <Ionicons 
        name={item.fileType === 'pdf' ? "document-text" : "image"} 
        size={24} 
        color={COLORS.primary} 
      />
    </View>
    <View style={styles.noteInfo}>
      <Text style={styles.noteTitle} numberOfLines={1}>{item.title}</Text>
      <View style={styles.noteMeta}>
        <Text style={styles.noteSubject}>{item.subject}</Text>
        <View style={styles.uploaderBox}>
            <Ionicons name="person-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.uploaderName}>{item.uploadedBy?.name || 'User'}</Text>
        </View>
      </View>
    </View>
    <TouchableOpacity 
      style={styles.downloadBtn}
      onPress={() => handleDownload(item.fileUrl)}
    >
      <Ionicons name="eye-outline" size={20} color={COLORS.primary} />
    </TouchableOpacity>
  </View>
));

export default function AcademicHub() {
  const router = useRouter();
  const { materials, fetchMaterials, isLoading, error } = useAcademicStore();
  const listRef = useRef<FlatList>(null);
  
  const [selectedBranch, setSelectedBranch] = useState('CSE');
  const [selectedSemester, setSelectedSemester] = useState('8th Sem');

  useEffect(() => {
    fetchMaterials(selectedBranch, selectedSemester);
  }, [selectedBranch, selectedSemester]);

  const handleBackToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleDownload = React.useCallback((url: string) => {
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
  }, []);

  const renderItem = React.useCallback(({ item }: { item: any }) => (
    <AcademicCard item={item} handleDownload={handleDownload} />
  ), [handleDownload]);

  const keyExtractor = React.useCallback((item: any) => item._id, []);

  return (
    <View style={styles.container}>
      <Navbar />
      
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.pageTitle}>PyQ & Notes</Text>
          <TouchableOpacity 
            style={styles.uploadBtn} 
            onPress={() => router.push('/academic/upload')}
          >
            <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
            <Text style={styles.uploadBtnText}>Upload</Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={20} color={COLORS.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Filters Section */}
        <View style={styles.filterCard}>
          <Text style={styles.filterTitle}>Filter by Branch & Semester</Text>
          <View style={styles.filterRow}>
            <View style={styles.dropdownContainer}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={BRANCHES}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[styles.chip, selectedBranch === item && styles.activeChip]}
                    onPress={() => setSelectedBranch(item)}
                  >
                    <Text style={[styles.chipText, selectedBranch === item && styles.activeChipText]}>{item}</Text>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.chipScroll}
              />
            </View>
          </View>
          <View style={[styles.filterRow, { marginTop: 10 }]}>
            <View style={styles.dropdownContainer}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={SEMESTERS}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[styles.chip, selectedSemester === item && styles.activeChip]}
                    onPress={() => setSelectedSemester(item)}
                  >
                    <Text style={[styles.chipText, selectedSemester === item && styles.activeChipText]}>{item}</Text>
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.chipScroll}
              />
            </View>
          </View>
        </View>

        {/* Notes List Section */}
        <Text style={styles.sectionTitle}>Available Materials</Text>
        
        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={materials}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            removeClippedSubviews={true}
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={5}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No materials found for this selection.</Text>
              </View>
            }
            ListFooterComponent={
              <View style={styles.footerWrapper}>
                <Footer onBackToTop={handleBackToTop} />
              </View>
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: SPACING.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  pageTitle: { fontSize: 24, fontWeight: '800', color: COLORS.heading },
  uploadBtn: { flexDirection: 'row', backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: RADIUS.md, gap: 6, alignItems: 'center' },
  uploadBtnText: { color: '#fff', fontWeight: '600' },
  
  filterCard: { backgroundColor: COLORS.card, padding: SPACING.md, borderRadius: RADIUS.lg, marginBottom: SPACING.xl, borderWidth: 1, borderColor: COLORS.border },
  filterTitle: { fontSize: 14, fontWeight: '700', marginBottom: SPACING.md, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1 },
  filterRow: { flexDirection: 'row' },
  dropdownContainer: { flex: 1 },
  chipScroll: { gap: 8 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.round, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  activeChip: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  activeChipText: { color: '#fff' },
  
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: SPACING.md, color: COLORS.heading },
  listContent: { flexGrow: 1, gap: SPACING.sm, paddingBottom: 0 },
  noteCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, padding: SPACING.md, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 },
  noteIconBox: { width: 48, height: 48, backgroundColor: COLORS.primaryLight, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.md },
  noteInfo: { flex: 1 },
  noteTitle: { fontSize: 16, fontWeight: '600', color: COLORS.heading, marginBottom: 4 },
  noteMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  noteSubject: { fontSize: 13, color: COLORS.textMuted },
  uploaderBox: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.surface, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  uploaderName: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted },
  downloadBtn: { width: 40, height: 40, backgroundColor: '#F1F5F9', borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  errorBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', padding: 10, borderRadius: RADIUS.md, marginBottom: SPACING.md, gap: 8 },
  errorText: { color: COLORS.danger, fontSize: 13, fontWeight: '600' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 40, gap: 12 },
  emptyText: { color: COLORS.textMuted, fontSize: 15 },
  footerWrapper: { marginHorizontal: -SPACING.lg, marginTop: 40 },
});