import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Image, Modal, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdminStore } from '../../store/adminStore';
import { COLORS, SPACING, RADIUS } from '../../theme/colors';

export default function ManageUsersScreen() {
  const router = useRouter();
  const { users, fetchUsers, toggleBlockUser, toggleVerifyUser, updateUserPassword, deleteUser, isLoading } = useAdminStore();
  const [search, setSearch] = useState('');
  const [selectedIdProofUrl, setSelectedIdProofUrl] = useState<string | null>(null);
  
  // State for Password Reset
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStatusMsg, setPasswordStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = () => {
    fetchUsers(search); 
  };

  const handleDeleteUser = (id: string, name: string) => {
    const performDelete = async () => {
      const res = await deleteUser(id);
      if (!res.success && Platform.OS === 'web') {
        alert(res.message);
      }
    };

    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm(`Are you sure you want to delete user "${name}"? This action cannot be undone.`);
      if (confirmDelete) performDelete();
    } else {
      Alert.alert(
        "Delete User",
        `Are you sure you want to delete user "${name}"? This action cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: performDelete }
        ]
      );
    }
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

        <TouchableOpacity 
          style={[styles.actionBtn, styles.passwordBtn]}
          onPress={() => {
            setSelectedUserForPassword(item);
            setNewPassword('');
            setShowPassword(false);
            setPasswordStatusMsg(null);
          }}
        >
          <Text style={[styles.actionBtnText, styles.passwordBtnText]}>
            Reset Pass
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionBtn, styles.deleteUserBtn]}
          onPress={() => handleDeleteUser(item._id, item.name)}
        >
          <Text style={[styles.actionBtnText, styles.deleteUserBtnText]}>
            Delete
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

      {/* Password Reset Modal */}
      <Modal
        visible={Boolean(selectedUserForPassword)}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedUserForPassword(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reset User Password</Text>
              <TouchableOpacity onPress={() => setSelectedUserForPassword(null)} style={styles.modalCloseBtn}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>
              Target User: <Text style={{ color: COLORS.text, fontWeight: '600' }}>{selectedUserForPassword?.name}</Text> ({selectedUserForPassword?.email})
            </Text>

            {passwordStatusMsg && (
              <View style={[styles.statusBox, passwordStatusMsg.isError ? styles.errorBox : styles.successBox]}>
                <Text style={passwordStatusMsg.isError ? styles.errorBoxText : styles.successBoxText}>
                  {passwordStatusMsg.text}
                </Text>
              </View>
            )}

            <View style={styles.passwordInputWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter new password (min 6 chars)"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.randomPassBtn}
              onPress={() => {
                const rand = Math.random().toString(36).slice(-8) + 'A1!';
                setNewPassword(rand);
                setShowPassword(true);
              }}
            >
              <Ionicons name="key-outline" size={14} color={COLORS.primary} />
              <Text style={styles.randomPassText}>Generate Random Password</Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.cancelModalBtn]} 
                onPress={() => setSelectedUserForPassword(null)}
              >
                <Text style={styles.cancelModalBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalBtn, styles.saveModalBtn]}
                disabled={isSubmittingPassword}
                onPress={async () => {
                  if (!selectedUserForPassword) return;
                  if (newPassword.trim().length < 6) {
                    setPasswordStatusMsg({ text: 'Password must be at least 6 characters', isError: true });
                    return;
                  }
                  setIsSubmittingPassword(true);
                  setPasswordStatusMsg(null);
                  const res = await updateUserPassword(selectedUserForPassword._id, newPassword);
                  setIsSubmittingPassword(false);
                  if (res.success) {
                    setPasswordStatusMsg({ text: res.message, isError: false });
                    setTimeout(() => {
                      setSelectedUserForPassword(null);
                      setPasswordStatusMsg(null);
                    }, 1500);
                  } else {
                    setPasswordStatusMsg({ text: res.message, isError: true });
                  }
                }}
              >
                {isSubmittingPassword ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.saveModalBtnText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
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
  passwordBtn: { backgroundColor: 'transparent' },
  deleteUserBtn: { backgroundColor: 'transparent' },
  actionBtnText: { fontSize: 14, fontWeight: '600' },
  blockBtnText: { color: '#EF4444' },
  unblockBtnText: { color: '#10B981' },
  verifyBtnText: { color: '#38BDF8' },
  unverifyBtnText: { color: '#E2E8F0' },
  passwordBtnText: { color: '#F59E0B' },
  deleteUserBtnText: { color: '#DC2626' },
  emptyText: { textAlign: 'center', color: COLORS.textMuted, marginTop: SPACING.xl, fontSize: 15 },

  // Modal styling
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  modalContent: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, width: '100%', maxWidth: 500, padding: SPACING.md, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', gap: SPACING.md },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)', paddingBottom: SPACING.sm },
  modalTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  modalCloseBtn: { padding: SPACING.xs },
  modalImage: { width: '100%', height: 350, borderRadius: RADIUS.md },

  passwordInputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.background, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: SPACING.md },
  passwordInput: { flex: 1, height: 45, color: COLORS.text, fontSize: 14 },
  eyeIcon: { padding: SPACING.xs },

  randomPassBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 4 },
  randomPassText: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },

  statusBox: { padding: SPACING.sm, borderRadius: RADIUS.sm },
  errorBox: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.4)' },
  errorBoxText: { color: '#EF4444', fontSize: 13, textAlign: 'center' },
  successBox: { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.4)' },
  successBoxText: { color: '#10B981', fontSize: 13, textAlign: 'center' },

  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: SPACING.sm, marginTop: SPACING.xs },
  modalBtn: { paddingHorizontal: SPACING.md, paddingVertical: 10, borderRadius: RADIUS.md, justifyContent: 'center', alignItems: 'center' },
  cancelModalBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
  cancelModalBtnText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  saveModalBtn: { backgroundColor: COLORS.primary, minWidth: 120 },
  saveModalBtnText: { color: '#000', fontSize: 14, fontWeight: '700' },
});