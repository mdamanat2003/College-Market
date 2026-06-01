import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Pressable, Modal, TextInput, KeyboardAvoidingView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

import Footer from '../layout/Footer';
import { PublicNavbar } from '../layout/PublicNavbar';
import { useChatStore } from '../../store/chatStore';
import { api, SOCKET_URL } from '../../services/api';
import { SPACING } from '../../theme/colors';

const featureCards = [
  { title: 'Secure Escrow Payments', description: 'Funds stay protected until the deal is completed.', icon: 'shield-checkmark-outline' as const },
  { title: 'Live Chat', description: 'Negotiate instantly with fast in-app messaging.', icon: 'chatbubbles-outline' as const },
  { title: 'Smart Search', description: 'Find books, gadgets, and dorm essentials in seconds.', icon: 'search-outline' as const },
  { title: 'Verified Campus Users', description: 'Keep the marketplace trusted with student verification.', icon: 'checkmark-done-circle-outline' as const },
];

const stats = [
  { value: '120+', label: 'campus groups' },
  { value: '< 2 min', label: 'average reply' },
  { value: '98.6%', label: 'trusted sellers' },
];

const initialReviews = [
  { id: 1, name: 'Rahul Sharma', time: '1 MONTH AGO', text: '"Alhamdulillah learning a lot with CampusCart. The escrow feature is unique and very safe to use for buying textbooks."', initial: 'R' },
  { id: 2, name: 'Priya Patel', time: '2 MONTHS AGO', text: '"Great online platform for our college. Selling my old laptop was a breeze. Live chat helped me negotiate quickly. Highly recommended!"', initial: 'P' },
  { id: 3, name: 'Mustan Ali', time: '2 WEEKS AGO', text: '"Awesome experience! Bought a monitor for my dorm setup. Smooth deal and instant verification. The UI feels incredibly premium."', initial: 'M' },
  { id: 4, name: 'Safdar Khan', time: '1 MONTH AGO', text: '"Best campus marketplace out there. Sold my college cycle within an hour. Chat features are really fast and fluid."', initial: 'S' },
  { id: 5, name: 'Masab Mallick', time: '3 WEEKS AGO', text: '"Highly secure app. No spam or noisy clutter like WhatsApp groups. Perfect for buying and selling second-hand gadgets safely on campus."', initial: 'M' },
  { id: 6, name: 'Adnan Karim', time: '3 MONTHS AGO', text: '"I suggest my friends to use CampusCart instead of WhatsApp groups. Messages don\'t get lost and transactions are secure."', initial: 'A' }
];

