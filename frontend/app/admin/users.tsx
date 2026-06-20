import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAdminStore } from '../../store/adminStore';
import { COLORS, SPACING, RADIUS } from '../../theme/colors';

export default function ManageUsersScreen() {
  const router = useRouter();
  const { users, fetchUsers, toggleBlockUser, isLoading } = useAdminStore();
  const [search, setSearch] = useState('');

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
        </View>
        <Text style={styles.userDetail}><Ionicons name="mail-outline" /> {item.email}</Text>
        <Text style={styles.userDetail}><Ionicons name="school-outline" /> {item.college || 'N/A'}</Text>
        <Text style={styles.userDetail}><Ionicons name="call-outline" /> {item.phone || 'N/A'}</Text>
      </View>

      <TouchableOpacity 
        style={[styles.actionBtn, item.isBlocked ? styles.unblockBtn : styles.blockBtn]}
        onPress={() => toggleBlockUser(item._id)}
      >
        <Text style={[styles.actionBtnText, item.isBlocked ? styles.unblockBtnText : styles.blockBtnText]}>
          {item.isBlocked ? 'Unblock' : 'Block'}
        </Text>
      </TouchableOpacity>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { height: 60, backgroundColor: COLORS.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, margin: SPACING.md, paddingHorizontal: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  searchIcon: { marginRight: SPACING.sm },
  searchInput: { flex: 1, height: 45, color: COLORS.text, fontSize: 15 },

  listContainer: { padding: SPACING.md, gap: SPACING.sm },
  userCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.card, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  userInfo: { flex: 1, gap: 4 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  userName: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  userDetail: { fontSize: 13, color: COLORS.textMuted },
  
  blockedBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#FCA5A5' },
  badgeText: { color: '#DC2626', fontSize: 11, fontWeight: '600' },

  actionBtn: { paddingHorizontal: SPACING.md, paddingVertical: 8, justifyContent: 'center', alignItems: 'center', minWidth: 80 },
  blockBtn: { backgroundColor: 'transparent' },
  unblockBtn: { backgroundColor: 'transparent' },
  actionBtnText: { fontSize: 14, fontWeight: '600' },
  blockBtnText: { color: '#EF4444' },
  unblockBtnText: { color: '#10B981' },
  emptyText: { textAlign: 'center', color: COLORS.textMuted, marginTop: SPACING.xl, fontSize: 15 }
});