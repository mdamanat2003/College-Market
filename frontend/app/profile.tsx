import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  FlatList, 
  Alert, 
  Modal, 
  TextInput, 
  Platform 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { useAuthStore } from '../store/authStore';
import { useOrderStore } from '../store/orderStore';
import OrderCard from '../components/OrderCard';
import Footer from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { PlaceholderImage } from '../components/ui/PlaceholderImage';
import { SafeImage } from '../components/ui/SafeImage';
import { COLORS, SPACING, RADIUS } from '../theme/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { orders, fetchMyOrders, releaseEscrow, isLoading } = useOrderStore();
  const scrollRef = useRef<ScrollView>(null);
  
  const [activeTab, setActiveTab] = useState<'Purchases' | 'Sales'>('Purchases');

  // Edit Profile States
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCollege, setEditCollege] = useState('');
  const [editAvatarUri, setEditAvatarUri] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  const handleBackToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleOpenEditModal = () => {
    setEditName(user?.name || '');
    setEditPhone(user?.phone || '');
    setEditCollege(user?.college || '');
    setEditAvatarUri(user?.avatar || null);
    setIsEditModalVisible(true);
  };

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission Denied!', 'Gallery access is required.');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Square aspect ratio for profile picture
      quality: 0.8,
    });

    if (!result.canceled) {
      setEditAvatarUri(result.assets[0].uri);
    }
  };

  const handleUpdateProfile = async () => {
    if (!editName.trim()) return Alert.alert('Error', 'Please enter your name.');
    if (!editPhone.trim() || editPhone.trim().length !== 10) return Alert.alert('Error', 'Please enter a valid 10-digit phone number.');

    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append('name', editName.trim());
      formData.append('phone', editPhone.trim());
      formData.append('college', editCollege.trim());

      if (editAvatarUri && editAvatarUri !== user?.avatar) {
        let filename = editAvatarUri.split('/').pop() || 'avatar.jpg';
        if (!filename.includes('.')) {
          filename = 'avatar.jpg';
        }
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        if (Platform.OS === 'web') {
          const response = await fetch(editAvatarUri);
          const blob = await response.blob();
          formData.append('avatar', blob, filename);
        } else {
          formData.append('avatar', {
            uri: Platform.OS === 'ios' ? editAvatarUri.replace('file://', '') : editAvatarUri,
            name: filename,
            type,
          } as any);
        }
      }

      const { updateProfile } = useAuthStore.getState();
      const success = await updateProfile(formData);
      if (success) {
        Alert.alert('Success', 'Profile updated successfully!');
        setIsEditModalVisible(false);
      } else {
        const errorMsg = useAuthStore.getState().error || 'Failed to update profile';
        Alert.alert('Failed', errorMsg);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong during update.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReleaseEscrow = async (orderId: string) => {
    Alert.alert(
      'Confirm receipt',
      'Are you sure you have received the item in good condition? Admin will review and release payment to the seller.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            const success = await releaseEscrow(orderId);
            if (success) Alert.alert('Success', 'Marked as received. Admin will release the seller payment.');
          }
        }
      ]
    );
  };

  // ✅ Bulletproof ID matching logic for filtering orders
  const displayedOrders = orders.filter(order => {
    const buyerId = typeof order.buyer === 'object' ? order.buyer?._id : order.buyer;
    const sellerId = typeof order.seller === 'object' ? order.seller?._id : order.seller;
    
    const currentUserId = String(user?._id);

    if (activeTab === 'Purchases') {
      return String(buyerId) === currentUserId;
    } else {
      return String(sellerId) === currentUserId;
    }
  });

  const purchaseOrders = displayedOrders.filter(order => {
    const buyerId = typeof order.buyer === 'object' ? order.buyer?._id : order.buyer;
    return String(buyerId) === String(user?._id);
  });

  const salesOrders = displayedOrders.filter(order => {
    const sellerId = typeof order.seller === 'object' ? order.seller?._id : order.seller;
    return String(sellerId) === String(user?._id);
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Dashboard</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.backBtn}>
          <Ionicons name="log-out-outline" size={24} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} ref={scrollRef}>
        <View style={styles.scrollContent}>
        
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
            )}
          </View>
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{user?.name}</Text>
              <TouchableOpacity onPress={handleOpenEditModal} style={styles.editIconBtn}>
                <Ionicons name="create-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.email}>{user?.email}</Text>
            <View style={styles.collegeBadge}>
              <Ionicons name="school-outline" size={12} color={COLORS.primary} />
              <Text style={styles.collegeText}>{user?.college || 'My University'}</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tab, activeTab === 'Purchases' && styles.activeTab]} onPress={() => setActiveTab('Purchases')}>
            <Text style={[styles.tabText, activeTab === 'Purchases' && styles.activeTabText]}>My Purchases</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'Sales' && styles.activeTab]} onPress={() => setActiveTab('Sales')}>
            <Text style={[styles.tabText, activeTab === 'Sales' && styles.activeTabText]}>My Sales</Text>
          </TouchableOpacity>
        </View>

        {/* Orders List */}
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        ) : activeTab === 'Purchases' && purchaseOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} yet.</Text>
          </View>
        ) : activeTab === 'Sales' && salesOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={COLORS.border} />
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} yet.</Text>
          </View>
        ) : activeTab === 'Purchases' ? (
          <FlatList
            data={purchaseOrders}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <OrderCard item={item} refreshOrders={fetchMyOrders} />}
            scrollEnabled={false}
          />
        ) : (
          salesOrders.map((order) => {
            const buyerIdForCheck = typeof order.buyer === 'object' ? order.buyer?._id : order.buyer;
            const isBuyer = String(user?._id) === String(buyerIdForCheck);
            
            const product = order.product;
            const isEscrowLocked = order.status === 'Paid' || order.status === 'EscrowLocked';

            return (
              <View key={order._id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>Order #{order._id.slice(-6).toUpperCase()}</Text>
                  <View style={[styles.statusBadge, order.status === 'Completed' ? styles.statusCompleted : styles.statusPending]}>
                    <Text style={[styles.statusText, order.status === 'Completed' && styles.statusTextCompleted]}>
                      {order.status === 'Completed' ? 'Completed' : 'Escrow Locked'}
                    </Text>
                  </View>
                </View>

                <View style={styles.productRow}>
                  {product?.images?.[0] ? (
                    <SafeImage uri={product.images[0]} style={styles.productImg} resizeMode="cover" />
                  ) : (
                    <PlaceholderImage style={styles.productImg} label="" size={20} />
                  )}
                  <View style={styles.productDetails}>
                    <Text style={styles.productTitle}>{product?.title}</Text>
                    <Text style={styles.productPrice}>₹{order.amount}</Text>
                    <Text style={styles.partnerText}>
                      {isBuyer ? `Seller: ${order.seller?.name || 'User'}` : `Buyer: ${order.buyer?.name || 'User'}`}
                    </Text>
                  </View>
                </View>

                {/* ESCROW ACTION BUTTONS */}
                {isBuyer && isEscrowLocked && (
                  <View style={styles.actionBox}>
                    <Text style={styles.actionHint}>Have you received the item from the seller?</Text>
                    <Button 
                      title="Item Received" 
                      onPress={() => handleReleaseEscrow(order._id)} 
                    />
                  </View>
                )}

                {!isBuyer && isEscrowLocked && (
                  <View style={styles.actionBoxInfo}>
                    <Ionicons name="information-circle-outline" size={20} color={COLORS.warning} />
                    <Text style={styles.actionHintInfo}>Funds are secure in Escrow. Deliver the item to the buyer so they can release your payment.</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
        </View>
        <Footer onBackToTop={handleBackToTop} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={isEditModalVisible} transparent={true} animationType="fade" onRequestClose={() => setIsEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>

            {/* Avatar Selector */}
            <TouchableOpacity style={styles.avatarSelector} onPress={pickAvatar}>
              <View style={styles.avatarPreviewContainer}>
                {editAvatarUri ? (
                  <Image source={{ uri: editAvatarUri }} style={styles.avatarPreview} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarPlaceholderText}>{editName?.charAt(0).toUpperCase() || 'U'}</Text>
                  </View>
                )}
                <View style={styles.cameraIconBadge}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              </View>
              <Text style={styles.avatarSelectorText}>Change Profile Picture</Text>
            </TouchableOpacity>

            <View style={styles.inputGroup}>
              <Text style={styles.modalLabel}>Full Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter your name"
                placeholderTextColor={COLORS.textMuted}
                value={editName}
                onChangeText={setEditName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.modalLabel}>Phone Number</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter 10-digit phone number"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
                maxLength={10}
                value={editPhone}
                onChangeText={setEditPhone}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.modalLabel}>College</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter college name"
                placeholderTextColor={COLORS.textMuted}
                value={editCollege}
                onChangeText={setEditCollege}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                onPress={() => setIsEditModalVisible(false)} 
                style={styles.cancelBtn}
                disabled={isUpdating}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleUpdateProfile} 
                style={styles.submitBtn}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <ActivityIndicator color={COLORS.background} size="small" />
                ) : (
                  <Text style={styles.submitText}>Save Changes</Text>
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
  header: { height: 60, backgroundColor: COLORS.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  scrollContent: { flexGrow: 1, padding: SPACING.lg, maxWidth: 800, width: '100%', alignSelf: 'center' },
  
  profileCard: { flexDirection: 'row', backgroundColor: COLORS.card, padding: SPACING.lg, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.xl, alignItems: 'center' },
  avatar: { width: 70, height: 70, borderRadius: 35, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: SPACING.lg },
  avatarText: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  avatarImg: { width: 70, height: 70, borderRadius: 35 },
  userInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  editIconBtn: { padding: 4 },
  name: { fontSize: 22, fontWeight: '700', color: COLORS.text },
  email: { fontSize: 14, color: COLORS.textMuted, marginBottom: 4 },
  collegeBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.round, alignSelf: 'flex-start' },
  collegeText: { fontSize: 12, color: COLORS.primary, marginLeft: 4, fontWeight: '500' },
  
  tabContainer: { flexDirection: 'row', marginBottom: SPACING.lg, backgroundColor: COLORS.card, borderRadius: RADIUS.md, padding: 4, borderWidth: 1, borderColor: COLORS.border },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: RADIUS.sm },
  activeTab: { backgroundColor: COLORS.surface },
  tabText: { fontSize: 15, fontWeight: '600', color: COLORS.textMuted },
  activeTabText: { color: COLORS.primary },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 200 },
  emptyText: { fontSize: 16, color: COLORS.textMuted, marginTop: SPACING.sm },

  orderCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.surface, paddingBottom: SPACING.sm, marginBottom: SPACING.sm },
  orderId: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.sm },
  statusPending: { backgroundColor: '#FEF3C7' },
  statusCompleted: { backgroundColor: '#D1FAE5' },
  statusText: { fontSize: 12, fontWeight: '700', color: '#B45309' },
  statusTextCompleted: { color: '#065F46' },
  
  productRow: { flexDirection: 'row', alignItems: 'center' },
  productImg: { width: 60, height: 60, borderRadius: RADIUS.sm, backgroundColor: COLORS.surface, marginRight: SPACING.md },
  productDetails: { flex: 1 },
  productTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  productPrice: { fontSize: 16, fontWeight: '700', color: COLORS.accent, marginTop: 2 },
  partnerText: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },

  actionBox: { marginTop: SPACING.md, backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  actionHint: { fontSize: 13, color: COLORS.text, marginBottom: SPACING.sm, textAlign: 'center', fontWeight: '500' },
  actionBoxInfo: { marginTop: SPACING.md, backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: SPACING.md, borderRadius: RADIUS.md, flexDirection: 'row', alignItems: 'flex-start', borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.2)' },
  actionHintInfo: { fontSize: 13, color: COLORS.warning, marginLeft: SPACING.sm, flex: 1, lineHeight: 18 },
  footerWrapper: { marginHorizontal: -SPACING.lg, marginTop: 40 },

  // Edit Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: COLORS.card, padding: 24, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border, width: '100%', maxWidth: 450, alignSelf: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: COLORS.heading, textAlign: 'center' },
  avatarSelector: { alignItems: 'center', marginBottom: 20 },
  avatarPreviewContainer: { position: 'relative', width: 80, height: 80, borderRadius: 40, overflow: 'visible' },
  avatarPreview: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: COLORS.primary },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.primary },
  avatarPlaceholderText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  cameraIconBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primary, width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: COLORS.card },
  avatarSelectorText: { fontSize: 13, color: COLORS.primary, marginTop: 8, fontWeight: '600' },
  inputGroup: { gap: 8, marginBottom: 16 },
  modalLabel: { fontSize: 14, fontWeight: '700', color: COLORS.textMuted },
  modalInput: { minHeight: 52, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, paddingHorizontal: 16, fontSize: 16, backgroundColor: COLORS.background, color: COLORS.heading },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, gap: 15 },
  cancelBtn: { padding: 12, justifyContent: 'center' },
  cancelText: { color: COLORS.textMuted, fontWeight: 'bold', fontSize: 15 },
  submitBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 22, paddingVertical: 12, borderRadius: 12, justifyContent: 'center', alignItems: 'center', minWidth: 120 },
  submitText: { color: COLORS.background, fontWeight: 'bold', fontSize: 15 },
});
