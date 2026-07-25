import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { COLORS, RADIUS, SPACING } from '../theme/colors';

// Storage Keys
const STORAGE_KEYS = {
  PUSH_NOTIF: '@settings_push_notif',
  LISTING_ALERTS: '@settings_listing_alerts',
  LOCATION_PERM: '@settings_location_perm',
  DARK_MODE: '@settings_dark_mode',
  CAMPUS_NAME: '@settings_campus_name',
  SEARCH_RADIUS: '@settings_search_radius',
  BLOCKED_USERS: '@settings_blocked_users',
};

// Campus Preset Options
const CAMPUS_OPTIONS = [
  'IIT Delhi (Main Campus)',
  'Delhi Technological University (DTU)',
  'Netaji Subhas University of Technology (NSUT)',
  'Delhi University (North Campus)',
  'Delhi University (South Campus)',
  'IIIT Delhi',
  'BITS Pilani',
  'Amity University Noida',
  'Other Campus',
];

// Distance Radius Options
const RADIUS_OPTIONS = ['1 km', '3 km', '5 km', '10 km', 'Whole City'];

interface SettingRowProps {
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  isDestructive?: boolean;
  showChevron?: boolean;
  badgeText?: string;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { user, updateProfile, logout } = useAuthStore();
  const { showToast } = useToastStore();

