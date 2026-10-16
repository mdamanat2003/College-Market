import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

export default function HeroBanner() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { width } = useWindowDimensions();

  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1100;
  const isDesktop = width >= 1100;

  // Seamless scaling for right showcase stage so phone + 4 badges stay perfectly aligned on all screen widths
  const stageScale = isMobile
    ? Math.max(0.68, Math.min(1, (width - 48) / 490))
    : isTablet
    ? 0.9
    : 1;

  const stageHeight = 470 * stageScale;

  const handleSellPress = () => {
    if (user) {
      router.push('/add-product');
    } else {
      router.push('/(auth)/login?redirect=/add-product' as any);
    }
  };

  const handlePyqPress = () => {
    router.push('/academic');
  };

  return (
    <View style={styles.outerWrapper}>
      {/* Background ambient glow effects */}
      <View style={styles.ambientGlowLeft} />
      <View style={styles.ambientGlowRight} />

      <View style={[styles.bannerContainer, isMobile && styles.bannerContainerMobile]}>
        {/* Decorative Sparkle Stars */}
        <View style={styles.sparkleTopRight}>
          <Text style={styles.sparkleChar}>✦</Text>
        </View>
        <View style={styles.sparkleCenter}>
          <Text style={styles.sparkleCharSmall}>✦</Text>
        </View>

        {/* Banner Content Layout */}
        <View style={[styles.bannerRow, isMobile && styles.bannerRowMobile]}>
          
          {/* ========================================================
              LEFT COLUMN: Typography & Action Buttons
          ======================================================== */}
          <View style={[styles.leftColumn, isMobile && styles.leftColumnMobile]}>
            {/* Logo Header */}
            <View style={styles.brandRow}>
              <View style={styles.logoMarkWrapper}>
                <Image
                  source={require('../../assets/images/ooplabdh-logo.png')}
                  style={styles.logoMarkImage}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.brandName}>
                Ooplabdh<Text style={styles.brandDot}>.</Text>
              </Text>
            </View>

            {/* Main Headline */}
            <Text style={[styles.heading, isMobile && styles.headingMobile]}>
              Your Campus.{'\n'}
              <Text style={styles.headingAccent}>Your Marketplace.</Text>
            </Text>

            {/* Colloquial Tagline */}
            <View style={styles.taglineBox}>
              <Text style={styles.taglineLine1}>
                Ek senior ka vishwas, do aadhi-adhuri PDF ka sahara.
              </Text>
              <Text style={styles.taglineLine2}>
                Chhodo sabka tension, ab{' '}
                <Text style={styles.taglineHighlight}>Ooplabdh</Text> par karein bharosa.
              </Text>
            </View>

            {/* CTA Buttons */}
            <View style={[styles.buttonRow, isMobile && styles.buttonRowMobile]}>
              <TouchableOpacity
                testID="banner-sell-button"
                style={styles.primaryBtn}
                onPress={handleSellPress}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>+ Sell / Explore</Text>
              </TouchableOpacity>

              <TouchableOpacity
                testID="banner-pyq-button"
                style={styles.secondaryBtn}
                onPress={handlePyqPress}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryBtnText}>Browse PYQs & Books</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ========================================================
              RIGHT COLUMN: Smartphone Mockup & Surrounding Features
          ======================================================== */}
          <View style={[styles.rightColumn, isMobile && styles.rightColumnMobile]}>
            <View style={[styles.stageScalerWrapper, { height: stageHeight }]}>
              <View
                style={[
                  styles.showcaseStage,
                  {
                    transform: [{ scale: stageScale }],
                  },
                ]}
              >
                {/* FEATURE 1: Top-Left (Academic Resources / PYQ Book) */}
                <TouchableOpacity
                  style={[styles.floatingBadge, styles.badgeTopLeft]}
                  onPress={() => router.push('/academic')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.featureIconBox, styles.bookIconBg]}>
                    <View style={styles.bookCover}>
                      <Text style={styles.bookTitle}>PYQ</Text>
                      <View style={styles.bookRibbon} />
                    </View>
                    <View style={styles.bookPages} />
                  </View>
                  <Text style={styles.badgeLabel}>
                    Academic{'\n'}Resources
                  </Text>
                </TouchableOpacity>

                {/* FEATURE 2: Top-Right (Lost & Found / Keys & Magnifier) */}
                <TouchableOpacity
                  style={[styles.floatingBadge, styles.badgeTopRight]}
                  onPress={() => router.push('/lost-found')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.featureIconBox, styles.keyIconBg]}>
                    <View style={styles.keyMagnifierGroup}>
                      <Ionicons name="key" size={24} color="#FBBF24" style={styles.keyAngle} />
                      <Ionicons name="search" size={20} color="#7DD3FC" style={styles.searchAngle} />
                    </View>
                  </View>
                  <Text style={styles.badgeLabel}>
                    Lost & Found
                  </Text>
                </TouchableOpacity>

                {/* CENTRAL SMARTPHONE MOCKUP */}
                <View style={styles.phoneWrapper}>
                  <View style={styles.phoneFrame}>
                    {/* Dynamic Island / Notch */}
                    <View style={styles.dynamicIsland}>
                      <View style={styles.cameraDot} />
                      <View style={styles.sensorDot} />
                    </View>

                    {/* Phone Inner Screen UI */}
                    <View style={styles.screenInner}>
                      {/* Status Bar */}
                      <View style={styles.phoneStatusBar}>
                        <Text style={styles.phoneStatusTime}>9:41</Text>
                        <View style={styles.phoneStatusIcons}>
                          <Ionicons name="cellular" size={10} color="#94A3B8" />
                          <Ionicons name="wifi" size={10} color="#94A3B8" />
                          <Ionicons name="battery-full" size={12} color="#94A3B8" />
                        </View>
                      </View>

                      {/* App Bar */}
                      <View style={styles.phoneAppBar}>
                        <View style={styles.phoneBrandRow}>
                          <View style={styles.phoneMiniLogo}>
                            <Image
                              source={require('../../assets/images/ooplabdh-logo.png')}
                              style={{ width: 14, height: 14, borderRadius: 7 }}
                            />
                          </View>
                          <Text style={styles.phoneBrandText}>Ooplabdh</Text>
                        </View>
                        <View style={styles.phoneHeaderIcons}>
                          <Ionicons name="notifications-outline" size={13} color="#94A3B8" />
                          <Ionicons name="bag-handle-outline" size={13} color="#94A3B8" />
                        </View>
                      </View>

                      {/* Mini Search Input */}
                      <View style={styles.phoneSearchBar}>
                        <Ionicons name="search-outline" size={11} color="#64748B" />
                        <Text style={styles.phoneSearchPlaceholder}>Search for notes, gear...</Text>
                      </View>

                      {/* Verified PYQs Banner Card */}
                      <View style={styles.phoneBannerCard}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.phoneBannerCardTitle}>Verified PYQs{'\n'}Section</Text>
                          <View style={styles.phoneOrderNowBtn}>
                            <Text style={styles.phoneOrderNowText}>Order now</Text>
                          </View>
                        </View>
                        <View style={styles.phoneBannerBookIcon}>
                          <Ionicons name="checkmark-circle" size={14} color="#34D399" style={styles.phoneCheckIcon} />
                          <Ionicons name="book" size={26} color="#38BDF8" />
                        </View>
                      </View>

                      {/* Filter Pills */}
                      <View style={styles.phoneFilterRow}>
                        <View style={styles.phoneFilterPillActive}>
                          <Text style={styles.phoneFilterPillActiveText}>All PYQs</Text>
                        </View>
                        <View style={styles.phoneFilterPill}>
                          <Text style={styles.phoneFilterPillText}>Code PYQs</Text>
                        </View>
                      </View>

                      {/* Marketplace Header */}
                      <View style={styles.phoneSectionHeader}>
                        <Text style={styles.phoneSectionTitle}>Marketplace</Text>
                        <Text style={styles.phoneSectionAction}>View All</Text>
                      </View>

                      {/* Mini Product Cards Grid */}
                      <View style={styles.phoneGrid}>
                        <View style={styles.phoneMiniCard}>
                          <View style={styles.miniCardIconWrap}>
                            <Ionicons name="document-text" size={18} color="#FBBF24" />
                          </View>
                          <Text style={styles.miniCardTitle} numberOfLines={1}>Verified PYQs</Text>
                          <Text style={styles.miniCardSubtitle}>Textbooks</Text>
                        </View>

                        <View style={styles.phoneMiniCard}>
                          <View style={styles.miniCardIconWrap}>
                            <Ionicons name="cart" size={18} color="#38BDF8" />
                          </View>
                          <Text style={styles.miniCardTitle} numberOfLines={1}>Marketplace</Text>
                          <Text style={styles.miniCardSubtitle}>Hostel Gear</Text>
                        </View>

                        <View style={styles.phoneMiniCard}>
                          <View style={styles.miniCardIconWrap}>
                            <Ionicons name="briefcase" size={18} color="#A78BFA" />
                          </View>
                          <Text style={styles.miniCardTitle} numberOfLines={1}>Opportunities</Text>
                          <Text style={styles.miniCardSubtitle}>Gigs & Jobs</Text>
                        </View>
                      </View>

                      {/* Bottom Nav Bar */}
                      <View style={styles.phoneBottomNav}>
                        <View style={styles.phoneNavItemActive}>
                          <Ionicons name="home" size={13} color="#38BDF8" />
                        </View>
                        <View style={styles.phoneNavItem}>
                          <Ionicons name="grid-outline" size={13} color="#64748B" />
                        </View>
                        <View style={styles.phoneNavItem}>
                          <Ionicons name="book-outline" size={13} color="#64748B" />
                        </View>
                        <View style={styles.phoneNavItem}>
                          <Ionicons name="person-outline" size={13} color="#64748B" />
                        </View>
                      </View>

                    </View>
                  </View>
                </View>

                {/* FEATURE 3: Bottom-Left (Student Community Hub) */}
                <TouchableOpacity
                  style={[styles.floatingBadge, styles.badgeBottomLeft]}
                  onPress={() => router.push('/community')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.featureIconBox, styles.communityIconBg]}>
                    <View style={styles.communityAvatarsHub}>
                      <View style={[styles.miniAvatar, styles.avatarTop]}>
                        <Ionicons name="person" size={11} color="#060B14" />
                      </View>
                      <View style={[styles.miniAvatar, styles.avatarLeft]}>
                        <Ionicons name="person" size={11} color="#060B14" />
                      </View>
                      <View style={[styles.miniAvatar, styles.avatarRight]}>
                        <Ionicons name="person" size={11} color="#060B14" />
                      </View>
                      <View style={[styles.miniAvatar, styles.avatarBottom]}>
                        <Ionicons name="person" size={11} color="#060B14" />
                      </View>
                      <View style={styles.avatarCenterNode}>
                        <Ionicons name="infinite" size={14} color="#7DD3FC" />
                      </View>
                    </View>
                  </View>
                  <Text style={styles.badgeLabel}>
                    Student{'\n'}Community Hub
                  </Text>
                </TouchableOpacity>

                {/* FEATURE 4: Bottom-Right (Opportunity Marketplace) */}
                <TouchableOpacity
                  style={[styles.floatingBadge, styles.badgeBottomRight]}
                  onPress={() => router.push('/(tabs)/marketplace')}
                  activeOpacity={0.8}
                >
                  <View style={[styles.featureIconBox, styles.trolleyIconBg]}>
                    <View style={styles.trolleyGraphic}>
                      <Ionicons name="cube" size={22} color="#FBBF24" style={styles.boxOne} />
                      <Ionicons name="cube-outline" size={18} color="#F59E0B" style={styles.boxTwo} />
                      <View style={styles.trolleyWheelsRow}>
                        <View style={styles.trolleyWheel} />
                        <View style={styles.trolleyWheel} />
                      </View>
                    </View>
                  </View>
                  <Text style={styles.badgeLabel}>
                    Opportunity{'\n'}Marketplace
                  </Text>
                </TouchableOpacity>

              </View>
            </View>
          </View>

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    alignItems: 'center',
    position: 'relative',
  },
  ambientGlowLeft: {
    position: 'absolute',
    top: 20,
    left: '4%',
    width: '38%',
    height: 360,
    borderRadius: 999,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    ...Platform.select({
      web: { filter: 'blur(90px)' } as any,
    }),
  },
  ambientGlowRight: {
    position: 'absolute',
    top: 50,
    right: '4%',
    width: '42%',
    height: 380,
    borderRadius: 999,
    backgroundColor: 'rgba(2, 132, 199, 0.16)',
    ...Platform.select({
      web: { filter: 'blur(100px)' } as any,
    }),
  },
  bannerContainer: {
    width: '100%',
    maxWidth: 1240,
    backgroundColor: '#070D1C',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.22)',
    borderTopColor: 'rgba(56, 189, 248, 0.45)',
    paddingVertical: 36,
    paddingHorizontal: 36,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.75), 0 0 35px rgba(56, 189, 248, 0.12)',
      } as any,
      default: {
        elevation: 8,
        shadowColor: '#0284C7',
        shadowOpacity: 0.35,
        shadowRadius: 24,
      },
    }),
  },
  bannerContainerMobile: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderRadius: 20,
  },

  // Sparkles
  sparkleTopRight: {
    position: 'absolute',
    top: 30,
    right: '36%',
    zIndex: 2,
  },
  sparkleCenter: {
    position: 'absolute',
    top: '22%',
    left: '47%',
    zIndex: 2,
    opacity: 0.75,
  },
  sparkleChar: {
    fontSize: 22,
    color: '#7DD3FC',
    fontWeight: '900',
    ...Platform.select({
      web: {
        textShadow: '0 0 12px rgba(125, 211, 252, 0.8)',
      } as any,
    }),
  },
  sparkleCharSmall: {
    fontSize: 14,
    color: '#38BDF8',
    fontWeight: '800',
    ...Platform.select({
      web: {
        textShadow: '0 0 8px rgba(56, 189, 248, 0.7)',
      } as any,
    }),
  },

  // Banner Content Row
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 28,
  },
  bannerRowMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 30,
  },

  // ==========================================
  // LEFT COLUMN
  // ==========================================
  leftColumn: {
    flex: 1.15,
    minWidth: 300,
    justifyContent: 'center',
    zIndex: 5,
  },
  leftColumnMobile: {
    flex: undefined,
    minWidth: 0,
    alignItems: 'flex-start',
  },

  // Brand Header
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 18,
  },
  logoMarkWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(251, 191, 36, 0.6)',
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoMarkImage: {
    width: '100%',
    height: '100%',
  },
  brandName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  brandDot: {
    color: '#FBBF24',
  },

  // Headline
  heading: {
    color: '#FFFFFF',
    fontSize: 44,
    lineHeight: 52,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  headingMobile: {
    fontSize: 32,
    lineHeight: 38,
  },
  headingAccent: {
    color: '#38BDF8',
    ...Platform.select({
      web: {
        textShadow: '0 0 24px rgba(56, 189, 248, 0.35)',
      } as any,
    }),
  },

  // Tagline
  taglineBox: {
    marginTop: 18,
    gap: 4,
  },
  taglineLine1: {
    color: '#94A3B8',
    fontSize: 15.5,
    lineHeight: 23,
    fontWeight: '500',
  },
  taglineLine2: {
    color: '#94A3B8',
    fontSize: 15.5,
    lineHeight: 23,
    fontWeight: '500',
  },
  taglineHighlight: {
    color: '#FBBF24',
    fontWeight: '700',
  },

  // CTA Buttons
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 28,
    flexWrap: 'wrap',
  },
  buttonRowMobile: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        boxShadow: '0 6px 20px rgba(56, 189, 248, 0.45)',
        transition: 'transform 0.15s ease',
      } as any,
      default: {
        elevation: 4,
      },
    }),
  },
  primaryBtnText: {
    color: '#060B14',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  secondaryBtn: {
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        backdropFilter: 'blur(8px)',
        transition: 'border-color 0.15s ease',
      } as any,
    }),
  },
  secondaryBtnText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  // ==========================================
  // RIGHT COLUMN (Phone & Floating Badges)
  // ==========================================
  rightColumn: {
    flex: 1.15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightColumnMobile: {
    flex: undefined,
    width: '100%',
  },
  stageScalerWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  showcaseStage: {
    width: 480,
    height: 470,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Smartphone Mockup Frame
  phoneWrapper: {
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneFrame: {
    width: 224,
    height: 440,
    backgroundColor: '#1E293B',
    borderRadius: 40,
    padding: 6,
    borderWidth: 2,
    borderColor: '#334155',
    position: 'relative',
    ...Platform.select({
      web: {
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(56, 189, 248, 0.18)',
      } as any,
      default: {
        elevation: 10,
        shadowColor: '#000',
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
    }),
  },
  dynamicIsland: {
    position: 'absolute',
    top: 11,
    alignSelf: 'center',
    width: 62,
    height: 15,
    borderRadius: 10,
    backgroundColor: '#000000',
    zIndex: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 6,
    gap: 4,
  },
  cameraDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#0F172A',
  },
  sensorDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 1.75,
    backgroundColor: '#090D16',
  },
  screenInner: {
    flex: 1,
    backgroundColor: '#090D1A',
    borderRadius: 34,
    paddingHorizontal: 11,
    paddingTop: 24,
    paddingBottom: 8,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },

  // Phone Status Bar
  phoneStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginBottom: 6,
  },
  phoneStatusTime: {
    color: '#94A3B8',
    fontSize: 9.5,
    fontWeight: '700',
  },
  phoneStatusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  // Phone App Bar
  phoneAppBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
    marginBottom: 8,
  },
  phoneBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  phoneMiniLogo: {
    width: 16,
    height: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  phoneBrandText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  phoneHeaderIcons: {
    flexDirection: 'row',
    gap: 8,
  },

  // Phone Search Bar
  phoneSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 8,
  },
  phoneSearchPlaceholder: {
    color: '#64748B',
    fontSize: 8.5,
    flex: 1,
  },

  // Phone Banner Card (Verified PYQs)
  phoneBannerCard: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderRadius: 12,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  phoneBannerCardTitle: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
    lineHeight: 12,
    marginBottom: 5,
  },
  phoneOrderNowBtn: {
    backgroundColor: '#38BDF8',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  phoneOrderNowText: {
    color: '#060B14',
    fontSize: 7.5,
    fontWeight: '800',
  },
  phoneBannerBookIcon: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneCheckIcon: {
    position: 'absolute',
    top: -4,
    right: -4,
    zIndex: 2,
  },

  // Filter Pills
  phoneFilterRow: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 8,
  },
  phoneFilterPillActive: {
    backgroundColor: '#FBBF24',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  phoneFilterPillActiveText: {
    color: '#060B14',
    fontSize: 8,
    fontWeight: '800',
  },
  phoneFilterPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  phoneFilterPillText: {
    color: '#94A3B8',
    fontSize: 8,
    fontWeight: '600',
  },

  // Phone Marketplace Section
  phoneSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  phoneSectionTitle: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  phoneSectionAction: {
    color: '#38BDF8',
    fontSize: 8,
    fontWeight: '700',
  },
  phoneGrid: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 6,
  },
  phoneMiniCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 8,
    padding: 5,
    alignItems: 'center',
  },
  miniCardIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  miniCardTitle: {
    color: '#FFFFFF',
    fontSize: 7,
    fontWeight: '700',
    textAlign: 'center',
  },
  miniCardSubtitle: {
    color: '#64748B',
    fontSize: 6,
    textAlign: 'center',
  },

  // Phone Bottom Navigation
  phoneBottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 6,
    marginTop: 'auto',
  },
  phoneNavItemActive: {
    alignItems: 'center',
  },
  phoneNavItem: {
    alignItems: 'center',
    opacity: 0.6,
  },

  // ==========================================
  // 4 FLOATING SURROUNDING BADGES
  // ==========================================
  floatingBadge: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 15,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
      } as any,
    }),
  },
  badgeLabel: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 7,
    lineHeight: 15,
    ...Platform.select({
      web: {
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
      } as any,
    }),
  },
  featureIconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
      } as any,
      default: {
        elevation: 6,
      },
    }),
  },

  // Badge 1: Top-Left (Academic Resources / PYQ Book)
  badgeTopLeft: {
    top: 36,
    left: 18,
  },
  bookIconBg: {
    backgroundColor: '#1E1B13',
    borderColor: 'rgba(251, 191, 36, 0.35)',
  },
  bookCover: {
    width: 32,
    height: 38,
    backgroundColor: '#D97706',
    borderRadius: 4,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#92400E',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
  },
  bookTitle: {
    color: '#FEF3C7',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bookRibbon: {
    position: 'absolute',
    bottom: 0,
    right: 6,
    width: 5,
    height: 7,
    backgroundColor: '#EF4444',
  },
  bookPages: {
    position: 'absolute',
    right: 11,
    bottom: 9,
    width: 3,
    height: 32,
    backgroundColor: '#FDE68A',
    borderRadius: 1,
  },

  // Badge 2: Top-Right (Lost & Found)
  badgeTopRight: {
    top: 36,
    right: 18,
  },
  keyIconBg: {
    backgroundColor: '#131A26',
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  keyMagnifierGroup: {
    position: 'relative',
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyAngle: {
    transform: [{ rotate: '-35deg' }],
    position: 'absolute',
    top: 2,
    left: 2,
  },
  searchAngle: {
    position: 'absolute',
    bottom: 1,
    right: 1,
  },

  // Badge 3: Bottom-Left (Student Community Hub)
  badgeBottomLeft: {
    bottom: 30,
    left: 12,
  },
  communityIconBg: {
    backgroundColor: '#0F1E24',
    borderColor: 'rgba(52, 211, 153, 0.35)',
  },
  communityAvatarsHub: {
    width: 40,
    height: 40,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatar: {
    position: 'absolute',
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#FBBF24',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#070D1C',
  },
  avatarTop: {
    top: 0,
    backgroundColor: '#38BDF8',
  },
  avatarBottom: {
    bottom: 0,
    backgroundColor: '#34D399',
  },
  avatarLeft: {
    left: 0,
    backgroundColor: '#F472B6',
  },
  avatarRight: {
    right: 0,
    backgroundColor: '#FBBF24',
  },
  avatarCenterNode: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.5)',
  },

  // Badge 4: Bottom-Right (Opportunity Marketplace)
  badgeBottomRight: {
    bottom: 30,
    right: 12,
  },
  trolleyIconBg: {
    backgroundColor: '#1C1917',
    borderColor: 'rgba(251, 191, 36, 0.35)',
  },
  trolleyGraphic: {
    position: 'relative',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOne: {
    position: 'absolute',
    top: 1,
    left: 6,
  },
  boxTwo: {
    position: 'absolute',
    top: 8,
    right: 3,
  },
  trolleyWheelsRow: {
    position: 'absolute',
    bottom: 2,
    flexDirection: 'row',
    gap: 12,
  },
  trolleyWheel: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#94A3B8',
    borderWidth: 1,
    borderColor: '#334155',
  },
});
