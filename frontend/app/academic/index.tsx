import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Modal,
  TextInput,
  Alert,
  useWindowDimensions,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Navbar } from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAcademicStore } from '../../store/academicStore';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { COLORS, RADIUS, SPACING } from '../../theme/colors';

const BRANCHES = ['All', 'CSE', 'ECE', 'EE', 'ME', 'CS', 'IT'];
const SEMESTERS = ['All', '1st Sem', '2nd Sem', '3rd Sem', '4th Sem', '5th Sem', '6th Sem', '7th Sem', '8th Sem'];

const AcademicCard = React.memo(({
  item,
  handleDownload,
  currentUser,
  onEdit,
  onDelete,
}: {
  item: any;
  handleDownload: (url: string) => void;
  currentUser?: any;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
}) => {
  if (!item) return null;

  const rawType = (item.fileType || 'pdf').toLowerCase();
  const fileTypeLabel = rawType.includes('pyq') ? 'PYQ' : rawType.includes('note') ? 'NOTES' : 'PDF';
  const badgeColor = fileTypeLabel === 'PYQ' ? '#10B981' : fileTypeLabel === 'NOTES' ? '#F59E0B' : '#38BDF8';

  const uploaderId = typeof item.uploadedBy === 'object' ? item.uploadedBy?._id : item.uploadedBy;
  const isOwnerOrAdmin = currentUser?._id && (uploaderId === currentUser._id || currentUser?.role === 'admin');

  return (
    <View testID="note-card" style={styles.noteCard}>
      <View style={styles.cardHeaderRow}>
        <View style={[styles.typeBadge, { backgroundColor: `${badgeColor}18`, borderColor: `${badgeColor}35` }]}>
          <Ionicons name="document-text-outline" size={13} color={badgeColor} />
          <Text style={[styles.typeBadgeText, { color: badgeColor }]}>{fileTypeLabel}</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={styles.branchTag}>
            <Text style={styles.branchTagText}>
              {(Array.isArray(item.branch)
                ? item.branch.join(', ')
                : typeof item.branch === 'string' && item.branch.startsWith('[')
                ? (() => { try { return JSON.parse(item.branch).join(', '); } catch (e) { return item.branch; } })()
                : item.branch || 'CSE')} • {item.semester || 'Sem'}
            </Text>
          </View>
          {isOwnerOrAdmin && (
            <View style={styles.ownerActionsRow}>
              <TouchableOpacity
                onPress={() => onEdit?.(item)}
                style={styles.actionIconBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="pencil" size={13} color="#38BDF8" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onDelete?.(item)}
                style={[styles.actionIconBtn, { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)' }]}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={13} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <Text style={styles.noteTitle} numberOfLines={2}>{item.title}</Text>

      {item.description ? (
        <Text style={styles.noteDescription} numberOfLines={2}>{item.description}</Text>
      ) : null}

      <View style={styles.subjectRow}>
        <Ionicons name="book-outline" size={14} color="#94A3B8" />
        <Text style={styles.noteSubject} numberOfLines={1}>{item.subject}</Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.uploaderBox}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>{(item.uploadedBy?.name || 'S').charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.uploaderMeta}>
            <Text style={styles.uploaderName} numberOfLines={1}>{item.uploadedBy?.name || 'Campus Peer'}</Text>
            <Text style={styles.uploadDate}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}</Text>
          </View>
        </View>

        <TouchableOpacity
          testID="buy-btn"
          style={styles.viewDocBtn}
          onPress={() => handleDownload(item.fileUrl)}
          activeOpacity={0.8}
        >
          <Text style={styles.viewDocBtnText}>View Document</Text>
          <Ionicons name="arrow-forward" size={13} color="#09090b" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const AcademicHeader = React.memo(({
  searchQuery,
  onSearchChange,
  selectedBranch,
  onBranchChange,
  selectedSemester,
  onSemesterChange,
  error,
  isLoading,
  stats,
  onResetFilters,
  onUploadPress,
}: {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  selectedBranch: string;
  onBranchChange: (b: string) => void;
  selectedSemester: string;
  onSemesterChange: (s: string) => void;
  error: string | null;
  isLoading: boolean;
  stats: { total: number; subjects: number; contributors: number };
  onResetFilters: () => void;
  onUploadPress: () => void;
}) => {
  return (
    <View style={styles.headerContainer}>
      {/* --- Header & Title --- */}
      <View style={styles.headerSection}>
        <View style={styles.titleBox}>
          <Text style={styles.kicker}>Academic Resources</Text>
          <Text style={styles.pageTitle}>PyQ & Lecture Notes</Text>
          <Text style={styles.subtitle}>
            Access verified lecture notes, previous year question papers, and syllabus resources shared by campus peers.
          </Text>
        </View>

        <TouchableOpacity
          testID="sell-btn"
          style={styles.uploadBtn}
          onPress={onUploadPress}
          activeOpacity={0.8}
        >
          <Ionicons name="cloud-upload" size={18} color="#09090b" />
          <Text style={styles.uploadBtnText}>Upload Notes</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle-outline" size={18} color={COLORS.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* --- Search Bar --- */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#94A3B8" style={{ marginRight: 10 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes by subject, title, or branch..."
            placeholderTextColor="#CBD5E1"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
          {isLoading ? (
            <ActivityIndicator size="small" color="#38BDF8" style={{ marginLeft: 6 }} />
          ) : searchQuery ? (
            <TouchableOpacity onPress={() => onSearchChange('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* --- Separated Filters Section --- */}
      <View style={styles.filterCard}>
        <View style={styles.filterHeaderRow}>
          <Text style={styles.filterHeaderTitle}>Filter Notes & Papers</Text>
          {(selectedBranch !== 'All' || selectedSemester !== 'All' || searchQuery) && (
            <TouchableOpacity onPress={onResetFilters}>
              <Text style={styles.resetText}>Reset All Filters</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Group 1: Branch */}
        <View style={styles.filterGroup}>
          <Text style={styles.groupLabel}>BRANCH / STREAM</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
            {BRANCHES.map((b) => (
              <TouchableOpacity
                key={b}
                testID="category-chip"
                style={[styles.chip, selectedBranch === b && styles.activeChip]}
                onPress={() => onBranchChange(b)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, selectedBranch === b && styles.activeChipText]}>{b}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Group 2: Semester */}
        <View style={[styles.filterGroup, { marginTop: 16 }]}>
          <Text style={styles.groupLabel}>SEMESTER</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
            {SEMESTERS.map((s) => (
              <TouchableOpacity
                key={s}
                testID="category-chip"
                style={[styles.chip, selectedSemester === s && styles.activeChip]}
                onPress={() => onSemesterChange(s)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, selectedSemester === s && styles.activeChipText]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* --- Statistics Bar --- */}
      <View style={styles.statsBar}>
        <View style={styles.statBox}>
          <Ionicons name="document-text-outline" size={18} color="#38BDF8" />
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Materials</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Ionicons name="book-outline" size={18} color="#10B981" />
          <Text style={styles.statNumber}>{stats.subjects}</Text>
          <Text style={styles.statLabel}>Subjects</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Ionicons name="people-outline" size={18} color="#F59E0B" />
          <Text style={styles.statNumber}>{stats.contributors}</Text>
          <Text style={styles.statLabel}>Contributors</Text>
        </View>
      </View>
    </View>
  );
});

export default function AcademicHub() {
  const router = useRouter();
  const params = useLocalSearchParams<{ search?: string; q?: string; branch?: string; semester?: string }>();
  const { materials, fetchMaterials, updateMaterial, deleteMaterial, isLoading, error } = useAcademicStore();
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList>(null);

  const initialSearch = (params.search || params.q || '').toString();
  const initialBranch = params.branch && BRANCHES.includes(params.branch) ? params.branch : 'All';
  const initialSemester = params.semester && SEMESTERS.includes(params.semester) ? params.semester : 'All';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(initialSearch);
  const [selectedBranch, setSelectedBranch] = useState<string>(initialBranch);
  const [selectedSemester, setSelectedSemester] = useState<string>(initialSemester);

  // Request Modal State
  const [isRequestModalVisible, setIsRequestModalVisible] = useState(false);
  const [requestSubject, setRequestSubject] = useState('');
  const [requestDetails, setRequestDetails] = useState('');
  const [requestBranch, setRequestBranch] = useState('CSE');
  const [requestSemester, setRequestSemester] = useState('8th Sem');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Edit Modal State
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editBranches, setEditBranches] = useState<string[]>(['CSE']);
  const [editSemester, setEditSemester] = useState('8th Sem');
  const [editDescription, setEditDescription] = useState('');
  const [editFile, setEditFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [updating, setUpdating] = useState(false);

  const toggleEditBranch = (b: string) => {
    setEditBranches((prev) => {
      if (prev.includes(b)) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item !== b);
      } else {
        return [...prev, b];
      }
    });
  };

  // Debounce search query (500ms delay)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch materials on debounced search or filter changes
  useEffect(() => {
    const branchParam = selectedBranch === 'All' ? '' : selectedBranch;
    const semParam = selectedSemester === 'All' ? '' : selectedSemester;

    fetchMaterials(branchParam, semParam, debouncedSearchQuery);
  }, [selectedBranch, selectedSemester, debouncedSearchQuery]);

  useEffect(() => {
    if (isRequestModalVisible) {
      setRequestBranch(selectedBranch === 'All' ? 'CSE' : selectedBranch);
      setRequestSemester(selectedSemester === 'All' ? '8th Sem' : selectedSemester);
      setRequestSubject('');
      setRequestDetails('');
    }
  }, [isRequestModalVisible]);

  const filteredMaterials = useMemo(() => {
    if (!Array.isArray(materials)) return [];
    if (!debouncedSearchQuery.trim()) return materials;
    const q = debouncedSearchQuery.toLowerCase().trim();
    return materials.filter((m: any) => {
      const rawType = (m.fileType || 'pdf').toLowerCase();
      const fileTypeLabel = rawType.includes('pyq') ? 'pyq' : rawType.includes('note') ? 'notes' : 'pdf';
      return (
        (m.title && m.title.toLowerCase().includes(q)) ||
        (m.subject && m.subject.toLowerCase().includes(q)) ||
        (m.branch && m.branch.toLowerCase().includes(q)) ||
        (m.semester && m.semester.toLowerCase().includes(q)) ||
        (m.description && m.description.toLowerCase().includes(q)) ||
        (m.fileType && m.fileType.toLowerCase().includes(q)) ||
        fileTypeLabel.includes(q) ||
        (m.uploadedBy?.name && m.uploadedBy.name.toLowerCase().includes(q))
      );
    });
  }, [materials, debouncedSearchQuery]);

  const stats = useMemo(() => {
    const list = Array.isArray(materials) ? materials : [];
    const subjects = new Set(list.map((m: any) => m.subject).filter(Boolean)).size;
    const contributors = new Set(list.map((m: any) => m.uploadedBy?._id || m.uploadedBy?.name).filter(Boolean)).size;
    return {
      total: list.length,
      subjects,
      contributors: Math.max(contributors, list.length > 0 ? 1 : 0),
    };
  }, [materials]);

  const handleOpenEdit = React.useCallback((item: any) => {
    setEditingItem(item);
    setEditTitle(item.title || '');
    setEditSubject(item.subject || '');
    
    let initialBranches: string[] = ['CSE'];
    if (Array.isArray(item.branch)) {
      initialBranches = item.branch;
    } else if (typeof item.branch === 'string') {
      if (item.branch.startsWith('[')) {
        try { initialBranches = JSON.parse(item.branch); } catch (e) { initialBranches = [item.branch]; }
      } else if (item.branch.includes(',')) {
        initialBranches = item.branch.split(',').map((b: string) => b.trim());
      } else {
        initialBranches = [item.branch];
      }
    }
    setEditBranches(initialBranches);
    setEditSemester(item.semester || '8th Sem');
    setEditDescription(item.description || '');
    setEditFile(null);
    setIsEditModalVisible(true);
  }, []);

  const pickEditDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedFile = result.assets[0];
        if (selectedFile.size && selectedFile.size > 1.5 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Document file size 1.5MB se kam honi chahiye.');
          return;
        }
        setEditFile(selectedFile);
      }
    } catch (err) {
      console.error('Document picker error:', err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    if (!editTitle.trim() || !editSubject.trim() || editBranches.length === 0) {
      Alert.alert('Incomplete Form', 'Please enter Title, Subject and select at least one Branch.');
      return;
    }

    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append('title', editTitle.trim());
      formData.append('subject', editSubject.trim());
      formData.append('branch', JSON.stringify(editBranches));
      formData.append('semester', editSemester);
      formData.append('description', editDescription.trim());

      if (editFile) {
        if (Platform.OS === 'web') {
          const fileObj = (editFile as any).file;
          if (fileObj) {
            formData.append('file', fileObj, editFile.name || 'document.pdf');
          } else {
            const response = await fetch(editFile.uri);
            const blob = await response.blob();
            formData.append('file', blob, editFile.name || 'document.pdf');
          }
        } else {
          formData.append('file', {
            uri: Platform.OS === 'ios' ? editFile.uri.replace('file://', '') : editFile.uri,
            name: editFile.name || 'document.pdf',
            type: editFile.mimeType || 'application/pdf',
          } as any);
        }
      }

      const ok = await updateMaterial(editingItem._id, formData);
      if (ok) {
        Alert.alert('Success', 'PyQ / Notes updated successfully!');
        setIsEditModalVisible(false);
        setEditingItem(null);
      } else {
        const storeErr = useAcademicStore.getState().error || 'Failed to update material.';
        Alert.alert('Update Failed', storeErr);
      }
    } catch (err: any) {
      console.error('Update failed:', err);
      Alert.alert('Error', err?.message || 'Failed to update material.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteItem = React.useCallback((item: any) => {
    Alert.alert(
      'Delete PyQ / Material',
      `Are you sure you want to delete "${item.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const ok = await deleteMaterial(item._id);
            if (ok) {
              Alert.alert('Deleted', 'Academic material has been deleted.');
            } else {
              const storeErr = useAcademicStore.getState().error || 'Failed to delete material.';
              Alert.alert('Delete Failed', storeErr);
            }
          },
        },
      ]
    );
  }, [deleteMaterial]);

  const handleRequestSubmit = async () => {
    if (!requestSubject.trim()) {
      Alert.alert('Incomplete Form', 'Please enter a Subject Name.');
      return;
    }

    setSubmittingRequest(true);
    try {
      const messageBody = `[Academic Request]
Branch: ${requestBranch}
Semester: ${requestSemester}
Subject: ${requestSubject}
Details: ${requestDetails || 'None provided'}`;

      const name = user?.name || 'Anonymous Student';
      const email = user?.email || 'anonymous@college.edu';

      await api.post('/requests', {
        name,
        email,
        message: messageBody
      });

      Alert.alert('Request Submitted', 'Our team and other students will check for these materials!');
      setIsRequestModalVisible(false);
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleBackToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const handleDownload = React.useCallback((url: string) => {
    Linking.openURL(url).catch((err) => console.error("Couldn't load page", err));
  }, []);

  const handleResetFilters = React.useCallback(() => {
    setSelectedBranch('All');
    setSelectedSemester('All');
    setSearchQuery('');
  }, []);

  const handleUploadPress = React.useCallback(() => {
    router.push('/academic/upload');
  }, [router]);

  const renderItem = React.useCallback(({ item }: { item: any }) => (
    <View style={{ flex: 1, margin: CARD_GAP / 2 }}>
      <AcademicCard
        item={item}
        handleDownload={handleDownload}
        currentUser={user}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteItem}
      />
    </View>
  ), [handleDownload, user, handleOpenEdit, handleDeleteItem]);

  const keyExtractor = React.useCallback((item: any) => item._id, []);

  const isPhone = width <= 560;
  const numColumns = width >= 1150 ? 3 : width >= 720 ? 2 : 1;
  const CARD_GAP = 20;

  return (
    <View style={styles.container}>
      <Navbar />

      <View style={styles.mainContent}>
        {/* --- Single Unified Scroll View via FlatList --- */}
        <FlatList
          ref={listRef}
          style={{ flex: 1, width: '100%' }}
          key={numColumns}
          data={filteredMaterials}
          keyExtractor={keyExtractor}
          numColumns={numColumns}
          renderItem={renderItem}
          ListHeaderComponent={
            <AcademicHeader
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedBranch={selectedBranch}
              onBranchChange={setSelectedBranch}
              selectedSemester={selectedSemester}
              onSemesterChange={setSelectedSemester}
              error={error}
              isLoading={isLoading}
              stats={stats}
              onResetFilters={handleResetFilters}
              onUploadPress={handleUploadPress}
            />
          }
          columnWrapperStyle={numColumns > 1 ? [styles.row, filteredMaterials.length <= 2 && styles.sparseRow] : undefined}
          showsVerticalScrollIndicator={true}
          removeClippedSubviews={true}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          ListEmptyComponent={
            isLoading && materials.length === 0 ? (
              <View style={{ paddingVertical: 60, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color="#38BDF8" />
              </View>
            ) : (
              <View style={[styles.emptyState, { maxWidth: 1440, alignSelf: 'center', width: '100%' }]}>
                <Ionicons name="folder-open-outline" size={52} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>No Materials Found</Text>
                <Text style={styles.emptyText}>We couldn't find any study materials matching your current search or filter criteria.</Text>
                <TouchableOpacity
                  style={styles.requestBtn}
                  onPress={() => setIsRequestModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="help-circle-outline" size={18} color="#38BDF8" style={{ marginRight: 6 }} />
                  <Text style={styles.requestBtnText}>Request Study Material</Text>
                </TouchableOpacity>
              </View>
            )
          }
          ListFooterComponent={
            <View style={styles.footerWrapper}>
              <Footer onBackToTop={handleBackToTop} />
            </View>
          }
          contentContainerStyle={styles.listContent}
        />
      </View>

      {/* --- Request Material Modal --- */}
      <Modal
        visible={isRequestModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsRequestModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Material</Text>
              <TouchableOpacity onPress={() => setIsRequestModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Subject Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Theory of Computation"
                  value={requestSubject}
                  onChangeText={setRequestSubject}
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Branch</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modalChipScroll}>
                  {BRANCHES.filter(b => b !== 'All').map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[styles.modalChip, requestBranch === item && styles.activeModalChip]}
                      onPress={() => setRequestBranch(item)}
                    >
                      <Text style={[styles.modalChipText, requestBranch === item && styles.activeModalChipText]}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Semester</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modalChipScroll}>
                  {SEMESTERS.filter(s => s !== 'All').map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[styles.modalChip, requestSemester === item && styles.activeModalChip]}
                      onPress={() => setRequestSemester(item)}
                    >
                      <Text style={[styles.modalChipText, requestSemester === item && styles.activeModalChipText]}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Details / Notes Needed</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  placeholder="e.g. Need handwritten notes or last year's exam solutions..."
                  value={requestDetails}
                  onChangeText={setRequestDetails}
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitRequestBtn, submittingRequest && styles.submitRequestBtnDisabled]}
                onPress={handleRequestSubmit}
                disabled={submittingRequest}
              >
                {submittingRequest ? (
                  <ActivityIndicator color="#09090b" />
                ) : (
                  <Text style={styles.submitRequestBtnText}>Submit Request</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- Edit Material Modal --- */}
      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit PyQ / Material</Text>
              <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm} showsVerticalScrollIndicator={false}>
              {/* Optional Replacement File */}
              <TouchableOpacity style={styles.editFileBtn} onPress={pickEditDocument}>
                <Ionicons
                  name={editFile ? "checkmark-circle" : "document-attach-outline"}
                  size={22}
                  color={editFile ? COLORS.success : "#38BDF8"}
                />
                <Text style={[styles.editFileText, editFile && { color: COLORS.success }]} numberOfLines={1}>
                  {editFile ? editFile.name : 'Tap to replace PDF/Image (Optional)'}
                </Text>
              </TouchableOpacity>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Document Title *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 2024 End Sem PyQ"
                  value={editTitle}
                  onChangeText={setEditTitle}
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Subject Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Operating Systems"
                  value={editSubject}
                  onChangeText={setEditSubject}
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Select Branch(es) (Multiple Allowed)</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modalChipScroll}>
                  {BRANCHES.filter(b => b !== 'All').map((b) => {
                    const isSelected = editBranches.includes(b);
                    return (
                      <TouchableOpacity
                        key={b}
                        style={[styles.modalChip, isSelected && styles.activeModalChip]}
                        onPress={() => toggleEditBranch(b)}
                      >
                        <Text style={[styles.modalChipText, isSelected && styles.activeModalChipText]}>
                          {isSelected ? `✓ ${b}` : b}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Semester</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modalChipScroll}>
                  {SEMESTERS.filter(s => s !== 'All').map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.modalChip, editSemester === s && styles.activeModalChip]}
                      onPress={() => setEditSemester(s)}
                    >
                      <Text style={[styles.modalChipText, editSemester === s && styles.activeModalChipText]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Description / Notes (Optional)</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea]}
                  placeholder="Optional details..."
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity
                style={[styles.submitRequestBtn, updating && styles.submitRequestBtnDisabled]}
                onPress={handleSaveEdit}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#09090b" />
                ) : (
                  <Text style={styles.submitRequestBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mainContent: {
    flex: 1,
    width: '100%',
  },
  headerContainer: {
    width: '100%',
    maxWidth: 1440,
    alignSelf: 'center',
    paddingHorizontal: 28,
    paddingTop: 24,
  },
  row: {
    width: '100%',
    maxWidth: 1440,
    alignSelf: 'center',
    paddingHorizontal: 28,
  },
  sparseRow: {
    justifyContent: 'center',
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 20,
  },
  titleBox: {
    flex: 1,
    maxWidth: 850,
    gap: 6,
  },
  kicker: {
    fontSize: 15.5,
    fontWeight: '800',
    color: '#38BDF8',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  pageTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 14.5,
    lineHeight: 22,
    color: '#94A3B8',
    marginTop: 2,
  },
  uploadBtn: {
    flexDirection: 'row',
    backgroundColor: '#38BDF8',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
    gap: 8,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 16px rgba(56, 189, 248, 0.4)',
      } as any,
      default: {
        shadowColor: '#38BDF8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  uploadBtnText: {
    color: '#09090b',
    fontWeight: '800',
    fontSize: 14,
  },
  searchSection: {
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 39, 42, 0.65)',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: '#F8FAFC',
    fontWeight: '500',
    backgroundColor: 'transparent',
    borderWidth: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  filterCard: {
    backgroundColor: '#18181b',
    padding: 20,
    borderRadius: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
      } as any,
    }),
  },
  filterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  resetText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#38BDF8',
  },
  filterGroup: {
    gap: 8,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
  },
  chipScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: RADIUS.round,
    backgroundColor: 'rgba(39, 39, 42, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  activeChip: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(56, 189, 248, 0.4)',
      } as any,
    }),
  },
  chipText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  activeChipText: {
    color: '#09090b',
    fontWeight: '800',
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(24, 24, 27, 0.7)',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  statBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F8FAFC',
  },
  statLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 0,
  },
  noteCard: {
    backgroundColor: '#18181b',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'space-between',
    height: '100%',
    gap: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
      } as any,
    }),
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  branchTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  branchTagText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    lineHeight: 22,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  noteSubject: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    gap: 10,
  },
  uploaderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  avatarInitial: {
    fontSize: 13,
    fontWeight: '700',
    color: '#38BDF8',
  },
  uploaderMeta: {
    flex: 1,
  },
  uploaderName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  uploadDate: {
    fontSize: 11,
    color: '#64748B',
  },
  viewDocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#38BDF8',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9,
    gap: 4,
  },
  viewDocBtnText: {
    color: '#09090b',
    fontSize: 12,
    fontWeight: '800',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 400,
  },
  requestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    marginTop: 8,
  },
  requestBtnText: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '700',
  },
  footerWrapper: {
    marginTop: 60,
    width: '100%',
    alignSelf: 'stretch',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 9, 11, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(8px)',
      } as any,
    }),
  },
  modalContent: {
    backgroundColor: '#18181b',
    borderRadius: 20,
    width: '100%',
    maxWidth: 480,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    paddingBottom: 16,
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  modalForm: {
    gap: 14,
  },
  modalInputGroup: {
    gap: 6,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalInput: {
    height: 48,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#F8FAFC',
    backgroundColor: 'rgba(39, 39, 42, 0.65)',
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  modalTextArea: {
    height: 84,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  modalChipScroll: {
    gap: 8,
  },
  modalChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.round,
    backgroundColor: 'rgba(39, 39, 42, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  activeModalChip: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  modalChipText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  activeModalChipText: {
    color: '#09090b',
    fontWeight: '800',
  },
  submitRequestBtn: {
    backgroundColor: '#38BDF8',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitRequestBtnDisabled: {
    opacity: 0.6,
  },
  submitRequestBtnText: {
    color: '#09090b',
    fontSize: 15,
    fontWeight: '800',
  },
  ownerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIconBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteDescription: {
    fontSize: 12.5,
    color: '#94A3B8',
    lineHeight: 18,
  },
  editFileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    marginBottom: 6,
  },
  editFileText: {
    fontSize: 13,
    color: '#38BDF8',
    fontWeight: '600',
    flex: 1,
  },
});