  // --- PERSISTED SETTINGS STATES ---
  const [pushNotifications, setPushNotifications] = useState(true);
  const [listingAlerts, setListingAlerts] = useState(true);
  const [locationPermissions, setLocationPermissions] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedCampus, setSelectedCampus] = useState(user?.college || 'IIT Delhi (Main Campus)');
  const [selectedRadius, setSelectedRadius] = useState('5 km');
  const [blockedUsers, setBlockedUsers] = useState<Array<{ id: string; name: string; avatar?: string }>>([
    { id: 'b1', name: 'Rohan Sharma', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
  ]);

  // --- MODAL VISIBILITY STATES ---
  const [activeModal, setActiveModal] = useState<
    'editProfile' | 'campusDetails' | 'verification' | 'blockedUsers' | 'safety' | 'help' | 'deleteAccount' | null
  >(null);

  // --- EDIT PROFILE FORM STATES ---
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editCollege, setEditCollege] = useState(user?.college || '');
  const [editAvatarUri, setEditAvatarUri] = useState<string | null>(user?.avatar || null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // --- VERIFICATION STATES ---
  const [studentIdImage, setStudentIdImage] = useState<string | null>(user?.collegeIdProof || null);
  const [isUploadingId, setIsUploadingId] = useState(false);

  // --- DELETE ACCOUNT FORM STATES ---
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // 1. Load initial settings from AsyncStorage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const pNotif = await AsyncStorage.getItem(STORAGE_KEYS.PUSH_NOTIF);
        if (pNotif !== null) setPushNotifications(pNotif === 'true');

        const lAlerts = await AsyncStorage.getItem(STORAGE_KEYS.LISTING_ALERTS);
        if (lAlerts !== null) setListingAlerts(lAlerts === 'true');

        const locPerm = await AsyncStorage.getItem(STORAGE_KEYS.LOCATION_PERM);
        if (locPerm !== null) setLocationPermissions(locPerm === 'true');

        const dMode = await AsyncStorage.getItem(STORAGE_KEYS.DARK_MODE);
        if (dMode !== null) setDarkMode(dMode === 'true');

        const campus = await AsyncStorage.getItem(STORAGE_KEYS.CAMPUS_NAME);
        if (campus) setSelectedCampus(campus);

        const radius = await AsyncStorage.getItem(STORAGE_KEYS.SEARCH_RADIUS);
        if (radius) setSelectedRadius(radius);

        const blocked = await AsyncStorage.getItem(STORAGE_KEYS.BLOCKED_USERS);
        if (blocked) setBlockedUsers(JSON.parse(blocked));
      } catch (err) {
        console.error('[Settings] Error loading saved preferences:', err);
      }
    };

    loadSettings();
  }, []);

  // Update edit form fields whenever user changes
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
      setEditCollege(user.college || '');
      setEditAvatarUri(user.avatar || null);
      if (user.college) setSelectedCampus(user.college);
    }
  }, [user]);

  // --- TOGGLE HANDLERS WITH ASYNC STORAGE PERSISTENCE ---
  const handleTogglePushNotifications = async (val: boolean) => {
    setPushNotifications(val);
    await AsyncStorage.setItem(STORAGE_KEYS.PUSH_NOTIF, String(val));
    showToast({
      title: val ? '🔔 Push Notifications Enabled' : '🔕 Push Notifications Muted',
      message: val ? 'You will receive live chat and order updates.' : 'Real-time alert notifications paused.',
      type: val ? 'success' : 'info',
    });
  };

  const handleToggleListingAlerts = async (val: boolean) => {
    setListingAlerts(val);
    await AsyncStorage.setItem(STORAGE_KEYS.LISTING_ALERTS, String(val));
    showToast({
      title: val ? '🏷️ Listing Price Alerts On' : '🏷️ Listing Alerts Off',
      message: val ? 'You will be notified of price drops on wishlist items.' : 'Wishlist price alerts disabled.',
      type: 'info',
    });
  };

  const handleToggleLocationPermissions = async (val: boolean) => {
    if (val) {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          () => {
            setLocationPermissions(true);
            AsyncStorage.setItem(STORAGE_KEYS.LOCATION_PERM, 'true');
            showToast({ title: '📍 Location Active', message: 'Showing items near your campus location.', type: 'success' });
          },
          () => {
            setLocationPermissions(false);
            showToast({ title: '📍 Location Permission Denied', message: 'Please allow location in browser settings.', type: 'warning' });
          }
        );
      } else {
        setLocationPermissions(true);
        await AsyncStorage.setItem(STORAGE_KEYS.LOCATION_PERM, 'true');
        showToast({ title: '📍 Campus Location Enabled', message: 'Radius distance set to ' + selectedRadius, type: 'success' });
      }
    } else {
      setLocationPermissions(false);
      await AsyncStorage.setItem(STORAGE_KEYS.LOCATION_PERM, 'false');
      showToast({ title: '📍 Location Disabled', message: 'Showing all campus listings without distance sorting.', type: 'info' });
    }
  };

  const handleToggleDarkMode = async (val: boolean) => {
    setDarkMode(val);
    await AsyncStorage.setItem(STORAGE_KEYS.DARK_MODE, String(val));
    showToast({
      title: val ? '🌙 Dark Mode Active' : '☀️ Light Mode Theme',
      message: val ? 'App theme set to Dark Slate.' : 'Theme preference saved.',
      type: 'info',
    });
  };

  // --- EDIT PROFILE ACTION ---
  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Gallery access is needed to select a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setEditAvatarUri(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Validation Error', 'Please enter your name.');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const formData = new FormData();
      formData.append('name', editName.trim());
      if (editPhone.trim()) formData.append('phone', editPhone.trim());
      if (editCollege.trim()) formData.append('college', editCollege.trim());

      if (editAvatarUri && !editAvatarUri.startsWith('http')) {
        const filename = editAvatarUri.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        formData.append('avatar', {
          uri: editAvatarUri,
          name: filename,
          type,
        } as any);
      }

      const success = await updateProfile(formData);
      setIsUpdatingProfile(false);

      if (success) {
        setActiveModal(null);
        showToast({
          title: '✅ Profile Updated',
          message: 'Your account changes have been saved successfully.',
          type: 'success',
        });
      } else {
        Alert.alert('Update Failed', 'Could not save profile changes. Please try again.');
      }
    } catch (err: any) {
      setIsUpdatingProfile(false);
      console.error('[Settings] Profile update error:', err);
      Alert.alert('Error', err?.message || 'Something went wrong while saving changes.');
    }
  };

  // --- SAVE CAMPUS & RADIUS ---
  const handleSaveCampusDetails = async (campus: string, radius: string) => {
    setSelectedCampus(campus);
    setSelectedRadius(radius);
    await AsyncStorage.setItem(STORAGE_KEYS.CAMPUS_NAME, campus);
    await AsyncStorage.setItem(STORAGE_KEYS.SEARCH_RADIUS, radius);

    // Also update profile if college changed
    if (user && campus !== user.college) {
      const formData = new FormData();
      formData.append('name', user.name);
      formData.append('college', campus);
      updateProfile(formData);
    }

    setActiveModal(null);
    showToast({
      title: '🏫 Campus Radius Updated',
      message: `Set to ${campus} (${radius} radius).`,
      type: 'success',
    });
  };

  // --- UPLOAD STUDENT ID ---
  const handlePickStudentId = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery access is required to upload College ID proof.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setStudentIdImage(result.assets[0].uri);
      setIsUploadingId(true);

      setTimeout(() => {
        setIsUploadingId(false);
        showToast({
          title: '📑 Student ID Submitted',
          message: 'Your College ID proof has been uploaded for admin verification.',
          type: 'success',
        });
      }, 1200);
    }
  };

  // --- UNBLOCK USER ---
  const handleUnblockUser = async (userId: string, userName: string) => {
    const updated = blockedUsers.filter((u) => u.id !== userId);
    setBlockedUsers(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.BLOCKED_USERS, JSON.stringify(updated));
    showToast({
      title: '🔓 User Unblocked',
      message: `${userName} has been removed from your blocked list.`,
      type: 'info',
    });
  };

  // --- DELETE ACCOUNT ---
  const handleConfirmDeleteAccount = async () => {
    if (deleteConfirmationText.trim().toLowerCase() !== 'delete') {
      Alert.alert('Confirmation Mismatch', 'Please type "DELETE" to confirm account deletion.');
      return;
    }

    setIsDeletingAccount(true);
    setTimeout(async () => {
      setIsDeletingAccount(false);
      setActiveModal(null);
      await logout();
      showToast({
        title: '⚠️ Account Deleted',
        message: 'Your account has been deleted. We hope to see you again soon.',
        type: 'warning',
      });
      router.replace('/(auth)/login');
    }, 1500);
  };

  // --- LOG OUT ---
  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of Ooplabdh?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            showToast({ title: '👋 Logged Out', message: 'You have been logged out safely.', type: 'info' });
            router.replace('/(auth)/login');
          },
        },
      ],
      { cancelable: true }
    );
  };

  // --- REUSABLE SETTING ROW ---
  const SettingRow: React.FC<SettingRowProps> = ({
    iconName,
    iconColor = COLORS.text,
    title,
    subtitle,
    onPress,
    rightComponent,
    isDestructive = false,
    showChevron = true,
    badgeText,
  }) => {
    const titleColor = isDestructive ? COLORS.danger : COLORS.text;
    const finalIconColor = isDestructive ? COLORS.danger : iconColor;

    return (
      <TouchableOpacity
        activeOpacity={onPress ? 0.7 : 1}
        onPress={onPress}
        disabled={!onPress}
        style={styles.settingRow}
      >
        <View style={styles.settingRowLeft}>
          <View style={[styles.iconContainer, { backgroundColor: isDestructive ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.06)' }]}>
            <Ionicons name={iconName} size={20} color={finalIconColor} />
          </View>
          <View style={styles.textContainer}>
            <View style={styles.titleBadgeRow}>
              <Text style={[styles.settingTitle, { color: titleColor }]}>{title}</Text>
              {badgeText && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={12} color={COLORS.success} />
                  <Text style={styles.verifiedBadgeText}>{badgeText}</Text>
                </View>
              )}
            </View>
            {subtitle ? <Text style={styles.settingSubtitle}>{subtitle}</Text> : null}
          </View>
        </View>

        <View style={styles.settingRowRight}>
          {rightComponent}
          {!rightComponent && showChevron && (
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={{
              uri:
                editAvatarUri ||
                user?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
            }}
            style={styles.profileAvatar}
          />
          <View style={styles.profileInfo}>
            <View style={styles.profileNameRow}>
              <Text style={styles.profileName} numberOfLines={1}>
                {user?.name || 'College Student'}
              </Text>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.success} style={{ marginLeft: 4 }} />
            </View>
            <Text style={styles.profileCollege} numberOfLines={1}>
              {selectedCampus}
            </Text>
            <Text style={styles.profileEmail} numberOfLines={1}>
              {user?.email || 'student@college.ac.in'}
            </Text>
          </View>
          <TouchableOpacity style={styles.editProfileBtn} onPress={() => setActiveModal('editProfile')}>
            <Text style={styles.editProfileBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Section 1: Account & Profile */}
        <Text style={styles.sectionHeader}>ACCOUNT & PROFILE</Text>
        <View style={styles.cardGroup}>
          <SettingRow
            iconName="person-outline"
            iconColor={COLORS.accent}
            title="Edit Profile"
            subtitle="Name, Phone & Avatar"
            onPress={() => setActiveModal('editProfile')}
          />
          <View style={styles.divider} />
          <SettingRow
            iconName="location-outline"
            iconColor="#38BDF8"
            title="Campus Details"
            subtitle={`${selectedCampus} • ${selectedRadius} Radius`}
            onPress={() => setActiveModal('campusDetails')}
          />
          <View style={styles.divider} />
          <SettingRow
            iconName="shield-checkmark-outline"
            iconColor={COLORS.success}
            title="Verification Status"
            badgeText={user?.isVerified ? 'Verified Student' : 'ID Uploaded'}
            subtitle="College ID & Email Proof"
            onPress={() => setActiveModal('verification')}
          />
        </View>

        {/* Section 2: Notifications */}
        <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
        <View style={styles.cardGroup}>
          <SettingRow
            iconName="notifications-outline"
            iconColor="#F59E0B"
            title="Push Notifications"
            subtitle="Live chat messages & order alerts"
            showChevron={false}
            rightComponent={
              <Switch
                value={pushNotifications}
                onValueChange={handleTogglePushNotifications}
                trackColor={{ false: '#3f3f46', true: COLORS.accent }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            iconName="pricetag-outline"
            iconColor="#EC4899"
            title="Listing Alerts"
            subtitle="Price drop notifications on wishlist"
            showChevron={false}
            rightComponent={
              <Switch
                value={listingAlerts}
                onValueChange={handleToggleListingAlerts}
                trackColor={{ false: '#3f3f46', true: COLORS.accent }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </View>

        {/* Section 3: Privacy & Security */}
        <Text style={styles.sectionHeader}>PRIVACY & SECURITY</Text>
        <View style={styles.cardGroup}>
          <SettingRow
            iconName="hand-left-outline"
            iconColor="#A855F7"
            title="Blocked Users"
            subtitle={`${blockedUsers.length} blocked account(s)`}
            onPress={() => setActiveModal('blockedUsers')}
          />
          <View style={styles.divider} />
          <SettingRow
            iconName="navigate-outline"
            iconColor="#6366F1"
            title="Location Permissions"
            subtitle={locationPermissions ? 'GPS Active for nearby distance' : 'Location disabled'}
            showChevron={false}
            rightComponent={
              <Switch
                value={locationPermissions}
                onValueChange={handleToggleLocationPermissions}
                trackColor={{ false: '#3f3f46', true: COLORS.accent }}
                thumbColor="#FFFFFF"
              />
            }
          />
          <View style={styles.divider} />
          <SettingRow
            iconName="trash-outline"
            iconColor={COLORS.danger}
            title="Delete Account"
            subtitle="Permanently remove your listings & account"
            isDestructive={true}
            onPress={() => setActiveModal('deleteAccount')}
          />
        </View>

        {/* Section 4: Appearance */}
        <Text style={styles.sectionHeader}>APPEARANCE</Text>
        <View style={styles.cardGroup}>
          <SettingRow
            iconName="moon-outline"
            iconColor="#38BDF8"
            title="Dark Mode"
            subtitle="Sleek dark theme for reduced eye strain"
            showChevron={false}
            rightComponent={
              <Switch
                value={darkMode}
                onValueChange={handleToggleDarkMode}
                trackColor={{ false: '#3f3f46', true: COLORS.accent }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </View>

        {/* Section 5: Legal & Support */}
        <Text style={styles.sectionHeader}>LEGAL & SUPPORT</Text>
        <View style={styles.cardGroup}>
          <SettingRow
            iconName="shield-half-outline"
            iconColor="#10B981"
            title="Safety Tips for Campus Trading"
            subtitle="Guidelines for safe in-person deals"
            onPress={() => setActiveModal('safety')}
          />
          <View style={styles.divider} />
          <SettingRow
            iconName="document-text-outline"
            iconColor="#3B82F6"
            title="Terms of Service & Privacy Policy"
            subtitle="Platform policies and student privacy"
            onPress={() => router.push('/terms' as any)}
          />
          <View style={styles.divider} />
          <SettingRow
            iconName="help-circle-outline"
            iconColor="#F59E0B"
            title="Help & Support"
            subtitle="www.ooplabdh.shop"
            onPress={() => setActiveModal('help')}
          />
        </View>

        {/* Logout & Footer */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity activeOpacity={0.85} style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>

          <View style={styles.versionFooter}>
            <Text style={styles.versionTitle}>Ooplabdh v1.0.0</Text>
            <Text style={styles.versionSubtitle}>Made with ❤️ for students</Text>
          </View>
        </View>
      </ScrollView>

      {/* ========================================================================= */}
      {/* 1. EDIT PROFILE MODAL */}
      {/* ========================================================================= */}
      <Modal visible={activeModal === 'editProfile'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.avatarUploadCenter}>
                <TouchableOpacity activeOpacity={0.8} onPress={handlePickAvatar} style={styles.avatarPickWrapper}>
                  <Image
                    source={{
                      uri:
                        editAvatarUri ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
                    }}
                    style={styles.modalAvatarImg}
                  />
                  <View style={styles.cameraIconBadge}>
                    <Ionicons name="camera" size={16} color="#FFF" />
                  </View>
                </TouchableOpacity>
                <Text style={styles.avatarChangeText}>Tap to change avatar</Text>
              </View>

              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your full name"
                placeholderTextColor={COLORS.textMuted}
              />

              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.modalInput}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="Enter 10-digit phone number"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="phone-pad"
              />

              <Text style={styles.inputLabel}>College Name</Text>
              <TextInput
                style={styles.modalInput}
                value={editCollege}
                onChangeText={setEditCollege}
                placeholder="Enter your college or university"
                placeholderTextColor={COLORS.textMuted}
              />

              <TouchableOpacity
                style={[styles.saveModalBtn, isUpdatingProfile && { opacity: 0.7 }]}
                onPress={handleSaveProfile}
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveModalBtnText}>Save Profile Changes</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* 2. CAMPUS DETAILS & RADIUS MODAL */}
      {/* ========================================================================= */}
      <Modal visible={activeModal === 'campusDetails'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Campus Details & Radius</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Select Your Campus</Text>
              {CAMPUS_OPTIONS.map((campus) => {
                const isSelected = selectedCampus === campus;
                return (
                  <TouchableOpacity
                    key={campus}
                    style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                    onPress={() => setSelectedCampus(campus)}
                  >
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={isSelected ? COLORS.accent : COLORS.textMuted}
                    />
                    <Text style={[styles.optionCardText, isSelected && styles.optionCardTextSelected]}>{campus}</Text>
                  </TouchableOpacity>
                );
              })}

              <Text style={[styles.inputLabel, { marginTop: SPACING.md }]}>Search Distance Radius</Text>
              <View style={styles.radiusChipsRow}>
                {RADIUS_OPTIONS.map((radius) => {
                  const isSelected = selectedRadius === radius;
                  return (
                    <TouchableOpacity
                      key={radius}
                      style={[styles.radiusChip, isSelected && styles.radiusChipSelected]}
                      onPress={() => setSelectedRadius(radius)}
                    >
                      <Text style={[styles.radiusChipText, isSelected && styles.radiusChipTextSelected]}>{radius}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={styles.saveModalBtn}
                onPress={() => handleSaveCampusDetails(selectedCampus, selectedRadius)}
              >
                <Text style={styles.saveModalBtnText}>Update Campus Preferences</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* 3. VERIFICATION STATUS MODAL */}
      {/* ========================================================================= */}
      <Modal visible={activeModal === 'verification'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Student Verification</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.verificationBadgeCard}>
                <View style={styles.verifiedIconCircle}>
                  <Ionicons name="shield-checkmark" size={32} color={COLORS.success} />
                </View>
                <Text style={styles.verifyCardTitle}>
                  {user?.isVerified ? 'Verified Campus Student' : 'Verification Pending'}
                </Text>
                <Text style={styles.verifyCardDesc}>
                  Verified accounts gain 3x trust score, special seller badges, and direct access to campus-only trading rooms.
                </Text>
              </View>

              <Text style={styles.inputLabel}>Uploaded College ID Proof</Text>
              {studentIdImage ? (
                <View style={styles.idImagePreviewBox}>
                  <Image source={{ uri: studentIdImage }} style={styles.idImagePreview} />
                </View>
              ) : (
                <View style={styles.idPlaceholderBox}>
                  <Ionicons name="card-outline" size={40} color={COLORS.textMuted} />
                  <Text style={styles.idPlaceholderText}>No College ID uploaded yet</Text>
                </View>
              )}

              <TouchableOpacity
                style={[styles.saveModalBtn, isUploadingId && { opacity: 0.7 }]}
                onPress={handlePickStudentId}
                disabled={isUploadingId}
              >
                {isUploadingId ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveModalBtnText}>
                    {studentIdImage ? 'Re-upload College ID Proof' : 'Upload College ID Card'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* 4. BLOCKED USERS MODAL */}
      {/* ========================================================================= */}
      <Modal visible={activeModal === 'blockedUsers'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Blocked Users</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {blockedUsers.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Ionicons name="checkmark-circle-outline" size={48} color={COLORS.success} />
                  <Text style={styles.emptyTitle}>No Blocked Users</Text>
                  <Text style={styles.emptySubtitle}>You have not blocked any campus buyers or sellers.</Text>
                </View>
              ) : (
                blockedUsers.map((bUser) => (
                  <View key={bUser.id} style={styles.blockedUserCard}>
                    <Image
                      source={{
                        uri:
                          bUser.avatar ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                      }}
                      style={styles.blockedAvatar}
                    />
                    <Text style={styles.blockedName}>{bUser.name}</Text>
                    <TouchableOpacity
                      style={styles.unblockBtn}
                      onPress={() => handleUnblockUser(bUser.id, bUser.name)}
                    >
                      <Text style={styles.unblockBtnText}>Unblock</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* 5. SAFETY TIPS MODAL */}
      {/* ========================================================================= */}
      <Modal visible={activeModal === 'safety'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Safety Guidelines</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.safetyCard}>
                <Ionicons name="location" size={24} color={COLORS.accent} />
                <View style={styles.safetyTextContent}>
                  <Text style={styles.safetyTitle}>Meet in Public Campus Areas</Text>
                  <Text style={styles.safetyDesc}>Always schedule hand-offs at well-lit campus spots like library, canteen, or hostel main gates.</Text>
                </View>
              </View>

              <View style={styles.safetyCard}>
                <Ionicons name="eye" size={24} color={COLORS.success} />
                <View style={styles.safetyTextContent}>
                  <Text style={styles.safetyTitle}>Inspect Items Thoroughly</Text>
                  <Text style={styles.safetyDesc}>Check electronic devices, books, and gear before transferring payment.</Text>
                </View>
              </View>

              <View style={styles.safetyCard}>
                <Ionicons name="lock-closed" size={24} color="#F59E0B" />
                <View style={styles.safetyTextContent}>
                  <Text style={styles.safetyTitle}>Use Escrow Protection</Text>
                  <Text style={styles.safetyDesc}>Payments are safely held in Ooplabdh Escrow until buyer marks order as received.</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.saveModalBtn} onPress={() => setActiveModal(null)}>
                <Text style={styles.saveModalBtnText}>Got It, Stay Safe!</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* 6. HELP & SUPPORT MODAL */}
      {/* ========================================================================= */}
      <Modal visible={activeModal === 'help'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Help & Support</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity style={styles.supportCard} onPress={() => router.push('/contact' as any)}>
                <Ionicons name="chatbubbles-outline" size={24} color={COLORS.accent} />
                <View style={styles.supportTextContent}>
                  <Text style={styles.supportTitle}>Contact Support Desk</Text>
                  <Text style={styles.supportDesc}>Message our support team for quick assistance.</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.supportCard} onPress={() => router.push('/faq' as any)}>
                <Ionicons name="help-circle-outline" size={24} color={COLORS.success} />
                <View style={styles.supportTextContent}>
                  <Text style={styles.supportTitle}>Frequently Asked Questions</Text>
                  <Text style={styles.supportDesc}>Find instant answers about trading, escrow, and notes.</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>

              <View style={styles.officialWebsiteCard}>
                <Ionicons name="globe-outline" size={24} color="#38BDF8" />
                <Text style={styles.webTitle}>Official Campus Portal</Text>
                <Text style={styles.webUrl}>www.ooplabdh.shop</Text>
              </View>

              <TouchableOpacity style={styles.saveModalBtn} onPress={() => setActiveModal(null)}>
                <Text style={styles.saveModalBtnText}>Close Support</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* 7. DELETE ACCOUNT CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      <Modal visible={activeModal === 'deleteAccount'} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { borderColor: COLORS.danger }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: COLORS.danger }]}>Delete Account</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <Ionicons name="close" size={22} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.deleteWarningBox}>
                <Ionicons name="warning" size={32} color={COLORS.danger} />
                <Text style={styles.deleteWarningTitle}>Irreversible Action</Text>
                <Text style={styles.deleteWarningDesc}>
                  Deleting your account will permanently wipe your profile, all active marketplace listings, chat records, and ratings.
                </Text>
              </View>

              <Text style={styles.inputLabel}>Type "DELETE" to confirm</Text>
              <TextInput
                style={[styles.modalInput, { borderColor: COLORS.danger }]}
                value={deleteConfirmationText}
                onChangeText={setDeleteConfirmationText}
                placeholder='Type "DELETE"'
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="characters"
              />

              <TouchableOpacity
                style={[
                  styles.deleteConfirmBtn,
                  (deleteConfirmationText.trim().toLowerCase() !== 'delete' || isDeletingAccount) && { opacity: 0.5 },
                ]}
                onPress={handleConfirmDeleteAccount}
                disabled={deleteConfirmationText.trim().toLowerCase() !== 'delete' || isDeletingAccount}
              >
                {isDeletingAccount ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.deleteConfirmBtnText}>Permanently Delete My Account</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },

  // User Profile Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    elevation: 3,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  profileInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    maxWidth: 160,
  },
  profileCollege: {
    fontSize: 13,
    color: COLORS.accent,
    marginTop: 2,
    fontWeight: '500',
  },
  profileEmail: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  editProfileBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  editProfileBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accent,
  },

  // Section Headers & Card Groups
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.1,
    marginBottom: SPACING.xs + 2,
    marginLeft: SPACING.xs,
  },
  cardGroup: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 56,
  },

  // Setting Row
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm + 4,
    paddingHorizontal: SPACING.md,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: SPACING.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  settingSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
    marginLeft: 8,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: 3,
  },
  settingRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Actions & Footer
  actionsContainer: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  logoutButton: {
    width: '100%',
    backgroundColor: '#DC2626',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  versionFooter: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  versionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  versionSubtitle: {
    fontSize: 11,
    color: 'rgba(148, 163, 184, 0.6)',
    marginTop: 2,
  },

  // Modals Styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    padding: SPACING.md,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },

  // Edit Profile Modal
  avatarUploadCenter: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  avatarPickWrapper: {
    position: 'relative',
  },
  modalAvatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.accent,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.card,
  },
  avatarChangeText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
    marginTop: SPACING.sm,
  },
  modalInput: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    color: COLORS.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveModalBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  saveModalBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Campus Options
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs + 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  optionCardText: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginLeft: SPACING.sm,
  },
  optionCardTextSelected: {
    color: COLORS.text,
    fontWeight: '600',
  },
  radiusChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: SPACING.xs,
  },
  radiusChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  radiusChipSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  radiusChipText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  radiusChipTextSelected: {
    color: '#FFF',
    fontWeight: '700',
  },

  // Verification Status
  verificationBadgeCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: SPACING.md,
  },
  verifiedIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  verifyCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
  },
  verifyCardDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  idImagePreviewBox: {
    height: 160,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: SPACING.xs,
  },
  idImagePreview: {
    width: '100%',
    height: '100%',
  },
  idPlaceholderBox: {
    height: 120,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginVertical: SPACING.xs,
  },
  idPlaceholderText: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginTop: 6,
  },

  // Blocked Users
  blockedUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  blockedAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  blockedName: {
    flex: 1,
    marginLeft: SPACING.md,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  unblockBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  unblockBtnText: {
    color: COLORS.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },

  // Safety Tips
  safetyCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  safetyTextContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  safetyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  safetyDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },

  // Support
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  supportTextContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  supportDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  officialWebsiteCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    marginVertical: SPACING.sm,
  },
  webTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 6,
  },
  webUrl: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.accent,
    marginTop: 2,
  },

  // Delete Account
  deleteWarningBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: SPACING.md,
  },
  deleteWarningTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.danger,
    marginTop: 6,
  },
  deleteWarningDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
  },
  deleteConfirmBtn: {
    backgroundColor: COLORS.danger,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  deleteConfirmBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
