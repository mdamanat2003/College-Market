import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  ScrollView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING } from '../../theme/colors';
import { useAuthStore } from '../../store/authStore';
import { useChatStore } from '../../store/chatStore';
import { useProductStore } from '../../store/productStore';
import { OoplabdhLogo } from '../brand/OoplabdhLogo';

const NAV_ITEMS = [
  { id: 'home', name: 'Home', path: '/home', icon: 'home-outline', activeIcon: 'home' },
  { id: 'market', name: 'Marketplace', path: '/marketplace', icon: 'cart-outline', activeIcon: 'cart' },
  { id: 'academic', name: 'PyQ & Notes', path: '/academic', icon: 'book-outline', activeIcon: 'book' },
  { id: 'community', name: 'Community', path: '/community', icon: 'people-outline', activeIcon: 'people' },
  { id: 'lostfound', name: 'Lost & Found', path: '/lost-found', icon: 'search-outline', activeIcon: 'search' },
  { id: 'events', name: 'Campus Fests', path: '/events', icon: 'calendar-outline', activeIcon: 'calendar' },
];

export const Navbar = () => {
  const { user } = useAuthStore();
  const unreadNotifications = useChatStore((state) => state.unreadNotifications);
  const { searchQuery, setSearchQuery } = useProductStore();
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const currentPath = usePathname();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isPhone = width <= 480;
  const isMobile = width < 768;
  const isTiny = width < 360;

  const handleSearch = () => {
    setSearchQuery(localSearch);
    if (currentPath !== '/marketplace') {
      router.push('/marketplace');
    }
  };

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      {/* --- UPPER BAR --- */}
      <View style={[styles.header, isPhone && styles.phoneHeader]}>
        <TouchableOpacity testID="logo-btn" style={styles.brandContainer} onPress={() => router.push('/home')}>
          <OoplabdhLogo size="sm" markOnly={isTiny} compact={isPhone} />
        </TouchableOpacity>

        {!isMobile && (
          <View 
            testID="search-input"
            style={[styles.searchContainer, isSearchFocused && styles.searchContainerFocused]}
          >
            <Ionicons 
              name="search" 
              size={18} 
              color={isSearchFocused ? '#38BDF8' : '#94A3B8'} 
              style={styles.searchIcon} 
            />
            <TextInput
              placeholder="Search for books, electronics, PyQs..."
              placeholderTextColor="#CBD5E1"
              style={styles.searchInput}
              value={localSearch}
              onChangeText={(text) => {
                setLocalSearch(text);
                setSearchQuery(text);
              }}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {localSearch ? (
              <TouchableOpacity 
                onPress={() => {
                  setLocalSearch('');
                  setSearchQuery('');
                }}
                style={styles.clearSearchBtn}
              >
                <Ionicons name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>
        )}

        <View style={[styles.rightIcons, isPhone && styles.phoneRightIcons]}>
          {!isMobile && (
            <>
              <TouchableOpacity
                testID="sell-btn"
                style={styles.sellBtn}
                onPress={() => router.push('/add-product')}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={18} color="#09090b" />
                <Text style={styles.sellBtnText}>Sell</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                testID="icon-btn" 
                style={styles.iconButton} 
                onPress={() => router.push('/messages')}
              >
                <Ionicons name="chatbubble-ellipses-outline" size={19} color={COLORS.text} />
              </TouchableOpacity>
            </>
          )}

          {/* Notification Icon (Shown on both Mobile and Desktop) */}
          <TouchableOpacity 
            testID="icon-btn" 
            style={[styles.iconButton, isPhone && styles.phoneIconButton]} 
            onPress={() => router.push('/notifications')}
          >
            <Ionicons name="notifications-outline" size={19} color={COLORS.text} />
            {unreadNotifications > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadNotifications > 9 ? '9+' : unreadNotifications}</Text>
              </View>
            )}
          </TouchableOpacity>

          {!isMobile && (
            <TouchableOpacity 
              testID="icon-btn" 
              style={styles.profileBtn} 
              onPress={() => router.push('/profile')}
            >
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.profileAvatarImg} />
              ) : (
                <Text style={styles.profileInitial}>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</Text>
              )}
            </TouchableOpacity>
          )}

          {/* Toggle Hamburger Button (Shown ONLY on Mobile) */}
          {isMobile && (
            <TouchableOpacity 
              testID="icon-btn" 
              style={[styles.iconButton, styles.phoneIconButton, styles.hamburgerBtn]} 
              onPress={() => setIsMenuOpen(!isMenuOpen)}
              activeOpacity={0.8}
            >
              <Ionicons name={isMenuOpen ? "close" : "menu"} size={20} color="#38BDF8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* --- DEDICATED MOBILE SEARCH BAR --- */}
      {isMobile && (
        <View style={styles.mobileSearchRow}>
          <View 
            testID="search-input"
            style={[styles.mobileSearchContainer, isSearchFocused && styles.searchContainerFocused]}
          >
            <Ionicons 
              name="search" 
              size={17} 
              color={isSearchFocused ? '#38BDF8' : '#94A3B8'} 
              style={styles.searchIcon} 
            />
            <TextInput
              placeholder="Search books, electronics, PyQs..."
              placeholderTextColor="#CBD5E1"
              style={styles.searchInput}
              value={localSearch}
              onChangeText={(text) => {
                setLocalSearch(text);
                setSearchQuery(text);
              }}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {localSearch ? (
              <TouchableOpacity 
                onPress={() => {
                  setLocalSearch('');
                  setSearchQuery('');
                }}
                style={styles.clearSearchBtn}
              >
                <Ionicons name="close-circle" size={17} color="#94A3B8" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      )}

      {/* --- LOWER BAR (Desktop: SubHeader, Mobile: Collapsible Dropdown Menu) --- */}
      {!isMobile ? (
        <View style={styles.subHeader}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.navScrollContent}
          >
            {NAV_ITEMS.map((item) => {
              const isActive = currentPath === item.path || currentPath.startsWith(`${item.path}/`);

              return (
                <TouchableOpacity
                  key={item.id}
                  testID="nav-item"
                  style={[styles.navItem, isActive && styles.activeNavItem]}
                  onPress={() => router.push(item.path as any)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isActive ? (item.activeIcon as any) : (item.icon as any)}
                    size={16}
                    color={isActive ? '#38BDF8' : COLORS.textMuted}
                  />
                  <Text style={[styles.navText, isActive && styles.activeNavText]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : isMenuOpen ? (
        <View style={styles.mobileDropdownMenu}>
          {[
            ...NAV_ITEMS,
            { id: 'sell', name: 'Sell Item (+)', path: '/add-product', icon: 'add-circle-outline', activeIcon: 'add-circle' },
            { id: 'messages', name: 'Messages & Chats', path: '/messages', icon: 'chatbubble-ellipses-outline', activeIcon: 'chatbubble-ellipses' },
            { id: 'profile', name: 'My Profile & Account', path: '/profile', icon: 'person-outline', activeIcon: 'person' },
          ].map((item) => {
            const isActive = currentPath === item.path || currentPath.startsWith(`${item.path}/`);

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.mobileMenuItem, isActive && styles.activeMobileMenuItem]}
                onPress={() => {
                  setIsMenuOpen(false);
                  router.push(item.path as any);
                }}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={isActive ? (item.activeIcon as any) : (item.icon as any)}
                  size={18}
                  color={isActive ? '#38BDF8' : '#94A3B8'}
                />
                <Text style={[styles.mobileMenuText, isActive && styles.activeMobileMenuText]}>
                  {item.name}
                </Text>
                {isActive && <Ionicons name="chevron-forward" size={16} color="#38BDF8" style={{ marginLeft: 'auto' }} />}
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: 'rgba(18, 18, 20, 0.88)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 10,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
      } as any,
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 4,
      },
    }),
  },
  header: {
    height: 78,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    maxWidth: 1440,
    width: '100%',
    alignSelf: 'center',
  },
  phoneHeader: {
    height: 60,
    paddingHorizontal: 16,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    maxWidth: 520,
    marginHorizontal: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 39, 42, 0.65)',
    borderRadius: RADIUS.round,
    paddingHorizontal: 18,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  searchContainerFocused: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(39, 39, 42, 0.9)',
    ...Platform.select({
      web: {
        boxShadow: '0 0 0 3px rgba(56, 189, 248, 0.25), 0 4px 12px rgba(0,0,0,0.3)',
      } as any,
      default: {
        shadowColor: '#38BDF8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  mobileSearchRow: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 2,
    maxWidth: 1440,
    width: '100%',
    alignSelf: 'center',
  },
  mobileSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(39, 39, 42, 0.65)',
    borderRadius: RADIUS.round,
    paddingHorizontal: 14,
    height: 42,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  phoneSearchContainer: {
    height: 40,
    marginHorizontal: 8,
    paddingHorizontal: 12,
  },
  clearSearchBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 14.5,
    color: '#F8FAFC',
    fontWeight: '500',
    backgroundColor: 'transparent',
    borderWidth: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
        outlineWidth: 0,
        outlineColor: 'transparent',
      } as any,
    }),
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  phoneRightIcons: {
    gap: 8,
  },
  sellBtn: {
    backgroundColor: '#38BDF8',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.round,
    marginRight: 4,
    gap: 6,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 14px rgba(56, 189, 248, 0.4)',
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
  phoneSellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginRight: 0,
    justifyContent: 'center',
  },
  sellBtnText: {
    color: '#09090b',
    fontWeight: '800',
    fontSize: 14.5,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    position: 'relative',
  },
  phoneIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 17,
    height: 17,
    backgroundColor: '#EF4444',
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#18181b',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  profileBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  phoneProfileBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  profileAvatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profileInitial: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  subHeader: {
    height: 44,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  navScrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    maxWidth: 1440,
    width: '100%',
    alignSelf: 'center',
  },
  phoneNavScrollContent: {
    paddingHorizontal: 14,
    justifyContent: 'flex-start',
    gap: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.round,
    gap: 6,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeNavItem: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderColor: 'rgba(56, 189, 248, 0.35)',
    ...Platform.select({
      web: {
        boxShadow: '0 0 12px rgba(56, 189, 248, 0.25), inset 0 0 8px rgba(56, 189, 248, 0.1)',
      } as any,
      default: {
        shadowColor: '#38BDF8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 3,
      },
    }),
  },
  navText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  activeNavText: {
    color: '#F8FAFC',
    fontWeight: '700',
  },
  hamburgerBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  mobileDropdownMenu: {
    backgroundColor: '#18181b',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 4,
    ...Platform.select({
      web: {
        boxShadow: '0 12px 28px rgba(0, 0, 0, 0.5)',
      } as any,
    }),
  },
  mobileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 12,
    backgroundColor: 'transparent',
  },
  activeMobileMenuItem: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  mobileMenuText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  activeMobileMenuText: {
    color: '#F8FAFC',
    fontWeight: '800',
  },
});
