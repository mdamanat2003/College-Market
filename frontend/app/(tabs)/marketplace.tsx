import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import Head from 'expo-router/head';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Footer from '../../components/layout/Footer';
import { Navbar } from '../../components/layout/Navbar';
import { ProductCard } from '../../components/cards/ProductCard';
import { useProductStore } from '../../store/productStore';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { COLLEGES, getCollegeSlug } from '../../constants/colleges';
import { COLORS, RADIUS } from '../../theme/colors';
import { api } from '../../services/api';
import { SOCIAL_LINKS, openSocialLink } from '../../constants/socialLinks';

const VISUAL_CATEGORIES = [
  {
    id: 'All',
    label: 'All Items',
    badge: 'All Gear',
    icon: 'grid-outline',
    countLabel: 'All campus gear',
    color: '#38BDF8',
    subtitle: 'Choose your campus to jump directly into all campus gear and student listings.',
    btnLabel: 'All Items',
    targetRoute: '/(tabs)/marketplace',
  },
  {
    id: 'Books',
    label: 'Books & PYQs',
    badge: 'PYQs',
    icon: 'book-outline',
    countLabel: 'Textbooks, Notes',
    color: '#818CF8',
    subtitle: 'Choose your campus to jump directly into previous year question papers.',
    btnLabel: 'PYQs',
    targetRoute: '/academic',
  },
  {
    id: 'Electronics',
    label: 'Tech & Gadgets',
    badge: 'Tech & Gadgets',
    icon: 'laptop-outline',
    countLabel: 'Calculators, Audio',
    color: '#34D399',
    subtitle: 'Choose your campus to jump directly into tech & gadget listings.',
    btnLabel: 'Tech & Gadgets',
    targetRoute: '/(tabs)/marketplace',
  },
  {
    id: 'Vehicles',
    label: 'Cycles & Rides',
    badge: 'Cycles & Rides',
    icon: 'bicycle-outline',
    countLabel: 'Hostel cycles',
    color: '#F472B6',
    subtitle: 'Choose your campus to jump directly into hostel cycles & rides listings.',
    btnLabel: 'Cycles & Rides',
    targetRoute: '/(tabs)/marketplace',
  },
  {
    id: 'Furniture',
    label: 'Hostel & Dorm',
    badge: 'Hostel & Dorm',
    icon: 'bed-outline',
    countLabel: 'Mattresses, Tables',
    color: '#FBBF24',
    subtitle: 'Choose your campus to jump directly into hostel mattresses, tables & dorm gear.',
    btnLabel: 'Hostel & Dorm',
    targetRoute: '/(tabs)/marketplace',
  },
  {
    id: 'Others',
    label: 'Lab & Tools',
    badge: 'Lab & Tools',
    icon: 'flask-outline',
    countLabel: 'Coats, Drafters',
    color: '#A78BFA',
    subtitle: 'Choose your campus to jump directly into lab coats, drafters & tools.',
    btnLabel: 'Lab & Tools',
    targetRoute: '/(tabs)/marketplace',
  },
];