function FeatureCardItem({ item, isTablet, isDesktop }: { item: any, isTablet: boolean, isDesktop: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <Pressable
      //@ts-ignore
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={({ pressed }) => [styles.gridFeatureCard, isTablet && styles.cardTablet, isDesktop && styles.cardDesktop, (isHovered || pressed) && styles.gridFeatureCardHovered]}
    >
      {({ pressed }) => (
        <>
          <View style={[styles.watermarkGlow, (isHovered || pressed) && styles.watermarkGlowActive]} />
          <View style={styles.featureHeaderRow}>
            <View style={[styles.featureIconWrap, (isHovered || pressed) && styles.featureIconWrapActive]}>
              <Ionicons name={item.icon} size={22} color={(isHovered || pressed) ? "#60a5fa" : "#7dd3fc"} />
            </View>
            <Ionicons name="apps-outline" size={20} color="rgba(255,255,255,0.15)" />
          </View>
          <View style={styles.featureTextContainer}>
            <Text style={[styles.featureTitle, (isHovered || pressed) && styles.featureTitleActive]}>{item.title}</Text>
            <Text style={styles.featureDescription}>{item.description}</Text>
          </View>
        </>
      )}
    </Pressable>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const reviewsScrollRef = useRef<ScrollView>(null); 
  const scrollOffset = useRef(0); 
  const reviewsLoopWidth = useRef(0);
  const reviewSocketRef = useRef<Socket | null>(null);
  
  // Nayi States Form ke liye
  const [reviewsList, setReviewsList] = useState(initialReviews);
  const extendedReviews = [...reviewsList, ...reviewsList];
  
  const [isReviewModalVisible, setReviewModalVisible] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newName, setNewName] = useState('');
  const [newReviewText, setNewReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const welcomeGradient = useRef(new Animated.Value(0)).current;
  const textColorAnim = useRef(new Animated.Value(0)).current; 

  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isTablet = width < 900;
  const isMobile = width < 520;
  const isMockupCompact = width < 1120;
  const isCompact = width < 380;

  // Socket from global chat store — used to receive live review events
  const socket = useChatStore((s) => s.socket);

  // Load persisted public reviews from backend on mount
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await api.get('/reviews/public?limit=40');
        const fetched: any[] = res.data?.reviews || [];
        if (!mounted) return;
        if (fetched.length > 0) {
          const mapped = fetched.map((r) => ({
            id: r._id,
            name: r.reviewerName || 'Someone',
            time: r.createdAt ? new Date(r.createdAt).toLocaleString() : 'JUST NOW',
            text: `"${r.comment || ''}"`,
            initial: (r.reviewerName || 'S').charAt(0).toUpperCase(),
          }));
          setReviewsList(mapped);
        }
      } catch (err) {
        console.warn('[LandingPage] failed to load public reviews', err);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const activeSocket = socket || reviewSocketRef.current || io(SOCKET_URL);

    if (!socket && !reviewSocketRef.current) {
      reviewSocketRef.current = activeSocket;
    }

    const handleNewReview = (review: any) => {
      console.log('[LandingPage] newReview received', review);
      const name = review.reviewerName || (review.reviewer && review.reviewer.name) || 'Someone';
      const newEntry = {
        id: review._id || Date.now(),
        name,
        time: 'JUST NOW',
        text: `"${review.comment || review.text || ''}"`,
        initial: name.charAt(0).toUpperCase(),
      };

      setReviewsList((prev) => {
        if (prev.some((item) => String(item.id) === String(newEntry.id))) {
          return prev;
        }
        return [newEntry, ...prev];
      });
    };

    activeSocket.on('newReview', handleNewReview);
    return () => {
      activeSocket.off('newReview', handleNewReview);

      if (!socket && reviewSocketRef.current === activeSocket) {
        activeSocket.disconnect();
        reviewSocketRef.current = null;
      }
    };
  }, [socket]);

  useEffect(() => {
    // Faster, livelier welcome animations
    const gradientAnimation = Animated.loop(Animated.timing(welcomeGradient, { toValue: 1, duration: 5000, easing: Easing.inOut(Easing.ease), useNativeDriver: false }));
    const colorAnimation = Animated.loop(Animated.timing(textColorAnim, { toValue: 1, duration: 3500, easing: Easing.linear, useNativeDriver: false }));
    gradientAnimation.start();
    colorAnimation.start();

    const scrollSpeed = 1.5; 
    const intervalId = setInterval(() => {
      if (reviewsScrollRef.current && !isReviewModalVisible) { // Modal open hone par scroll rok do
        scrollOffset.current += scrollSpeed;
        reviewsScrollRef.current.scrollTo({ x: scrollOffset.current, animated: false });
        if (reviewsLoopWidth.current > 0 && scrollOffset.current >= reviewsLoopWidth.current / 2) {
          scrollOffset.current = 0;
          reviewsScrollRef.current.scrollTo({ x: 0, animated: false });
        }
      }
    }, 20); 

    return () => {
      gradientAnimation.stop();
      colorAnimation.stop();
      clearInterval(intervalId); 
    };
  }, [welcomeGradient, textColorAnim, isReviewModalVisible]);

  const handleSubmitReview = async () => {
    const trimmedName = newName.trim();
    const trimmedReview = newReviewText.trim();

    if (!trimmedName || !trimmedReview) {
      Alert.alert('Missing Info', 'Please enter your name and review before submitting.');
      return;
    }

    try {
      setIsSubmittingReview(true);

      const { data } = await api.post('/reviews/public', {
        reviewerName: trimmedName,
        rating: newRating,
        comment: trimmedReview,
      });

      const savedReview = data?.review;
      if (savedReview) {
        const newEntry = {
          id: savedReview._id || Date.now(),
          name: savedReview.reviewerName || trimmedName,
          time: 'JUST NOW',
          text: `"${savedReview.comment || trimmedReview}"`,
          initial: (savedReview.reviewerName || trimmedName).charAt(0).toUpperCase(),
        };

        setReviewsList((prev) => [newEntry, ...prev]);
      }

      setReviewModalVisible(false);
      setNewName('');
      setNewReviewText('');
      setNewRating(5);
      Alert.alert('Thank You', 'Your review has been submitted successfully.');
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error('[LandingPage] submit review failed', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          baseURL: error.config?.baseURL,
          url: error.config?.url,
        });
      } else {
        console.error('[LandingPage] submit review failed (non-axios)', error);
      }

      Alert.alert('Submit Failed', error?.response?.data?.message || 'Could not submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const gradientLayerTwoOpacity = welcomeGradient.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 0] });
  const gradientLayerThreeOpacity = welcomeGradient.interpolate({ inputRange: [0, 0.35, 0.75, 1], outputRange: [0.65, 0, 1, 0.65] });
  const gradientDriftLarge = welcomeGradient.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-28, 28, -28] });
  const welcomeTextScale = welcomeGradient.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.09, 1] });
  const welcomeTextLift = welcomeGradient.interpolate({ inputRange: [0, 0.5, 1], outputRange: [6, -6, 6] });
  const welcomeTextRotate = welcomeGradient.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['-2deg', '2deg', '-2deg'] });
  const welcomeTitleTransform = isMobile
    ? [{ translateY: welcomeTextLift }, { rotate: welcomeTextRotate }]
    : [{ translateY: welcomeTextLift }, { scale: welcomeTextScale }, { rotate: welcomeTextRotate }];
  const animatedTextColor = textColorAnim.interpolate({
    inputRange: [0, 0.14, 0.28, 0.42, 0.56, 0.7, 0.84, 1],
    outputRange: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3', '#FF0000'],
  });

  return (
    <>
      <ScrollView ref={scrollRef} style={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.glowBlue} />
        <View style={styles.glowPurple} />

        <View style={styles.content}>
          <View style={styles.navWrap}><PublicNavbar activeRoute="home" /></View>

          <View style={[styles.welcomeBand, isMobile && styles.welcomeBandMobile]}>
            <View style={[styles.welcomeCard, isMobile && styles.welcomeCardMobile]}>
              <Animated.View style={[styles.welcomeGradientLayer, styles.welcomeGradientBase, { transform: [{ translateX: gradientDriftLarge }, { scale: 1.05 }] }]} />
              <Animated.View style={[styles.welcomeGradientLayer, styles.welcomeGradientLayerTwo, { opacity: gradientLayerTwoOpacity, transform: [{ translateX: gradientDriftLarge }, { scale: 1.08 }] }]} />
              <Animated.View style={[styles.welcomeGradientLayer, styles.welcomeGradientLayerThree, { opacity: gradientLayerThreeOpacity, transform: [{ translateX: gradientDriftLarge }, { scale: 1.12 }] }]} />
              <View style={styles.welcomeSheen} />
              <Animated.Text style={[styles.welcomeTitle, isMobile && styles.welcomeTitleMobile, isCompact && styles.welcomeTitleCompact, { transform: welcomeTitleTransform, color: animatedTextColor }]}>
                {isMobile ? <>WELCOME TO{'\n'}CAMPUSCART</> : 'WELCOME TO CAMPUSCART'}
              </Animated.Text>
            </View>
          </View>

          <View style={[styles.hero, isDesktop && styles.heroDesktop]}>
            <View style={styles.heroCopy}>
              <View style={styles.pill}>
                <Ionicons name="sparkles-outline" size={14} color="#7dd3fc" />
                <Text style={styles.pillText}>Trusted campus trading for students</Text>
              </View>
              <Text style={[styles.headline, isMobile && styles.headlineMobile, isCompact && styles.headlineCompact]}>
                Buy, sell, and chat across campus with confidence.
              </Text>
              <Text style={styles.subheadline}>
                CampusCart is the premium marketplace for college communities, combining escrow-backed safety, verified profiles, and instant messaging in one polished experience.
              </Text>
              <View style={[styles.heroButtons, isMobile && styles.heroButtonsMobile]}>
                <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/(auth)/register')}>
                  <Text style={styles.primaryButtonText}>Get Started</Text>
                  <Ionicons name="arrow-forward" size={16} color="#0a0a0a" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push('/(tabs)')}>
                  <Ionicons name="phone-portrait-outline" size={16} color="#e5e7eb" />
                  <Text style={styles.secondaryButtonText}>View Demo</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.statsRow, isMobile && styles.statsRowMobile]}>
                {stats.map((item) => (
                  <View key={item.label} style={[styles.statCard, isMobile && styles.statCardMobile]}>
                    <Text style={styles.statValue}>{item.value}</Text>
                    <Text style={styles.statLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={[styles.mockupWrap, isMobile && styles.mockupWrapMobile]}>
              <View style={styles.mockupGlow} />
              <View style={styles.mockupCard}>
                <View style={[styles.mockupTopBar, isMockupCompact && styles.mockupTopBarCompact]}>
                  <View style={styles.mockupHeaderCopy}>
                    <Text style={styles.mockupKicker}>CampusCart Dashboard</Text>
                    <Text style={[styles.mockupTitle, isMobile && styles.mockupTitleMobile]}>Student commerce at a glance</Text>
                  </View>
                  <View style={[styles.onlinePill, isMockupCompact && styles.onlinePillCompact]}>
                    <Ionicons name="people-outline" size={12} color="#a7f3d0" />
                    <Text style={styles.onlineText}>247 online</Text>
                  </View>
                </View>
                <View style={[styles.mockupGrid, isMobile && styles.mockupGridMobile]}>
                  {/* ... (Mockup cards remain same) ... */}
                  <View style={[styles.mockupLargeCard, styles.borderCard]}>
                    <View style={styles.cardHeaderRow}>
                      <View>
                        <Text style={styles.cardLabel}>Featured listing</Text>
                        <Text style={styles.cardTitle}>MacBook Air M2</Text>
                      </View>
                      <View style={styles.statusPill}><Text style={styles.statusPillText}>Escrow ready</Text></View>
                    </View>
                    <View style={styles.chartPanel}>
                      <View style={styles.chartTopRow}>
                        <View style={styles.mockupLines}>
                          <View style={styles.lineShort} />
                          <View style={styles.lineLong} />
                          <View style={styles.lineMid} />
                        </View>
                        <View style={styles.starBadge}><Ionicons name="star" size={16} color="#fbbf24" /></View>
                      </View>
                      <View style={[styles.chartBars, isMobile && styles.chartBarsMobile]}>
                        {[44, 68, 55, 82, 64].map((height, index) => (
                          <View key={index} style={styles.chartBarTrack}><View style={[styles.chartBarFill, { height: `${height}%` }]} /></View>
                        ))}
                      </View>
                    </View>
                  </View>
                  <View style={[styles.sideStack, isMobile && styles.sideStackMobile]}>
                    <View style={[styles.smallCard, styles.borderCard]}>
                      <Text style={styles.cardLabel}>Live chat</Text>
                      <View style={styles.chatBubbleRight}><Text style={styles.chatTextDark}>Is this still available?</Text></View>
                      <View style={styles.chatBubbleLeft}><Text style={styles.chatTextLight}>Yes, can meet near the library at 5 PM.</Text></View>
                    </View>
                    <View style={[styles.smallCard, styles.borderCard]}>
                      <Text style={styles.cardLabel}>Verified seller</Text>
                      <View style={styles.sellerRow}>
                        <View style={styles.avatar}><Text style={styles.avatarText}>A</Text></View>
                        <View style={styles.sellerTextBlock}>
                          <Text style={styles.sellerName}>Aarav, Computer Science</Text>
                          <Text style={styles.sellerMeta}>4.9 rating · 31 sales</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.sectionCopyCentered}>
            <Text style={styles.sectionLabel}>About CampusCart</Text>
            <Text style={styles.sectionTitleLarge}>A polished marketplace built for student life.</Text>
            <Text style={styles.sectionBodyCentered}>
              CampusCart blends the calm confidence of premium SaaS design with the practical needs of a campus marketplace, making every step from discovery to payment feel effortless.
            </Text>
          </View>

          <View style={styles.sectionHeaderCentered}>
            <Text style={styles.sectionLabel}>Features</Text>
            <Text style={styles.sectionTitleLarge}>Everything you need, built to last.</Text>
          </View>

          <View style={[styles.feature2DGrid, isTablet && styles.gridTablet, isDesktop && styles.gridDesktop]}>
            {featureCards.map((item) => (
              <FeatureCardItem key={item.title} item={item} isTablet={isTablet} isDesktop={isDesktop} />
            ))}
          </View>

          {/* Live Review & Rating Section */}
          <View style={styles.ratingSection}>
            <View style={styles.ratingHeader}>
              <View style={styles.ratingStarsRow}>
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <Ionicons key={i} name="star" size={24} color="#fbbf24" />
                ))}
              </View>
              <Text style={styles.ratingNumber}>4.9 REVIEW SCORE</Text>
              <Text style={styles.ratingSubtitle}>BASED ON {reviewsList.length} CAMPUS REVIEWS & RATINGS</Text>
              
              {/* 👇 Naya "Write a Review & Rating" Button 👇 */}
              <TouchableOpacity style={styles.writeReviewButton} onPress={() => setReviewModalVisible(true)}>
                <Ionicons name="pencil" size={14} color="#000" />
                <Text style={styles.writeReviewText}>Write a Review & Rating</Text>
              </TouchableOpacity>
              
              <View style={styles.ratingDivider} />
            </View>

            <ScrollView 
              ref={reviewsScrollRef} 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              scrollEventThrottle={16}
              scrollEnabled={Platform.OS !== 'web'} 
              contentContainerStyle={styles.reviewsScrollContent}
              onContentSizeChange={(width) => {
                reviewsLoopWidth.current = width;
              }}
            >
              {extendedReviews.map((review, index) => (
                <View key={`${review.id}-${index}`} style={styles.reviewCard}>
                  <View style={styles.reviewStarsSmall}>
                    {[1, 2, 3, 4, 5].map((_, i) => (
                      <Ionicons key={i} name="star" size={14} color="#fbbf24" />
                    ))}
                  </View>
                  <Text style={styles.reviewText}>{review.text}</Text>
                  {/* <TouchableOpacity><Text style={styles.readFullText}>READ FULL REVIEW</Text></TouchableOpacity> */}
                  <View style={styles.reviewerRow}>
                    <View style={styles.reviewerAvatar}><Text style={styles.reviewerInitial}>{review.initial}</Text></View>
                    <View>
                      <Text style={styles.reviewerName}>{review.name}</Text>
                      <Text style={styles.reviewerDate}>{review.time}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.ctaPanel}>
            <View style={styles.ctaTextBlock}>
              <Text style={styles.sectionLabelLeft}>Ready to launch</Text>
              <Text style={styles.ctaTitle}>A premium campus marketplace that feels safe, fast, and built just for you.</Text>
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.primaryButtonText}>Sign Up Now</Text>
              <Ionicons name="arrow-forward" size={16} color="#0a0a0a" />
            </TouchableOpacity>
          </View>

        </View>
        <Footer onBackToTop={() => scrollRef.current?.scrollTo({ y: 0, animated: true })} />
      </ScrollView>

      {/* 👇 NAYA: Write a Review Modal 👇 */}
      <Modal
        visible={isReviewModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Write a Review & Rating</Text>
            
            {/* Interactive Stars */}
            <View style={styles.modalStarsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setNewRating(star)}>
                  <Ionicons name={star <= newRating ? "star" : "star-outline"} size={36} color="#fbbf24" />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Your Name"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={newName}
              onChangeText={setNewName}
            />
            
            <TextInput
              style={[styles.modalInput, styles.modalInputArea]}
              placeholder="Share your thoughts about CampusCart..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              multiline
              numberOfLines={4}
              value={newReviewText}
              onChangeText={setNewReviewText}
            />

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setReviewModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSubmitBtn, isSubmittingReview && styles.modalSubmitBtnDisabled]} onPress={handleSubmitReview} disabled={isSubmittingReview}>
                <Text style={styles.modalSubmitText}>{isSubmittingReview ? 'Submitting...' : 'Submit Review & Rating'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#0A0A0A' },
  content: { paddingBottom: 0, paddingTop: 14,maxWidth: 1400, width: '100%', alignSelf: 'center', paddingHorizontal: 12 },
  glowBlue: { position: 'absolute', top: 80, right: -90, width: 240, height: 240, borderRadius: 240, backgroundColor: 'rgba(59,130,246,0.18)' },
  glowPurple: { position: 'absolute', top: 320, left: -120, width: 280, height: 280, borderRadius: 280, backgroundColor: 'rgba(124,58,237,0.14)' },
  navWrap: { paddingHorizontal: SPACING.md, marginBottom: SPACING.lg },
  welcomeBand: { width: '100%', paddingHorizontal: SPACING.md, paddingTop: 6, paddingBottom: 28, backgroundColor: '#F9FAFB' },
  welcomeBandMobile: { paddingHorizontal: 10, paddingBottom: 22 },
  welcomeCard: { width: '100%', minHeight: 190, borderRadius: 30, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', paddingHorizontal: SPACING.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)', shadowColor: '#38BDF8', shadowOffset: { width: 0, height: 18 }, shadowOpacity: 0.16, shadowRadius: 32, elevation: 8 },
  welcomeCardMobile: { minHeight: 188, paddingHorizontal: 14, borderRadius: 24 },
  welcomeGradientLayer: { position: 'absolute', top: -28, right: -40, bottom: -28, left: -40 },
  welcomeGradientBase: { backgroundColor: '#BFDBFE', ...(Platform.OS === 'web' ? { backgroundImage: 'linear-gradient(120deg, #DBEAFE 0%, #CFFAFE 35%, #DCFCE7 68%, #FDE68A 100%)', backgroundSize: '180% 180%' } as any : null) },
  welcomeGradientLayerTwo: { backgroundColor: '#FBCFE8', ...(Platform.OS === 'web' ? { backgroundImage: 'linear-gradient(135deg, #FCE7F3 0%, #E0E7FF 42%, #BAE6FD 72%, #D9F99D 100%)', backgroundSize: '200% 200%' } as any : null) },
  welcomeGradientLayerThree: { backgroundColor: '#DDD6FE', ...(Platform.OS === 'web' ? { backgroundImage: 'linear-gradient(145deg, #FDE68A 0%, #A7F3D0 32%, #BFDBFE 66%, #F5D0FE 100%)', backgroundSize: '220% 220%' } as any : null) },
  welcomeSheen: { position: 'absolute', top: 1, right: 1, bottom: 1, left: 1, borderRadius: 29, backgroundColor: 'rgba(255,255,255,0.16)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.22)' },
  welcomeTitle: { fontSize: 82, lineHeight: 88, fontWeight: '900', textAlign: 'center', letterSpacing: -6, textShadowColor: 'rgba(255,255,255,0.55)', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 16, zIndex: 10 },
  welcomeTitleMobile: { width: '100%', fontSize: 42, lineHeight: 48, letterSpacing: 0, paddingHorizontal: 4 },
  welcomeTitleCompact: { fontSize: 37, lineHeight: 43 },
  hero: { paddingHorizontal: SPACING.md, paddingTop: 28, gap: 24 },
  heroDesktop: { flexDirection: 'row', alignItems: 'center', gap: 28 },
  heroCopy: { flex: 1, minWidth: 0 },
  pill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 18 },
  pillText: { color: 'rgba(255,255,255,0.82)', fontSize: 13, fontWeight: '700' },
  headline: { color: '#fff', fontSize: 52, lineHeight: 58, fontWeight: '900', maxWidth: 640 },
  headlineMobile: { fontSize: 34, lineHeight: 40, maxWidth: 420 },
  headlineCompact: { fontSize: 30, lineHeight: 36 },
  subheadline: { marginTop: 18, color: 'rgba(255,255,255,0.68)', fontSize: 16, lineHeight: 26, maxWidth: 640 },
  heroButtons: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24, flexWrap: 'wrap' },
  heroButtonsMobile: { flexDirection: 'column', alignItems: 'stretch' },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', paddingHorizontal: 18, paddingVertical: 14, borderRadius: 999 },
  primaryButtonText: { color: '#0a0a0a', fontSize: 14, fontWeight: '800' },
  secondaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 18, paddingVertical: 14, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  secondaryButtonText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '700' },
  statsRow: { marginTop: 28, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statsRowMobile: { gap: 10 },
  statCard: { minWidth: 120, padding: 16, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  statCardMobile: { minWidth: 0, flexBasis: '48%', flexGrow: 1 },
  statValue: { color: '#fff', fontSize: 24, fontWeight: '800' },
  statLabel: { marginTop: 4, color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  mockupWrap: { flex: 1, minWidth: 0, width: '100%', minHeight: 460, justifyContent: 'center' },
  mockupWrapMobile: { minHeight: 0 },
  mockupGlow: { position: 'absolute', left: 20, right: 20, top: 20, bottom: 20, borderRadius: 36, backgroundColor: 'rgba(59,130,246,0.16)' },
  mockupCard: { width: '100%', borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 16, shadowColor: '#8b5cf6', shadowOpacity: 0.3, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 12 },
  mockupTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, minHeight: 84, padding: 14, borderRadius: 26, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.38)' },
  mockupTopBarCompact: { flexDirection: 'column', alignItems: 'flex-start', gap: 12 },
  mockupKicker: { color: 'rgba(255,255,255,0.45)', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' },
  mockupHeaderCopy: { flex: 1, minWidth: 0 },
  mockupTitle: { color: '#fff', fontSize: 18, lineHeight: 24, fontWeight: '700', marginTop: 4, flexShrink: 1 },
  mockupTitleMobile: { fontSize: 16, lineHeight: 20 },
  onlinePill: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(16,185,129,0.1)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.18)' },
  onlinePillCompact: { alignSelf: 'flex-start' },
  onlineText: { color: '#d1fae5', fontSize: 12, fontWeight: '700' },
  mockupGrid: { marginTop: 16, flexDirection: 'row', gap: 16 },
  mockupGridMobile: { flexDirection: 'column' },
  mockupLargeCard: { flex: 1.2, minHeight: 260, padding: 16, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.04)' },
  sideStack: { flex: 0.8, gap: 16 },
  sideStackMobile: { flex: undefined },
  smallCard: { padding: 16, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.04)' },
  borderCard: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' },
  cardLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 11, letterSpacing: 1.6, textTransform: 'uppercase' },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 4 },
  statusPill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: 'rgba(59,130,246,0.12)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)' },
  statusPillText: { color: '#dbeafe', fontSize: 12, fontWeight: '700' },
  chartPanel: { flex: 1, marginTop: 16, padding: 16, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  chartTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  mockupLines: { gap: 8, marginTop: 2 },
  lineShort: { width: 64, height: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)' },
  lineLong: { width: 140, height: 10, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.18)' },
  lineMid: { width: 96, height: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.12)' },
  starBadge: { width: 38, height: 38, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(251,191,36,0.12)', borderWidth: 1, borderColor: 'rgba(251,191,36,0.18)' },
  chartBars: { marginTop: 18, flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  chartBarsMobile: { gap: 8 },
  chartBarTrack: { flex: 1, height: 160, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.06)', padding: 5, justifyContent: 'flex-end' },
  chartBarFill: { width: '100%', borderRadius: 999, backgroundColor: '#60a5fa' },
  chatBubbleRight: { marginTop: 14, alignSelf: 'flex-end', maxWidth: '85%', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 18, borderTopRightRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  chatBubbleLeft: { marginTop: 10, alignSelf: 'flex-start', maxWidth: '90%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 18, borderTopLeftRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
  chatTextDark: { color: '#0f172a', fontSize: 13, fontWeight: '600' },
  chatTextLight: { color: '#e5e7eb', fontSize: 13, lineHeight: 19 },
  sellerRow: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 16, backgroundColor: 'rgba(125,211,252,0.18)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#7dd3fc', fontSize: 16, fontWeight: '800' },
  sellerName: { color: '#fff', fontSize: 14, fontWeight: '700', flexShrink: 1 },
  sellerTextBlock: { flex: 1, minWidth: 0 },
  sellerMeta: { color: 'rgba(255,255,255,0.58)', fontSize: 12, marginTop: 3 },
  sectionCopyCentered: { paddingHorizontal: SPACING.md, marginTop: 56, alignItems: 'center', justifyContent: 'center' },
  sectionHeaderCentered: { paddingHorizontal: SPACING.md, marginTop: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  sectionLabel: { color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: 3, fontSize: 16, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  sectionLabelLeft: { color: '#7dd3fc', textTransform: 'uppercase', letterSpacing: 3, fontSize: 14, fontWeight: '800', marginBottom: 10 },
  sectionTitleLarge: { color: '#fff', fontSize: 38, lineHeight: 46, fontWeight: '800', maxWidth: 800, textAlign: 'center' },
  sectionBodyCentered: { marginTop: 16, color: 'rgba(255,255,255,0.68)', fontSize: 16, lineHeight: 26, maxWidth: 720, textAlign: 'center' },
  feature2DGrid: { paddingHorizontal: SPACING.md, marginTop: 24, flexDirection: 'row', flexWrap: 'wrap', gap: 16, width: '100%' },
  gridTablet: {},
  gridDesktop: { gap: 20 },
  gridFeatureCard: { backgroundColor: '#121214', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 28, padding: 24, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', minHeight: 220, overflow: 'hidden', transitionProperty: 'all', transitionDuration: '300ms' },
  gridFeatureCardHovered: { borderColor: 'rgba(56, 189, 248, 0.4)', backgroundColor: '#18181b', transform: [{ translateY: -4 }], shadowColor: '#3b82f6', shadowOpacity: 0.1, shadowRadius: 20, elevation: 8 },
  cardTablet: { width: `${100 / 2}%`, flexGrow: 1, flexBasis: '47%' },
  cardDesktop: { width: `${100 / 4}%`, flexGrow: 1, flexBasis: '23%' },
  watermarkGlow: { position: 'absolute', right: -40, bottom: -40, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(37,99,235,0.0)', opacity: 0, transitionProperty: 'opacity', transitionDuration: '300ms' },
  watermarkGlowActive: { backgroundColor: 'rgba(37,99,235,0.12)', opacity: 1, shadowColor: '#3b82f6', shadowOpacity: 1, shadowRadius: 30 },
  featureHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 20, zIndex: 2 },
  featureIconWrap: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#18181b', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', transitionProperty: 'all', transitionDuration: '300ms' },
  featureIconWrapActive: { borderColor: 'rgba(56, 189, 248, 0.3)', backgroundColor: '#1e1e24' },
  featureTextContainer: { gap: 6, width: '100%', zIndex: 2 },
  featureTitle: { color: '#fff', fontSize: 19, fontWeight: '800', transitionProperty: 'color', transitionDuration: '300ms' },
  featureTitleActive: { color: '#e0f2fe' },
  featureDescription: { color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 22 },

  // Rating Section
  ratingSection: { marginTop: 80, width: '100%' },
  ratingHeader: { alignItems: 'center', marginBottom: 30 },
  ratingStarsRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  ratingNumber: { color: '#fff', fontSize: 34, fontWeight: '900', letterSpacing: -1 },
  ratingSubtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: '700', letterSpacing: 2, marginTop: 6 },
  
  // Write Review Button
  writeReviewButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fbbf24', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, marginTop: 16 },
  writeReviewText: { color: '#000', fontSize: 13, fontWeight: '800' },
  
  ratingDivider: { width: 60, height: 2, backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 24, borderRadius: 2 },
  reviewsScrollContent: { paddingHorizontal: SPACING.md, gap: 16, paddingBottom: 20 },
  reviewCard: { width: 320, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 24, padding: 24 },
  reviewStarsSmall: { flexDirection: 'row', gap: 2, marginBottom: 16 },
  reviewText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, lineHeight: 24, fontStyle: 'italic', minHeight: 100 },
  readFullText: { color: '#fbbf24', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginTop: 12 },
  reviewerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 24 },
  reviewerAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#fbbf24', alignItems: 'center', justifyContent: 'center' },
  reviewerInitial: { color: '#000', fontSize: 18, fontWeight: '900' },
  reviewerName: { color: '#fff', fontSize: 15, fontWeight: '700' },
  reviewerDate: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2, textTransform: 'uppercase' },

  ctaPanel: { marginHorizontal: SPACING.md, marginTop: 64, marginBottom: 60, borderRadius: 28, padding: 24, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
  ctaTextBlock: { flex: 1, minWidth: 240 },
  ctaTitle: { color: '#fff', fontSize: 24, lineHeight: 32, fontWeight: '800', maxWidth: 650 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', maxWidth: 450, backgroundColor: '#121214', borderRadius: 28, padding: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 30, elevation: 10 },
  modalTitle: { color: '#fff', fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 20 },
  modalStarsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 24 },
  modalInput: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, color: '#fff', fontSize: 15, marginBottom: 16 },
  modalInputArea: { minHeight: 100, textAlignVertical: 'top' },
  modalButtonsRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalCancelBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', paddingVertical: 14, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  modalCancelText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  modalSubmitBtn: { flex: 1, backgroundColor: '#fbbf24', paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
  modalSubmitBtnDisabled: { opacity: 0.6 },
  modalSubmitText: { color: '#000', fontWeight: '800', fontSize: 15 },
});
