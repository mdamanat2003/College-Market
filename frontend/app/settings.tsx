import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Image,
  Alert,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { COLORS, RADIUS, SPACING } from '../theme/colors';

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
  const { user, logout } = useAuthStore();

  // Interactive Switch States
  const [pushNotifications, setPushNotifications] = useState(true);
  const [listingAlerts, setListingAlerts] = useState(true);
  const [locationPermissions, setLocationPermissions] = useState(true);
  const [darkMode, setDarkMode] = useState(true); // App theme defaults to sleek dark mode

  // Log Out Handler
  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of Ooplabdh?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            console.log('[SettingsScreen] Logging out user...');
            logout();
            router.replace('/(auth)/login');
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Delete Account Handler
  const handleDeleteAccount = () => {
    console.log('[SettingsScreen] Delete Account triggered');
    Alert.alert(
      'Delete Account',
      'This action is irreversible. All your listings, chat history, and ratings will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            console.log('[SettingsScreen] Executing delete account request...');
            Alert.alert('Request Submitted', 'Account deletion request submitted. An admin will verify shortly.');
          },
        },
      ]
    );
  };

  // Navigation / Feature Action Callbacks
  const navigateTo = (route: string, label: string) => {
    console.log(`[SettingsScreen] Navigating to: ${route} (${label})`);
    try {
      router.push(route as any);
    } catch (err) {
      console.warn(`[SettingsScreen] Route ${route} not found:`, err);
    }
  };

  // Reusable Setting Row Component
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
      
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Profile Card Header */}
        <View style={styles.profileCard}>
          <Image
            source={{
              uri:
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
              {user?.college || 'IIT Delhi (.edu.in)'}
            </Text>
            <Text style={styles.profileEmail} numberOfLines={1}>
              {user?.email || 'student@college.ac.in'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.editProfileBtn}
            onPress={() => navigateTo('/profile', 'Edit Profile')}
          >
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
            subtitle="Name, Avatar & Bio"
            onPress={() => navigateTo('/profile', 'Edit Profile')}
          />
          <View style={styles.divider} />
          <SettingRow
            iconName="location-outline"
            iconColor="#38BDF8"
            title="Campus Details"
            subtitle={user?.college || 'Campus & 5km Radius'}
            onPress={() => {
              console.log('[SettingsScreen] Campus Details clicked');
              Alert.alert('Campus Location', `Current Campus: ${user?.college || 'Primary Campus'}\nSearch Radius: 5 km`);
            }}
          />
          <View style={styles.divider} />
          <SettingRow
            iconName="shield-checkmark-outline"
            iconColor={COLORS.success}
            title="Verification Status"
            badgeText="Verified Student"
            subtitle="College ID Card Verified"
            onPress={() => {
              console.log('[SettingsScreen] Verification Status clicked');
              Alert.alert('Student Status', 'Your account is fully verified with a valid College Email / ID proof.');
            }}
          />
        </View>

        {/* Section 2: Notifications */}
        <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
        <View style={styles.cardGroup}>
          <SettingRow
            iconName="notifications-outline"
            iconColor="#F59E0B"
            title="Push Notifications"
            subtitle="Chat messages, buy requests & orders"
            showChevron={false}
            rightComponent={
              <Switch
                value={pushNotifications}
                onValueChange={(val) => {
                  console.log('[SettingsScreen] Push Notifications toggled:', val);
                  setPushNotifications(val);
                }}
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
            subtitle="Price drops on saved wishlist items"
            showChevron={false}
            rightComponent={
              <Switch
                value={listingAlerts}
                onValueChange={(val) => {
                  console.log('[SettingsScreen] Listing Alerts toggled:', val);
                  setListingAlerts(val);
                }}
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
            subtitle="Manage blocked sellers & buyers"
            onPress={() => {
              console.log('[SettingsScreen] Blocked Users clicked');
              Alert.alert('Blocked Users', 'You currently have no blocked users.');
            }}
          />
          <View style={styles.divider} />
          <SettingRow
            iconName="navigate-outline"
            iconColor="#6366F1"
            title="Location Permissions"
            subtitle="Used for nearby campus listing distance"
            showChevron={false}
            rightComponent={
              <Switch
                value={locationPermissions}
                onValueChange={(val) => {
                  console.log('[SettingsScreen] Location Permissions toggled:', val);
                  setLocationPermissions(val);
                }}
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
            onPress={handleDeleteAccount}
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
                onValueChange={(val) => {
                  console.log('[SettingsScreen] Dark Mode toggled:', val);
                  setDarkMode(val);
                }}
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
            onPress={() => navigateTo('/safety', 'Safety Tips')}
          />
          <View style={styles.divider} />
          <SettingRow
            iconName="document-text-outline"
            iconColor="#3B82F6"
            title="Terms of Service & Privacy Policy"
            subtitle="Platform policies and student privacy"
            onPress={() => navigateTo('/terms', 'Terms & Privacy')}
          />
          <View style={styles.divider} />
          <SettingRow
            iconName="help-circle-outline"
            iconColor="#F59E0B"
            title="Help & Support"
            subtitle="www.ooplabdh.shop"
            onPress={() => navigateTo('/contact', 'Help & Support')}
          />
        </View>

        {/* Section 6: Logout & Version Footer */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>

          <View style={styles.versionFooter}>
            <Text style={styles.versionTitle}>Ooplabdh v1.0.0</Text>
            <Text style={styles.versionSubtitle}>Made with ❤️ for students</Text>
          </View>
        </View>
      </ScrollView>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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

  // Actions & Version Footer
  actionsContainer: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  logoutButton: {
    width: '100%',
    backgroundColor: '#DC2626', // Vibrant Red
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
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
});
