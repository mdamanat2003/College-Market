import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Image, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdminStore } from '../../store/adminStore';
import { COLORS, SPACING, RADIUS } from '../../theme/colors';

export default function ManageUsersScreen() {
  const router = useRouter();
  const { users, fetchUsers, toggleBlockUser, toggleVerifyUser, isLoading } = useAdminStore();
  const [search, setSearch] = useState('');
  const [selectedIdProofUrl, setSelectedIdProofUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = () => {
    fetchUsers(search); 
  };

  const renderUserItem = ({ item }: { item: any }) => (
    <View style={styles.userCard}>
      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.userName}>{item.name}</Text>
          {item.isBlocked && (
            <View style={styles.blockedBadge}><Text style={styles.badgeText}>Blocked</Text></View>
          )}
          {item.isVerified ? (
            <View style={styles.verifiedBadge}><Text style={styles.verifiedBadgeText}>Verified</Text></View>
          ) : (
            <View style={styles.pendingBadge}><Text style={styles.pendingBadgeText}>Pending</Text></View>
          )}
        </View>
        <Text style={styles.userDetail}><Ionicons name="mail-outline" /> {item.email}</Text>
        <Text style={styles.userDetail}><Ionicons name="school-outline" /> {item.college || 'N/A'}</Text>
        <Text style={styles.userDetail}><Ionicons name="call-outline" /> {item.phone || 'N/A'}</Text>
        
        {/* ID Proof Display */}
        <View style={styles.idProofRow}>
          {item.collegeIdProof ? (
            <TouchableOpacity 
              style={styles.viewProofBtn}
              onPress={() => setSelectedIdProofUrl(item.collegeIdProof)}
              activeOpacity={0.7}
            >
              <Ionicons name="image-outline" size={14} color={COLORS.primary} />
              <Text style={styles.viewProofText}>View ID Proof</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.noProofText}>No ID Proof Uploaded</Text>
          )}
        </View>
      </View>

      <View style={styles.actionsColumn}>
        <TouchableOpacity 
          style={[styles.actionBtn, item.isBlocked ? styles.unblockBtn : styles.blockBtn]}
          onPress={() => toggleBlockUser(item._id)}
        >
          <Text style={[styles.actionBtnText, item.isBlocked ? styles.unblockBtnText : styles.blockBtnText]}>
            {item.isBlocked ? 'Unblock' : 'Block'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionBtn, item.isVerified ? styles.unverifyBtn : styles.verifyBtn]}
          onPress={() => toggleVerifyUser(item._id)}
        >
          <Text style={[styles.actionBtnText, item.isVerified ? styles.unverifyBtnText : styles.verifyBtnText]}>
            {item.isVerified ? 'Revoke' : 'Verify'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Users</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, or college..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>

      {/* Users List */}
      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={renderUserItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No users found.</Text>
          }
        />
      )}

      {/* ID Proof Modal */}
      <Modal
        visible={Boolean(selectedIdProofUrl)}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedIdProofUrl(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>College ID Proof</Text>
              <TouchableOpacity onPress={() => setSelectedIdProofUrl(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            {selectedIdProofUrl ? (
              <Image source={{ uri: selectedIdProofUrl }} style={styles.modalImage} resizeMode="contain" />
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { height: 60, backgroundColor: COLORS.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, margin: SPACING.md, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  searchIcon: { marginRight: SPACING.sm },
  searchInput: { flex: 1, height: 45, color: COLORS.text, fontSize: 15 },

  listContainer: { padding: SPACING.md, paddingTop: SPACING.lg, gap: SPACING.sm },
  userCard: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.card, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', gap: SPACING.sm },
  userInfo: { flex: 1, minWidth: 200, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  userName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  userDetail: { fontSize: 13, color: COLORS.textMuted },
  
  blockedBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#FCA5A5' },
  badgeText: { color: '#DC2626', fontSize: 11, fontWeight: '600' },
  
  verifiedBadge: { backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.3)' },
  verifiedBadgeText: { color: '#10B981', fontSize: 11, fontWeight: '600' },

  pendingBadge: { backgroundColor: 'rgba(245, 158, 11, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.3)' },
  pendingBadgeText: { color: '#F59E0B', fontSize: 11, fontWeight: '600' },

  idProofRow: { marginTop: 6, flexDirection: 'row', alignItems: 'center' },
  viewProofBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(56, 189, 248, 0.08)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(56, 189, 248, 0.2)' },
  viewProofText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  noProofText: { fontSize: 12, fontStyle: 'italic', color: COLORS.textMuted },

  actionsColumn: { flexDirection: 'column', alignItems: 'flex-end', gap: 6 },
  actionBtn: { paddingHorizontal: SPACING.md, paddingVertical: 8, justifyContent: 'center', alignItems: 'center', minWidth: 80 },
  blockBtn: { backgroundColor: 'transparent' },
  unblockBtn: { backgroundColor: 'transparent' },
  verifyBtn: { backgroundColor: 'transparent' },
  unverifyBtn: { backgroundColor: 'transparent' },
  actionBtnText: { fontSize: 14, fontWeight: '600' },
  blockBtnText: { color: '#EF4444' },
  unblockBtnText: { color: '#10B981' },
  verifyBtnText: { color: '#38BDF8' },
  unverifyBtnText: { color: '#E2E8F0' },
  emptyText: { textAlign: 'center', color: COLORS.textMuted, marginTop: SPACING.xl, fontSize: 15 },

  // Modal styling
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  modalContent: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, width: '100%', maxWidth: 500, padding: SPACING.md, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', gap: SPACING.md },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)', paddingBottom: SPACING.sm },
  modalTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  modalCloseBtn: { padding: SPACING.xs },
  modalImage: { width: '100%', height: 350, borderRadius: RADIUS.md },
});