export default function MarketplaceHome() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<{ category?: string; college?: string }>();
  const { user } = useAuthStore();
  const { products, fetchProducts, isLoading, searchQuery } = useProductStore();
  const [activeCategory, setActiveCategory] = useState<string>(searchParams.category || 'All');
  const [activeCollege, setActiveCollege] = useState<string>(searchParams.college || user?.college || 'All Colleges');

  // Overview Modal State (Image 2 style)
  const [isOverviewModalOpen, setIsOverviewModalOpen] = useState(false);
  const [selectedModalCategory, setSelectedModalCategory] = useState<typeof VISUAL_CATEGORIES[0]>(VISUAL_CATEGORIES[1]);
  const [tempSelectedCollege, setTempSelectedCollege] = useState<string>('Integral University');
  const [collegeSearch, setCollegeSearch] = useState('');
  const [customCollegeInput, setCustomCollegeInput] = useState('');
  const [isAddingCustomCollege, setIsAddingCustomCollege] = useState(false);
  const [extraColleges, setExtraColleges] = useState<string[]>([]);

  // Contact Form State
  const [contactName, setContactName] = useState(user?.name || '');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactCollege, setContactCollege] = useState(user?.college || '');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSuccessMessage, setContactSuccessMessage] = useState('');

  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<any>>(null);

  const isPhone = width <= 560;
  const isWideScreen = width >= 880;
  const numColumns = width >= 1150 ? 4 : width >= 820 ? 3 : width >= 560 ? 2 : 1;
  const H_PADDING = isPhone ? 16 : 28 * 2;
  const CARD_GAP = isPhone ? 16 : 24;
  const containerMaxWidth = 1440;
  const effectiveWidth = Math.min(width, containerMaxWidth);
  const cardWidth = numColumns === 1
    ? Math.min(effectiveWidth - H_PADDING, 480)
    : Math.floor((effectiveWidth - H_PADDING - (CARD_GAP * (numColumns - 1))) / numColumns);

  const allAvailableColleges = useMemo(() => {
    return Array.from(new Set([...COLLEGES, ...extraColleges]));
  }, [extraColleges]);

  const filteredColleges = useMemo(() => {
    if (!collegeSearch.trim()) return ['All Colleges', ...allAvailableColleges];
    const q = collegeSearch.toLowerCase().trim();
    const matches = allAvailableColleges.filter((c) => c.toLowerCase().includes(q));
    return ['All Colleges', ...matches];
  }, [collegeSearch, allAvailableColleges]);

  useEffect(() => {
    if (searchParams.category && searchParams.category !== activeCategory) {
      setActiveCategory(searchParams.category);
    }
    if (searchParams.college && searchParams.college !== activeCollege) {
      setActiveCollege(searchParams.college);
    }
  }, [searchParams.category, searchParams.college]);

  const handleCategoryCardPress = (cat: typeof VISUAL_CATEGORIES[0]) => {
    setSelectedModalCategory(cat);
    const initialChosen = activeCollege && activeCollege !== 'All Colleges'
      ? activeCollege
      : 'Integral University';
    setTempSelectedCollege(initialChosen);
    setCollegeSearch('');
    setIsAddingCustomCollege(false);
    setIsOverviewModalOpen(true);
  };

  const handleOpenCampusModal = () => {
    const currentCat = VISUAL_CATEGORIES.find((c) => c.id === activeCategory) || VISUAL_CATEGORIES[0];
    setSelectedModalCategory(currentCat);
    setTempSelectedCollege(activeCollege !== 'All Colleges' ? activeCollege : 'Integral University');
    setCollegeSearch('');
    setIsAddingCustomCollege(false);
    setIsOverviewModalOpen(true);
  };

  const handleAddCustomCollege = () => {
    const trimmed = customCollegeInput.trim();
    if (!trimmed) return;
    if (!extraColleges.includes(trimmed)) {
      setExtraColleges((prev) => [trimmed, ...prev]);
    }
    setTempSelectedCollege(trimmed);
    setCustomCollegeInput('');
    setIsAddingCustomCollege(false);
  };

  const handleContactSubmit = async () => {
    if (!contactName.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }
    if (!contactMessage.trim()) {
      Alert.alert('Required', 'Please enter your message or question.');
      return;
    }

    setIsSubmittingContact(true);
    try {
      const emailToSend = contactEmail.trim() || user?.email || 'anonymous@campus.edu';
      const fullMessage = `[Campus: ${contactCollege.trim() || user?.college || 'Not specified'}]\n${contactMessage.trim()}`;
      await api.post('/requests', {
        name: contactName.trim(),
        email: emailToSend,
        message: fullMessage,
      });

      setContactSuccessMessage('Message sent successfully! Our campus support team will review it.');
      setContactMessage('');
      setTimeout(() => setContactSuccessMessage(''), 6000);
    } catch (err: any) {
      console.error('Contact submit error:', err);
      Alert.alert('Error', err?.response?.data?.message || 'Unable to submit message right now. Please try again.');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handleConfirmRedirect = () => {
    setIsOverviewModalOpen(false);

    if (selectedModalCategory.id === 'Books') {
      // Books & PYQs jumps directly into academic notes / PYQs as shown in Image 2
      setActiveCollege(tempSelectedCollege);
      setActiveCategory('Books');
      router.push({
        pathname: '/academic',
        params: { college: tempSelectedCollege },
      });
    } else {
      // Filter marketplace listings for this category and campus
      setActiveCollege(tempSelectedCollege);
      setActiveCategory(selectedModalCategory.id);
      fetchProducts(selectedModalCategory.id, searchQuery, tempSelectedCollege);
      setTimeout(() => {
        listRef.current?.scrollToOffset({ offset: 360, animated: true });
      }, 150);
    }
  };

  const handleBackToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const renderItem = React.useCallback(({ item }: { item: any }) => (
    <View style={[
      styles.cardWrapper,
      {
        width: cardWidth,
        marginBottom: CARD_GAP,
      }
    ]}>
      <ProductCard product={item} />
    </View>
  ), [cardWidth, CARD_GAP]);

  const keyExtractor = React.useCallback((item: any) => item._id, []);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchProducts(activeCategory, searchQuery, activeCollege);
    } finally {
      setRefreshing(false);
    }
  }, [activeCategory, searchQuery, activeCollege, fetchProducts]);

  useEffect(() => {
    fetchProducts(activeCategory, searchQuery, activeCollege);
  }, [activeCategory, activeCollege, searchQuery, fetchProducts]);

  const isSparse = products.length > 0 && products.length <= 2;

  // Header Component containing Hero, Categories & College Filter
  const renderListHeader = () => (
    <View style={styles.headerWrapper}>
      {/* 1. Account verification warning (if pending) */}
      {user && !user.isVerified && (
        <View style={styles.verificationBanner}>
          <Ionicons name="information-circle" size={18} color="#F59E0B" />
          <Text style={styles.verificationBannerText}>
            Your student verification is pending. An admin is reviewing your College ID.
          </Text>
        </View>
      )}

      {/* 2. Modern High-Conversion Campus Hero Section */}
      <View style={[styles.heroCard, isPhone && styles.phoneHeroCard]}>
        <View style={styles.heroBackgroundGlow} />
        <View style={styles.heroBackgroundGlowLeft} />

        <View style={[styles.heroContent, isWideScreen && styles.heroContentRow]}>
          {/* Left Column: Core Value Proposition & Actions */}
          <View style={[styles.heroLeftCol, isWideScreen && styles.heroLeftColWide]}>
            {/* Badge Row */}
            <View style={styles.heroBadgeRow}>
              <View style={styles.heroBadge}>
                <Ionicons name="shield-checkmark" size={13} color="#38BDF8" />
                <Text style={styles.heroBadgeText}>Verified Campus Network</Text>
              </View>
              <View style={styles.heroLivePill}>
                <View style={[styles.heroLiveDot, Platform.OS === 'web' && ({ className: 'pulse-dot' } as any)]} />
                <Text style={styles.heroLiveText}>0% Platform Commission</Text>
              </View>
            </View>

            {/* Headline */}
            <Text style={[styles.heroHeading, isPhone && styles.phoneHeroHeading]}>
              Buy, Sell & Trade Gear With <Text style={styles.heroHighlight}>College Peers.</Text>
            </Text>

            <Text style={[styles.heroSubheading, isPhone && styles.phoneHeroSubheading]}>
              Pre-owned textbooks, scientific calculators, hostel cycles, and verified semester question papers — traded directly within your campus.
            </Text>

            {/* Action Buttons */}
            <View style={[styles.heroActionRow, isPhone && styles.phoneHeroActionRow]}>
              <TouchableOpacity
                testID="hero-primary"
                style={styles.heroPrimaryBtn}
                onPress={() => router.push(user ? '/add-product' : ('/(auth)/login?redirect=/add-product' as any))}
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle" size={18} color="#09090b" />
                <Text style={styles.heroPrimaryBtnText}>Sell College Gear</Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="hero-secondary"
                style={styles.heroSecondaryBtn}
                onPress={() => router.push('/academic')}
                activeOpacity={0.85}
              >
                <Ionicons name="document-text-outline" size={17} color="#38BDF8" />
                <Text style={styles.heroSecondaryBtnText}>PYQs & Exam Notes</Text>
                <Ionicons name="arrow-forward" size={14} color="#38BDF8" />
              </TouchableOpacity>
            </View>

            {/* Trust Highlights */}
            <View style={[styles.heroTrustBar, isPhone && styles.phoneHeroTrustBar]}>
              <View style={styles.trustItem}>
                <View style={styles.trustIconWrap}>
                  <Ionicons name="people" size={13} color="#38BDF8" />
                </View>
                <Text style={styles.trustText}>Hostel Peer Trading</Text>
              </View>
              <View style={styles.trustDot} />
              <View style={styles.trustItem}>
                <View style={styles.trustIconWrap}>
                  <Ionicons name="chatbubbles" size={13} color="#38BDF8" />
                </View>
                <Text style={styles.trustText}>Direct In-App Chat</Text>
              </View>
              <View style={styles.trustDot} />
              <View style={styles.trustItem}>
                <View style={[styles.trustIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                  <Ionicons name="shield-checkmark" size={13} color="#10B981" />
                </View>
                <Text style={styles.trustText}>Escrow Protection</Text>
              </View>
            </View>
          </View>

          {/* Right Column: Interactive Live Campus Trading Deck (Desktop & Tablets) */}
          {isWideScreen && (
            <View style={styles.heroRightCol}>
              {/* Primary Floating Showcase Deal Card */}
              <View style={[styles.showcaseCard, Platform.OS === 'web' && ({ className: 'hero-floating-card' } as any)]}>
                <View style={styles.showcaseCardTop}>
                  <View style={styles.showcaseHotBadge}>
                    <View style={[styles.heroLiveDot, Platform.OS === 'web' && ({ className: 'pulse-dot' } as any)]} />
                    <Text style={styles.showcaseHotText}>🔥 Trending Campus Deal</Text>
                  </View>
                  <Text style={styles.showcaseCampusText}>Integral Univ • Hostel C</Text>
                </View>

                <View style={styles.showcaseProductRow}>
                  <View style={styles.showcaseIconBox}>
                    <Ionicons name="calculator-outline" size={26} color="#38BDF8" />
                  </View>
                  <View style={styles.showcaseInfoWrap}>
                    <Text style={styles.showcaseTitle} numberOfLines={1}>Casio FX-991EX ClassWiz</Text>
                    <Text style={styles.showcaseSub}>Scientific Calc • Like New Condition</Text>
                    <View style={styles.showcasePriceRow}>
                      <Text style={styles.showcasePrice}>₹650</Text>
                      <Text style={styles.showcaseStrike}>₹1,420</Text>
                      <View style={styles.showcaseDiscountPill}>
                        <Text style={styles.showcaseDiscountText}>54% Off</Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.showcaseFooterRow}>
                  <View style={styles.showcaseSellerInfo}>
                    <View style={styles.showcaseSellerAvatar}>
                      <Text style={styles.showcaseSellerAvatarText}>A</Text>
                    </View>
                    <View>
                      <Text style={styles.showcaseSellerName}>Aman S. (3rd Yr CSE)</Text>
                      <Text style={styles.showcaseSellerRating}>⭐ 4.9 • 18 campus deals</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.showcaseActionBtn}
                    onPress={() => router.push('/(tabs)/marketplace')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="chatbubble-ellipses" size={13} color="#09090b" />
                    <Text style={styles.showcaseActionBtnText}>Instant Chat</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Staggered Secondary Academic Deck Card */}
              <View style={[styles.showcaseAcademicCard, Platform.OS === 'web' && ({ className: 'hero-floating-card-delayed' } as any)]}>
                <View style={styles.showcaseAcademicIconBox}>
                  <Ionicons name="book" size={18} color="#818CF8" />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.showcaseAcademicTitle} numberOfLines={1}>Sem 4 B.Tech Solved PYQs</Text>
                  <Text style={styles.showcaseAcademicSub}>Free PDF • 240+ Senior Downloads</Text>
                </View>
                <TouchableOpacity
                  style={styles.showcaseAcademicPill}
                  onPress={() => router.push('/academic')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.showcaseAcademicPillText}>Free PDF</Text>
                  <Ionicons name="arrow-forward" size={12} color="#818CF8" />
                </TouchableOpacity>
              </View>

              {/* Floating Escrow Guarantee Tag */}
              <View style={styles.showcaseEscrowTag}>
                <Ionicons name="shield-checkmark" size={13} color="#10B981" />
                <Text style={styles.showcaseEscrowText}>Campus Escrow Protected • ₹0 Fees</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* 3. Visual Categories Section */}
      <View style={styles.categorySectionWrap}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionTitle}>Explore Categories</Text>
            <Text style={styles.sectionSubtitle}>Tap a category to filter listings instantly</Text>
          </View>
          {activeCategory !== 'All' && (
            <TouchableOpacity onPress={() => setActiveCategory('All')} style={styles.clearFilterBtn}>
              <Ionicons name="close-circle-outline" size={15} color="#38BDF8" />
              <Text style={styles.clearFilterText}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.visualCategoryScroll}
        >
          {VISUAL_CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                testID="category-chip"
                style={[styles.visualCatCard, isSelected && styles.visualCatCardActive]}
                onPress={() => handleCategoryCardPress(cat)}
                activeOpacity={0.8}
              >
                <View style={[styles.visualCatIconWrap, isSelected && styles.visualCatIconWrapActive]}>
                  <Ionicons
                    name={cat.icon as any}
                    size={22}
                    color={isSelected ? '#09090b' : cat.color}
                  />
                </View>
                <Text style={[styles.visualCatTitle, isSelected && styles.visualCatTitleActive]}>
                  {cat.label}
                </Text>
                <Text style={styles.visualCatSubtitle} numberOfLines={1}>
                  {cat.countLabel}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 4. Campus / College Filter Bar */}
      <View style={styles.filterSection}>
        <View style={styles.filterHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="location-outline" size={16} color="#38BDF8" />
            <Text style={styles.filterSectionTitle}>Campus Scope:</Text>
          </View>
          <Text style={styles.activeCampusLabel} numberOfLines={1}>
            {activeCollege}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.collegeScroll}
        >
          {/* All Colleges */}
          <TouchableOpacity
            style={[styles.collegePill, activeCollege === 'All Colleges' && styles.activeCollegePill]}
            onPress={() => setActiveCollege('All Colleges')}
            activeOpacity={0.75}
          >
            <Ionicons
              name="globe-outline"
              size={15}
              color={activeCollege === 'All Colleges' ? '#09090b' : '#38BDF8'}
            />
            <Text style={[styles.collegePillText, activeCollege === 'All Colleges' && styles.activeCollegePillText]}>
              All Colleges
            </Text>
          </TouchableOpacity>

          {/* User College */}
          {user?.college && (
            <TouchableOpacity
              style={[styles.collegePill, activeCollege === user.college && styles.activeCollegePill]}
              onPress={() => setActiveCollege(user.college || 'All Colleges')}
              activeOpacity={0.75}
            >
              <Ionicons
                name="school-outline"
                size={15}
                color={activeCollege === user.college ? '#09090b' : '#38BDF8'}
              />
              <Text
                numberOfLines={1}
                style={[styles.collegePillText, activeCollege === user.college && styles.activeCollegePillText]}
              >
                My College ({user.college})
              </Text>
            </TouchableOpacity>
          )}

          {/* Custom Selector */}
          <TouchableOpacity
            style={[
              styles.collegePill,
              activeCollege !== 'All Colleges' && activeCollege !== user?.college && styles.activeCollegePill,
            ]}
            onPress={handleOpenCampusModal}
            activeOpacity={0.75}
          >
            <Ionicons
              name="business-outline"
              size={15}
              color={activeCollege !== 'All Colleges' && activeCollege !== user?.college ? '#09090b' : '#38BDF8'}
            />
            <Text
              numberOfLines={1}
              style={[
                styles.collegePillText,
                activeCollege !== 'All Colleges' && activeCollege !== user?.college && styles.activeCollegePillText,
              ]}
            >
              {activeCollege !== 'All Colleges' && activeCollege !== user?.college ? activeCollege : 'Select College ▾'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* 5. Feed Header & Search Status */}
      <View style={styles.feedStatusRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={styles.feedHeading}>
            {activeCategory === 'All' ? 'Latest Campus Gear' : `${activeCategory} Listings`}
          </Text>
          {searchQuery ? (
            <Text style={styles.searchQueryBadge}>matching "{searchQuery}"</Text>
          ) : null}
        </View>
        <Text style={styles.feedCountBadge}>
          {products.length} {products.length === 1 ? 'item' : 'items'} available
        </Text>
      </View>
    </View>
  );

  // Footer Component containing About, Facts, Contact & Global Site Footer
  const renderListFooter = () => (
    <View style={styles.footerWrapper}>
      {/* =========================================
          1. ABOUT SECTION (Built by Students)
      ========================================= */}
      <View style={[styles.aboutSectionCard, isPhone && styles.phoneSectionCard]}>
        <View style={styles.sectionHeaderWrap}>
          <View style={styles.sectionKickerRow}>
            <Ionicons name="sparkles" size={13} color="#38BDF8" />
            <Text style={styles.sectionKickerText}>ABOUT OOPLABDH</Text>
          </View>
          <Text style={[styles.sectionHeading, isPhone && styles.phoneSectionHeading]}>
            Built by Students, Designed for Campuses.
          </Text>
          <Text style={styles.sectionLeadText}>
            A dedicated campus ecosystem eliminating noisy WhatsApp spam, price gouging, and unverified strangers. Trade semester textbooks, lab gear, calculators, and hostel cycles within university boundaries with complete escrow protection.
          </Text>
        </View>

        {/* 3 Pillar Cards */}
        <View style={[styles.aboutPillarsGrid, isPhone && styles.phonePillarsGrid]}>
          {/* Pillar 1 */}
          <View style={styles.aboutPillarCard}>
            <View style={[styles.pillarIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.12)', borderColor: 'rgba(16, 185, 129, 0.25)' }]}>
              <Ionicons name="shield-checkmark" size={20} color="#10B981" />
            </View>
            <Text style={styles.pillarTitle}>Verified Student Peers</Text>
            <Text style={styles.pillarDesc}>
              Every profile is authenticated with real student IDs and campus credentials, keeping bad actors and commercial spam off your campus network.
            </Text>
            <View style={styles.pillarTag}>
              <Text style={[styles.pillarTagText, { color: '#10B981' }]}>100% Student Only</Text>
            </View>
          </View>

          {/* Pillar 2 */}
          <View style={styles.aboutPillarCard}>
            <View style={[styles.pillarIconBox, { backgroundColor: 'rgba(56, 189, 248, 0.12)', borderColor: 'rgba(56, 189, 248, 0.25)' }]}>
              <Ionicons name="chatbubbles" size={20} color="#38BDF8" />
            </View>
            <Text style={styles.pillarTitle}>In-App Chat & Escrow</Text>
            <Text style={styles.pillarDesc}>
              Chat in real-time, negotiate prices, schedule physical hostel handoffs, and enjoy escrow protection where you keep 100% of your earnings.
            </Text>
            <View style={styles.pillarTag}>
              <Text style={[styles.pillarTagText, { color: '#38BDF8' }]}>₹0 Commission Cut</Text>
            </View>
          </View>

          {/* Pillar 3 */}
          <View style={styles.aboutPillarCard}>
            <View style={[styles.pillarIconBox, { backgroundColor: 'rgba(129, 140, 248, 0.12)', borderColor: 'rgba(129, 140, 248, 0.25)' }]}>
              <Ionicons name="book" size={20} color="#818CF8" />
            </View>
            <Text style={styles.pillarTitle}>Academic Hub & Free PYQs</Text>
            <Text style={styles.pillarDesc}>
              Senior peers upload free semester question papers, university syllabus notes, and lab manuals directly organized by branch and semester.
            </Text>
            <View style={styles.pillarTag}>
              <Text style={[styles.pillarTagText, { color: '#818CF8' }]}>Free Peer Notes</Text>
            </View>
          </View>
        </View>

        {/* Action Link */}
        <View style={styles.aboutBottomActions}>
          <TouchableOpacity
            style={styles.aboutActionBtn}
            onPress={() => router.push('/about')}
            activeOpacity={0.8}
          >
            <Text style={styles.aboutActionBtnText}>Meet our founders & story</Text>
            <Ionicons name="arrow-forward" size={14} color="#38BDF8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.aboutActionBtnSecondary}
            onPress={() => router.push('/safety')}
            activeOpacity={0.8}
          >
            <Ionicons name="lock-closed-outline" size={14} color="#94A3B8" />
            <Text style={styles.aboutActionBtnSecondaryText}>Campus safety guide</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* =========================================
          2. FACTS & IMPACT SECTION
      ========================================= */}
      <View style={[styles.factsSectionCard, isPhone && styles.phoneSectionCard]}>
        <View style={styles.sectionHeaderWrap}>
          <View style={[styles.sectionKickerRow, { borderColor: 'rgba(245, 158, 11, 0.3)', backgroundColor: 'rgba(245, 158, 11, 0.08)' }]}>
            <Ionicons name="bar-chart" size={13} color="#F59E0B" />
            <Text style={[styles.sectionKickerText, { color: '#F59E0B' }]}>PLATFORM FACTS & NUMBERS</Text>
          </View>
          <Text style={[styles.sectionHeading, isPhone && styles.phoneSectionHeading]}>
            Real Metrics Powering Campus Trade
          </Text>
          <Text style={styles.sectionLeadText}>
            Transparent, peer-tested numbers that make Ooplabdh the definitive campus platform.
          </Text>
        </View>

        {/* 4 Stats Grid */}
        <View style={[styles.factsGrid, isPhone && styles.phoneFactsGrid]}>
          {/* Stat 1 */}
          <View style={styles.factCard}>
            <View style={[styles.factIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Ionicons name="people-outline" size={18} color="#10B981" />
            </View>
            <Text style={[styles.factNumber, { color: '#10B981' }]}>100%</Text>
            <Text style={styles.factLabel}>Verified Students</Text>
            <Text style={styles.factSubtext}>Student IDs & institutional credentials verified</Text>
          </View>

          {/* Stat 2 */}
          <View style={styles.factCard}>
            <View style={[styles.factIconWrap, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
              <Ionicons name="wallet-outline" size={18} color="#38BDF8" />
            </View>
            <Text style={[styles.factNumber, { color: '#38BDF8' }]}>₹0</Text>
            <Text style={styles.factLabel}>Platform Commission</Text>
            <Text style={styles.factSubtext}>100% profit stays in students' pockets</Text>
          </View>

          {/* Stat 3 */}
          <View style={styles.factCard}>
            <View style={[styles.factIconWrap, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Ionicons name="flash-outline" size={18} color="#F59E0B" />
            </View>
            <Text style={[styles.factNumber, { color: '#F59E0B' }]}>&lt; 2 Min</Text>
            <Text style={styles.factLabel}>Avg. Reply Speed</Text>
            <Text style={styles.factSubtext}>Instant in-app peer chat within hostel blocks</Text>
          </View>

          {/* Stat 4 */}
          <View style={styles.factCard}>
            <View style={[styles.factIconWrap, { backgroundColor: 'rgba(167, 139, 250, 0.1)' }]}>
              <Ionicons name="document-text-outline" size={18} color="#A78BFA" />
            </View>
            <Text style={[styles.factNumber, { color: '#A78BFA' }]}>1,200+</Text>
            <Text style={styles.factLabel}>Free PYQs & Notes</Text>
            <Text style={styles.factSubtext}>Engineering, sciences, and commerce archives</Text>
          </View>
        </View>
      </View>

      {/* =========================================
          3. CONTACT & SUPPORT SECTION
      ========================================= */}
      <View style={[styles.contactSectionCard, isPhone && styles.phoneSectionCard]}>
        <View style={styles.sectionHeaderWrap}>
          <View style={[styles.sectionKickerRow, { borderColor: 'rgba(16, 185, 129, 0.3)', backgroundColor: 'rgba(16, 185, 129, 0.08)' }]}>
            <Ionicons name="mail-unread" size={13} color="#10B981" />
            <Text style={[styles.sectionKickerText, { color: '#10B981' }]}>NEED HELP OR CAMPUS AMBASSADOR?</Text>
          </View>
          <Text style={[styles.sectionHeading, isPhone && styles.phoneSectionHeading]}>
            Get In Touch With The Student Team
          </Text>
          <Text style={styles.sectionLeadText}>
            Want your college added to Ooplabdh, need deal resolution, or have product feedback? Send a message or join our student network directly.
          </Text>
        </View>

        {/* 2-Column Split: Channels on Left, Quick Form on Right */}
        <View style={[styles.contactSplitGrid, isPhone && styles.phoneContactSplitGrid]}>
          {/* Left Column: Direct Links & Ambassadors */}
          <View style={styles.contactLeftCol}>
            {/* WhatsApp Community Card */}
            <TouchableOpacity
              style={styles.contactChannelCard}
              onPress={() => openSocialLink(SOCIAL_LINKS.whatsapp, 'WhatsApp Community')}
              activeOpacity={0.8}
            >
              <View style={[styles.channelIconCircle, { backgroundColor: 'rgba(37, 211, 102, 0.15)' }]}>
                <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.channelTitle}>Official WhatsApp Community</Text>
                <Text style={styles.channelDesc}>Join your campus group for instant deals & peer alerts.</Text>
              </View>
              <Ionicons name="open-outline" size={16} color="#94A3B8" />
            </TouchableOpacity>

            {/* Instagram Card */}
            <TouchableOpacity
              style={styles.contactChannelCard}
              onPress={() => openSocialLink(SOCIAL_LINKS.instagram, 'Instagram')}
              activeOpacity={0.8}
            >
              <View style={[styles.channelIconCircle, { backgroundColor: 'rgba(225, 48, 108, 0.15)' }]}>
                <Ionicons name="logo-instagram" size={20} color="#E1306C" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.channelTitle}>Instagram @ooplabdh.shop</Text>
                <Text style={styles.channelDesc}>Campus fest updates, features & giveaway news.</Text>
              </View>
              <Ionicons name="open-outline" size={16} color="#94A3B8" />
            </TouchableOpacity>

            {/* Direct Email Card */}
            <View style={styles.contactChannelCard}>
              <View style={[styles.channelIconCircle, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
                <Ionicons name="mail-outline" size={20} color="#38BDF8" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.channelTitle}>Direct Student Desk</Text>
                <Text style={styles.channelDesc}>support@ooplabdh.shop (Replies within 3 hours)</Text>
              </View>
            </View>

            {/* Link to Full Contact & FAQ */}
            <View style={styles.contactSubLinksRow}>
              <TouchableOpacity onPress={() => router.push('/contact')} style={styles.subLinkBtn}>
                <Text style={styles.subLinkBtnText}>Full Contact Center ➔</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/faq')} style={styles.subLinkBtn}>
                <Text style={styles.subLinkBtnText}>Read FAQs ➔</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Right Column: Interactive Quick Message Form */}
          <View style={styles.contactFormCard}>
            <Text style={styles.formCardHeader}>Drop Us a Quick Message</Text>
            <Text style={styles.formCardSub}>We'll review your query or college addition request immediately.</Text>

            {contactSuccessMessage ? (
              <View style={styles.contactSuccessBanner}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={styles.contactSuccessText}>{contactSuccessMessage}</Text>
              </View>
            ) : null}

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Your Name</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Aman Sharma"
                placeholderTextColor="#64748B"
                value={contactName}
                onChangeText={setContactName}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Your College / Campus</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Integral University, BBIT, AKTU..."
                placeholderTextColor="#64748B"
                value={contactCollege}
                onChangeText={setContactCollege}
              />
            </View>

            <View style={styles.formField}>
              <Text style={styles.formLabel}>Message or Campus Request</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                placeholder="How can we help or what would you like added?"
                placeholderTextColor="#64748B"
                value={contactMessage}
                onChangeText={setContactMessage}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={[styles.sendFormBtn, isSubmittingContact && { opacity: 0.7 }]}
              onPress={handleContactSubmit}
              disabled={isSubmittingContact}
              activeOpacity={0.85}
            >
              {isSubmittingContact ? (
                <ActivityIndicator size="small" color="#09090b" />
              ) : (
                <>
                  <Text style={styles.sendFormBtnText}>Send to Student Team</Text>
                  <Ionicons name="send" size={14} color="#09090b" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Global Footer */}
      <Footer onBackToTop={handleBackToTop} />
    </View>
  );

  return (
    <View style={styles.container}>
      <Head>
        <title>Campus Marketplace - Buy & Sell College Gear | Ooplabdh</title>
        <meta name="description" content="Browse second-hand textbooks, engineering gadgets, furniture, cycles, and student essentials from verified campus sellers." />
        <meta property="og:title" content="Campus Marketplace - Ooplabdh" />
        <meta property="og:description" content="Browse second-hand textbooks, electronics, and college essentials." />
        <link rel="canonical" href="https://ooplabdh.shop/marketplace" />
      </Head>
      <Navbar />

      <View style={styles.mainContent}>
        <FlatList
          ref={listRef}
          key={`${numColumns}-${products.length}`}
          data={products}
          keyExtractor={keyExtractor}
          numColumns={numColumns}
          ListHeaderComponent={renderListHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#38bdf8"
              colors={['#38bdf8']}
            />
          }
          contentContainerStyle={[styles.gridList, isPhone && styles.phoneGridList]}
          columnWrapperStyle={numColumns > 1 ? [styles.row, isSparse && styles.sparseRow, { gap: CARD_GAP }] : undefined}
          removeClippedSubviews={true}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          ListEmptyComponent={
            isLoading ? (
              <View style={styles.loaderBox}>
                <ActivityIndicator size="large" color="#38BDF8" />
                <Text style={styles.loaderText}>Loading verified campus listings...</Text>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="cart-outline" size={48} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>No Listings Found</Text>
                <Text style={styles.emptyText}>
                  {searchQuery || activeCategory !== 'All'
                    ? 'No products matched your active filters. Try searching for something else.'
                    : 'No items have been listed in this campus scope yet. Be the first to list!'}
                </Text>
                <TouchableOpacity
                  style={styles.emptySellBtn}
                  onPress={() => router.push(user ? '/add-product' : ('/(auth)/login?redirect=/add-product' as any))}
                >
                  <Ionicons name="add" size={16} color="#09090b" />
                  <Text style={styles.emptySellBtnText}>List Your Item</Text>
                </TouchableOpacity>
              </View>
            )
          }
          ListFooterComponent={renderListFooter}
          renderItem={renderItem}
        />
      </View>

      {/* College & Category Overview Modal (Image 2 style) */}
      <Modal
        visible={isOverviewModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOverviewModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, isPhone && styles.phoneModalBox]}>
            {/* Header */}
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalHeaderLeft}>
                {/* Orange Flash / Lightning Icon Box */}
                <View style={styles.modalFlashIconBox}>
                  <Ionicons name="flash" size={19} color="#EA580C" />
                </View>

                {/* Title & Badge & Subtitle */}
                <View style={styles.modalTitleBlock}>
                  <View style={styles.modalTitleWithBadge}>
                    <Text style={styles.modalTitleText}>Select Your College</Text>
                    <View style={styles.modalCategoryBadge}>
                      <Text style={styles.modalCategoryBadgeText}>
                        {selectedModalCategory.badge}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.modalSubtitleText} numberOfLines={2}>
                    {selectedModalCategory.subtitle}
                  </Text>
                </View>
              </View>

              {/* Close Button */}
              <TouchableOpacity
                onPress={() => setIsOverviewModalOpen(false)}
                style={styles.modalCloseBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            {/* Search Row */}
            <View style={styles.modalSearchInputBox}>
              <Ionicons name="search" size={17} color="#94A3B8" />
              <TextInput
                style={styles.modalSearchTextInput}
                placeholder="Search colleges by name or city..."
                placeholderTextColor="#64748B"
                value={collegeSearch}
                onChangeText={setCollegeSearch}
              />
              {collegeSearch ? (
                <TouchableOpacity onPress={() => setCollegeSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close-circle" size={16} color="#94A3B8" />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Add Custom College Inline Form (if active) */}
            {isAddingCustomCollege && (
              <View style={styles.customCollegeAddBox}>
                <TextInput
                  style={styles.customCollegeInput}
                  placeholder="Enter your college or campus name..."
                  placeholderTextColor="#64748B"
                  value={customCollegeInput}
                  onChangeText={setCustomCollegeInput}
                  autoFocus
                />
                <TouchableOpacity
                  style={styles.customCollegeAddBtn}
                  onPress={handleAddCustomCollege}
                  activeOpacity={0.8}
                >
                  <Text style={styles.customCollegeAddBtnText}>Add & Select</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Colleges List */}
            <ScrollView style={styles.collegeItemsScroll} showsVerticalScrollIndicator={false}>
              {filteredColleges.map((col) => {
                const isSelected = tempSelectedCollege === col;
                return (
                  <TouchableOpacity
                    key={col}
                    style={[styles.collegeCardItem, isSelected && styles.collegeCardItemActive]}
                    onPress={() => setTempSelectedCollege(col)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.collegeIconBox, isSelected && styles.collegeIconBoxActive]}>
                      <Ionicons
                        name="business-outline"
                        size={18}
                        color={isSelected ? '#38BDF8' : '#94A3B8'}
                      />
                    </View>
                    <View style={styles.collegeInfoBlock}>
                      <Text style={[styles.collegeCardName, isSelected && styles.collegeCardNameActive]}>
                        {col}
                      </Text>
                      <Text style={styles.collegeCardSlug}>
                        {getCollegeSlug(col)}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={19} color="#38BDF8" style={{ marginLeft: 6 }} />
                    )}
                  </TouchableOpacity>
                );
              })}

              {filteredColleges.length === 0 && (
                <View style={styles.noCollegesFoundBox}>
                  <Text style={styles.noCollegesFoundText}>No matching campus found.</Text>
                  <TouchableOpacity onPress={() => setIsAddingCustomCollege(true)}>
                    <Text style={styles.addItHereInlineLink}>Add "{collegeSearch}" as a new college?</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>

            {/* Footer Row */}
            <View style={styles.modalFooterRow}>
              {/* Left Link */}
              <View style={styles.modalFooterLeft}>
                <Text style={styles.cantFindFooterText}>
                  Can't find your college?{' '}
                  <Text
                    style={styles.addHereLinkText}
                    onPress={() => {
                      if (collegeSearch.trim()) {
                        setCustomCollegeInput(collegeSearch.trim());
                      }
                      setIsAddingCustomCollege((prev) => !prev);
                    }}
                  >
                    Add it here
                  </Text>
                </Text>
              </View>

              {/* Right Action Buttons */}
              <View style={styles.modalFooterButtonsRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setIsOverviewModalOpen(false)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalRedirectBtn}
                  onPress={handleConfirmRedirect}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalRedirectBtnText}>
                    Go to {selectedModalCategory.btnLabel}
                  </Text>
                  <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
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
    alignSelf: 'stretch',
  },
  headerWrapper: {
    width: '100%',
    maxWidth: 1440,
    alignSelf: 'center',
    marginBottom: 8,
  },
  verificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 14,
  },
  verificationBannerText: {
    color: '#FBBF24',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },

  // --- HERO STYLES ---
  heroCard: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 24,
    backgroundColor: '#0c0f18',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(56, 189, 248, 0.25)',
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      web: {
        background: 'linear-gradient(135deg, rgba(14, 18, 28, 0.96) 0%, rgba(10, 13, 22, 0.98) 100%)',
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      } as any,
      default: {
        elevation: 6,
      },
    }),
  },
  phoneHeroCard: {
    borderRadius: 20,
    marginHorizontal: 12,
  },
  heroBackgroundGlow: {
    position: 'absolute',
    top: -90,
    right: -90,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    ...Platform.select({
      web: {
        filter: 'blur(75px)',
      } as any,
    }),
  },
  heroBackgroundGlowLeft: {
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    ...Platform.select({
      web: {
        filter: 'blur(70px)',
      } as any,
    }),
  },
  heroContent: {
    padding: 28,
  },
  heroContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 34,
    gap: 28,
  },
  heroLeftCol: {
    flex: 1,
  },
  heroLeftColWide: {
    maxWidth: 640,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  heroBadgeText: {
    color: '#38BDF8',
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  heroLivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  heroLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  heroLiveText: {
    color: '#6EE7B7',
    fontSize: 11.5,
    fontWeight: '700',
  },
  heroHeading: {
    color: '#F8FAFC',
    fontSize: 34,
    lineHeight: 42,
    fontWeight: '800',
    letterSpacing: -0.9,
    marginBottom: 12,
    maxWidth: 720,
  },
  phoneHeroHeading: {
    fontSize: 24,
    lineHeight: 32,
  },
  heroHighlight: {
    color: '#38BDF8',
  },
  heroSubheading: {
    color: '#94A3B8',
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 640,
    marginBottom: 24,
  },
  phoneHeroSubheading: {
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 18,
  },
  heroActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 22,
  },
  phoneHeroActionRow: {
    gap: 10,
  },
  heroPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#38BDF8',
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    ...Platform.select({
      web: {
        background: 'linear-gradient(135deg, #38BDF8 0%, #0284C7 100%)',
        boxShadow: '0 8px 24px rgba(56, 189, 248, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)',
      } as any,
      default: {
        elevation: 4,
      },
    }),
  },
  heroPrimaryBtnText: {
    color: '#09090b',
    fontSize: 14.5,
    fontWeight: '800',
  },
  heroSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 14,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
      } as any,
    }),
  },
  heroSecondaryBtnText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  heroTrustBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  phoneHeroTrustBar: {
    gap: 8,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  trustIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#334155',
  },
  trustText: {
    color: '#94A3B8',
    fontSize: 12.5,
    fontWeight: '600',
  },

  // --- HERO RIGHT SHOWCASE DECK STYLES ---
  heroRightCol: {
    flex: 0.9,
    maxWidth: 480,
    width: '100%',
    position: 'relative',
    paddingVertical: 6,
  },
  heroRightAmbientGlow: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    ...Platform.select({
      web: {
        filter: 'blur(60px)',
      } as any,
    }),
  },
  showcaseCard: {
    backgroundColor: 'rgba(18, 22, 34, 0.88)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderTopColor: 'rgba(56, 189, 248, 0.45)',
    padding: 18,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(20px)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 24px rgba(56, 189, 248, 0.12)',
      } as any,
      default: {
        elevation: 6,
      },
    }),
  },
  showcaseCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  showcaseHotBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  showcaseHotText: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '700',
  },
  showcaseCampusText: {
    color: '#94A3B8',
    fontSize: 11.5,
    fontWeight: '600',
  },
  showcaseProductRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  showcaseIconBox: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  showcaseInfoWrap: {
    flex: 1,
  },
  showcaseTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  showcaseSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 6,
  },
  showcasePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  showcasePrice: {
    color: '#38BDF8',
    fontSize: 18,
    fontWeight: '800',
  },
  showcaseStrike: {
    color: '#64748B',
    fontSize: 12.5,
    textDecorationLine: 'line-through',
  },
  showcaseDiscountPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  showcaseDiscountText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
  showcaseFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  showcaseSellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  showcaseSellerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  showcaseSellerAvatarText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '800',
  },
  showcaseSellerName: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
  },
  showcaseSellerRating: {
    color: '#94A3B8',
    fontSize: 10.5,
  },
  showcaseActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#38BDF8',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 12px rgba(56, 189, 248, 0.35)',
      } as any,
    }),
  },
  showcaseActionBtnText: {
    color: '#09090b',
    fontSize: 12,
    fontWeight: '800',
  },
  showcaseAcademicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(15, 20, 32, 0.92)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.25)',
    padding: 12,
    marginTop: 12,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px)',
        boxShadow: '0 12px 28px rgba(0, 0, 0, 0.45)',
      } as any,
    }),
  },
  showcaseAcademicIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(129, 140, 248, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  showcaseAcademicTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  showcaseAcademicSub: {
    color: '#94A3B8',
    fontSize: 11,
  },
  showcaseAcademicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(129, 140, 248, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  showcaseAcademicPillText: {
    color: '#818CF8',
    fontSize: 11.5,
    fontWeight: '700',
  },
  showcaseEscrowTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    marginTop: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.22)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  showcaseEscrowText: {
    color: '#10B981',
    fontSize: 11.5,
    fontWeight: '700',
  },

  // --- VISUAL CATEGORIES STYLES ---
  categorySectionWrap: {
    marginTop: 22,
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: '#64748B',
    fontSize: 12.5,
    marginTop: 2,
  },
  clearFilterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  clearFilterText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
  },
  visualCategoryScroll: {
    gap: 12,
    paddingVertical: 4,
  },
  visualCatCard: {
    width: 140,
    backgroundColor: '#141418',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  visualCatCardActive: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.09)',
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px rgba(56, 189, 248, 0.2)',
      } as any,
    }),
  },
  visualCatIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  visualCatIconWrapActive: {
    backgroundColor: '#38BDF8',
  },
  visualCatTitle: {
    color: '#F1F5F9',
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  visualCatTitleActive: {
    color: '#38BDF8',
  },
  visualCatSubtitle: {
    color: '#64748B',
    fontSize: 11,
  },

  // --- FILTER SECTION STYLES ---
  filterSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  filterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  filterSectionTitle: {
    color: '#94A3B8',
    fontSize: 12.5,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeCampusLabel: {
    color: '#38BDF8',
    fontSize: 12.5,
    fontWeight: '600',
    maxWidth: 240,
  },
  collegeScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  collegePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.round,
    backgroundColor: 'rgba(24, 24, 27, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  activeCollegePill: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  collegePillText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  activeCollegePillText: {
    color: '#09090b',
    fontWeight: '700',
  },

  // --- FEED STATUS ---
  feedStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  feedHeading: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
  },
  searchQueryBadge: {
    color: '#38BDF8',
    fontSize: 13,
    fontStyle: 'italic',
  },
  feedCountBadge: {
    color: '#64748B',
    fontSize: 12.5,
    fontWeight: '500',
  },

  // --- GRID LIST ---
  gridList: {
    paddingHorizontal: 28,
    paddingBottom: 90,
  },
  phoneGridList: {
    paddingHorizontal: 12,
    paddingBottom: 80,
  },
  row: {
    justifyContent: 'flex-start',
    maxWidth: 1440,
    alignSelf: 'center',
    width: '100%',
  },
  sparseRow: {
    justifyContent: 'flex-start',
  },
  cardWrapper: {
    alignItems: 'center',
  },
  loaderBox: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loaderText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  emptyState: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#141418',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
  },
  emptySellBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#38BDF8',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  emptySellBtnText: {
    color: '#09090b',
    fontSize: 13,
    fontWeight: '700',
  },
  footerWrapper: {
    width: '100%',
    maxWidth: 1440,
    alignSelf: 'center',
    marginTop: 32,
  },

  // --- MODAL STYLES (Image 2 Match) ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    width: '100%',
    maxWidth: 540,
    maxHeight: '88%',
    backgroundColor: '#131417',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#242630',
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 28,
    elevation: 12,
  },
  phoneModalBox: {
    maxWidth: '100%',
    maxHeight: '94%',
    padding: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    paddingRight: 12,
    gap: 12,
  },
  modalFlashIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: '#2b1609',
    borderWidth: 1,
    borderColor: '#54290e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitleBlock: {
    flex: 1,
  },
  modalTitleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalTitleText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  modalCategoryBadge: {
    backgroundColor: '#262732',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  modalCategoryBadgeText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  modalSubtitleText: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalSearchInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d0e11',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#0284C7',
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 14,
    gap: 8,
  },
  modalSearchTextInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 14,
    paddingVertical: 0,
  },
  customCollegeAddBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 132, 199, 0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(2, 132, 199, 0.3)',
    padding: 6,
    marginBottom: 14,
    gap: 8,
  },
  customCollegeInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 13,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  customCollegeAddBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  customCollegeAddBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  collegeItemsScroll: {
    maxHeight: 250,
  },
  collegeCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181920',
    borderWidth: 1.5,
    borderColor: '#242632',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  collegeCardItemActive: {
    backgroundColor: '#1a1d26',
    borderColor: '#0284C7',
  },
  collegeIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#22242e',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  collegeIconBoxActive: {
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
  },
  collegeInfoBlock: {
    flex: 1,
  },
  collegeCardName: {
    color: '#F1F5F9',
    fontSize: 14.5,
    fontWeight: '600',
  },
  collegeCardNameActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  collegeCardSlug: {
    color: '#828d9e',
    fontSize: 12,
    marginTop: 2,
  },
  noCollegesFoundBox: {
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  noCollegesFoundText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  addItHereInlineLink: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  modalFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#20222b',
    flexWrap: 'wrap',
    gap: 12,
  },
  modalFooterLeft: {
    flex: 1,
    minWidth: 180,
  },
  cantFindFooterText: {
    color: '#94A3B8',
    fontSize: 12.5,
  },
  addHereLinkText: {
    color: '#38BDF8',
    fontWeight: '600',
  },
  modalFooterButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  modalCancelBtn: {
    backgroundColor: '#22232a',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
  },
  modalCancelBtnText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '500',
  },
  modalRedirectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  modalRedirectBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // --- ABOUT SECTION STYLES ---
  aboutSectionCard: {
    marginHorizontal: 16,
    backgroundColor: '#0c0f18',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(56, 189, 248, 0.28)',
    padding: 28,
    marginBottom: 22,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        background: 'linear-gradient(135deg, rgba(14, 18, 28, 0.95) 0%, rgba(10, 13, 22, 0.98) 100%)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
      } as any,
      default: {
        elevation: 4,
      },
    }),
  },
  factsSectionCard: {
    marginHorizontal: 16,
    backgroundColor: '#0c0f18',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(245, 158, 11, 0.28)',
    padding: 28,
    marginBottom: 22,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        background: 'linear-gradient(135deg, rgba(14, 18, 28, 0.95) 0%, rgba(10, 13, 22, 0.98) 100%)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
      } as any,
      default: {
        elevation: 4,
      },
    }),
  },
  contactSectionCard: {
    marginHorizontal: 16,
    backgroundColor: '#0c0f18',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderTopColor: 'rgba(16, 185, 129, 0.28)',
    padding: 28,
    marginBottom: 26,
    overflow: 'hidden',
    ...Platform.select({
      web: {
        background: 'linear-gradient(135deg, rgba(14, 18, 28, 0.95) 0%, rgba(10, 13, 22, 0.98) 100%)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
      } as any,
      default: {
        elevation: 4,
      },
    }),
  },
  phoneSectionCard: {
    marginHorizontal: 12,
    padding: 18,
    borderRadius: 20,
    marginBottom: 16,
  },
  sectionHeaderWrap: {
    marginBottom: 22,
  },
  sectionKickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },
  sectionKickerText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  sectionHeading: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: 8,
  },
  phoneSectionHeading: {
    fontSize: 19,
    lineHeight: 26,
  },
  sectionLeadText: {
    color: '#94A3B8',
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 720,
  },
  aboutPillarsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  phonePillarsGrid: {
    flexDirection: 'column',
    gap: 12,
  },
  aboutPillarCard: {
    flex: 1,
    backgroundColor: 'rgba(18, 22, 34, 0.75)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    padding: 20,
    justifyContent: 'space-between',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
      } as any,
    }),
  },
  pillarIconBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  pillarTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  pillarDesc: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  pillarTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillarTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  aboutBottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 8,
    flexWrap: 'wrap',
  },
  aboutActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aboutActionBtnText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
  },
  aboutActionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aboutActionBtnSecondaryText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },

  // --- FACTS GRID STYLES ---
  factsGrid: {
    flexDirection: 'row',
    gap: 14,
  },
  phoneFactsGrid: {
    flexDirection: 'column',
    gap: 10,
  },
  factCard: {
    flex: 1,
    backgroundColor: 'rgba(18, 22, 34, 0.75)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    padding: 20,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
      } as any,
    }),
  },
  factIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  factNumber: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
    marginBottom: 4,
  },
  factLabel: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  factSubtext: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 17,
  },

  // --- CONTACT SPLIT STYLES ---
  contactSplitGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  phoneContactSplitGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  contactLeftCol: {
    flex: 1,
    gap: 10,
  },
  contactChannelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 22, 34, 0.75)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    padding: 14,
    gap: 12,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25)',
      } as any,
    }),
  },
  channelIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  channelTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  channelDesc: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  contactSubLinksRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  subLinkBtn: {
    paddingVertical: 4,
  },
  subLinkBtnText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
  },
  contactFormCard: {
    flex: 1,
    backgroundColor: 'rgba(18, 22, 34, 0.82)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 22,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(14px)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
      } as any,
    }),
  },
  formCardHeader: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  formCardSub: {
    color: '#94A3B8',
    fontSize: 12.5,
    marginBottom: 16,
  },
  contactSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  contactSuccessText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  formField: {
    marginBottom: 12,
  },
  formLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 5,
  },
  formInput: {
    backgroundColor: '#0d0e12',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#252733',
    color: '#F8FAFC',
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  formTextArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  sendFormBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#38BDF8',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  sendFormBtnText: {
    color: '#09090b',
    fontSize: 13,
    fontWeight: '700',
  },
  marketTransitionBar: {
    paddingVertical: 6,
    marginBottom: 12,
  },
  marketTransitionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.06)',
    borderColor: 'rgba(56, 189, 248, 0.2)',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  marketTransitionText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
  },
});
