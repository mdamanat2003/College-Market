import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import axios from 'axios';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, RADIUS, SPACING } from '../../theme/colors';
import { api, SOCKET_URL } from '../../services/api';
import { OoplabdhLogo } from '../brand/OoplabdhLogo';

type FooterProps = {
  onBackToTop?: () => void;
};

const INFO_CONTENT = {
  faq: {
    title: 'Frequently Asked Questions',
    content: [
      { q: 'How do I buy an item on Ooplabdh?', a: 'Browse the marketplace, click on the item you want, and use the "Chat" button to message the seller directly to coordinate and arrange a meeting.' },
      { q: 'How do I upload pyqs, notes or syllabus?', a: 'Go to the "PyQ & Notes" tab, click on "Add Document", select your PDF file or upload images, fill in the metadata, and publish.' },
      { q: 'Are transactions handled online?', a: 'Ooplabdh facilitates peer-to-peer campus trading. Payments are coordinated directly between the buyer and seller in person or via UPI during the meetup.' },
      { q: 'What is the "Lost & Found" section?', a: 'If you lost an item on campus or found someone\'s belongings, you can post details there so campus peers can contact you to return it.' }
    ]
  },
  privacy: {
    title: 'Privacy Policy',
    text: `Your privacy is extremely important to us.

1. Information We Collect: We only request essential credentials like your name, college email address, and profile picture to ensure a verified campus environment.

2. Use of Information: We use this data to authenticate students, display listings, and facilitate chat messaging.

3. Third-party Sharing: We do not sell, trade, or share your personal data with any external advertising agencies or third-party vendors.

4. Security: All messages and transactions are stored securely, and auth tokens are encrypted locally on your device.`
  },
  terms: {
    title: 'Terms of Service',
    text: `Welcome to Ooplabdh. By using our platform, you agree to:

1. Student Status: You must be a verified student of the college to list items or chat.

2. Acceptable Listings: All product listings, note uploads, and fest posts must comply with campus regulations. Selling drugs, weapons, or plagiarized content is strictly prohibited.

3. Behavior: Bullying, harassment, or spamming in the chat is forbidden and will lead to immediate account suspension.

4. Liability: Transactions are peer-to-peer. Ooplabdh is not liable for defective items or transaction disputes. Inspect items thoroughly before paying.`
  },
  safety: {
    title: 'Safety Tips',
    text: `To ensure a safe trading experience on campus, please follow these guidelines:

1. Public Meetups: Always meet the other party in highly crowded, well-lit public campus locations (e.g. main library entrance, student canteen, or main gates).

2. Inspect First: Thoroughly examine the product (condition, functionality) or note files before sending any payment.

3. Payment Safety: Prefer secure instant transfer methods like UPI (e.g., GPay, PhonePe) once you have verified the item. Avoid advance payments.

4. Report Suspicious Activity: If a user acts suspiciously or requests meeting outside campus grounds at night, report them immediately to admin support.`
  }
};

export default function Footer({ onBackToTop }: FooterProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [isReviewVisible, setIsReviewVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const [infoModalType, setInfoModalType] = useState<'faq' | 'privacy' | 'terms' | 'safety' | null>(null);

  const isTabletOrDesktop = width >= 768;

  const scrollToTop = () => {
    if (onBackToTop) {
      onBackToTop();
      return;
    }

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.documentElement.scrollTo?.({ top: 0, behavior: 'smooth' });
      document.body.scrollTo?.({ top: 0, behavior: 'smooth' });
    }
  };

  const getApkDownloadUrl = () => {
    const envApkUrl = process.env.EXPO_PUBLIC_APK_DOWNLOAD_URL?.trim();
    if (envApkUrl) return envApkUrl;

    const rawSocket = SOCKET_URL?.trim() || '';
    let host = rawSocket ? rawSocket.replace(/\/$/, '') : '';

    if (!host || host === 'null' || host.startsWith('/')) {
      if (typeof window !== 'undefined' && !/localhost|127\.0\.0\.1/.test(window.location.hostname)) {
        host = 'https://college-market-ahrs.onrender.com';
      } else if (typeof window !== 'undefined') {
        host = window.location.origin;
      }
    }

    const cleanHost = (host || '').replace(/\/$/, '');
    return cleanHost ? `${cleanHost}/uploads/app-release.apk` : 'https://college-market-ahrs.onrender.com/uploads/app-release.apk';
  };

  const handleInstallApp = () => {
    const apkUrl = getApkDownloadUrl();

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.href = apkUrl;
    } else {
      Linking.openURL(apkUrl).catch((err) => {
        console.error('[Footer] Failed to open APK download link', err);
        Alert.alert('Download Error', 'Could not open the download link. Please try again.');
      });
    }
  };

  const submitReview = async () => {
    const trimmedName = reviewName.trim();
    const trimmedReview = reviewText.trim();

    if (!trimmedName || !trimmedReview) {
      Alert.alert('Missing Info', 'Please enter your name and review before submitting.');
      return;
    }

    try {
      setIsSubmittingReview(true);

      await api.post('/reviews/public', {
        reviewerName: trimmedName,
        rating: reviewRating,
        comment: trimmedReview,
      });

      setIsReviewVisible(false);
      setReviewRating(5);
      setReviewName('');
      setReviewText('');
      Alert.alert('Thank you!', 'Your review and rating have been submitted.');
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        console.error('[Footer] submit review failed', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
          baseURL: error.config?.baseURL,
          url: error.config?.url,
        });
      } else {
        console.error('[Footer] submit review failed (non-axios)', error);
      }

      Alert.alert('Submit Failed', error?.response?.data?.message || 'Could not submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <>
      <View style={styles.footerContainer}>
        {/* Main Grid Row / Stack */}
        <View style={[styles.mainRow, isTabletOrDesktop ? styles.rowDesktop : styles.rowMobile]}>
          
          {/* Column 1: Logo, Tagline, Social Icons */}
          <View style={[styles.column, styles.columnBrand]}>
            <OoplabdhLogo size="sm" style={styles.logoStyle} />
            <Text style={styles.tagline}>
              The ultimate peer-to-peer campus marketplace & academic resource hub. Buy, sell, share notes, find lost items, and catch up on campus events.
            </Text>
            <View style={styles.socialRow}>
              <TouchableOpacity 
                style={[styles.socialIcon, hoveredLink === 'fb' && styles.socialIconHovered]} 
                activeOpacity={0.7}
                {...{
                  onMouseEnter: () => setHoveredLink('fb'),
                  onMouseLeave: () => setHoveredLink(null)
                } as any}
              >
                <Ionicons name="logo-facebook" size={20} color={hoveredLink === 'fb' ? COLORS.primary : COLORS.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.socialIcon, hoveredLink === 'ig' && styles.socialIconHovered]} 
                activeOpacity={0.7}
                {...{
                  onMouseEnter: () => setHoveredLink('ig'),
                  onMouseLeave: () => setHoveredLink(null)
                } as any}
              >
                <Ionicons name="logo-instagram" size={20} color={hoveredLink === 'ig' ? COLORS.primary : COLORS.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.socialIcon, hoveredLink === 'tw' && styles.socialIconHovered]} 
                activeOpacity={0.7}
                {...{
                  onMouseEnter: () => setHoveredLink('tw'),
                  onMouseLeave: () => setHoveredLink(null)
                } as any}
              >
                <Ionicons name="logo-twitter" size={20} color={hoveredLink === 'tw' ? COLORS.primary : COLORS.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.socialIcon, hoveredLink === 'git' && styles.socialIconHovered]} 
                activeOpacity={0.7}
                {...{
                  onMouseEnter: () => setHoveredLink('git'),
                  onMouseLeave: () => setHoveredLink(null)
                } as any}
              >
                <Ionicons name="logo-github" size={20} color={hoveredLink === 'git' ? COLORS.primary : COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Column 2: Quick Links */}
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Quick Links</Text>
            <TouchableOpacity 
              style={styles.linkItem} 
              onPress={() => router.push('/about')} 
              activeOpacity={0.7}
              {...{
                onMouseEnter: () => setHoveredLink('about'),
                onMouseLeave: () => setHoveredLink(null)
              } as any}
            >
              <Text style={[styles.linkText, hoveredLink === 'about' && styles.linkTextHovered]}>About Us</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.linkItem} 
              onPress={() => router.push('/home')} 
              activeOpacity={0.7}
              {...{
                onMouseEnter: () => setHoveredLink('features'),
                onMouseLeave: () => setHoveredLink(null)
              } as any}
            >
              <Text style={[styles.linkText, hoveredLink === 'features' && styles.linkTextHovered]}>Features</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.linkItem} 
              onPress={() => router.push('/contact')} 
              activeOpacity={0.7}
              {...{
                onMouseEnter: () => setHoveredLink('contact'),
                onMouseLeave: () => setHoveredLink(null)
              } as any}
            >
              <Text style={[styles.linkText, hoveredLink === 'contact' && styles.linkTextHovered]}>Contact Us</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.linkItem} 
              onPress={() => setIsReviewVisible(true)} 
              activeOpacity={0.7}
              {...{
                onMouseEnter: () => setHoveredLink('review'),
                onMouseLeave: () => setHoveredLink(null)
              } as any}
            >
              <Text style={[styles.linkText, hoveredLink === 'review' && styles.linkTextHovered]}>Submit Review</Text>
            </TouchableOpacity>
            {Platform.OS === 'web' && (
              <TouchableOpacity 
                style={styles.linkItem} 
                onPress={handleInstallApp} 
                activeOpacity={0.7}
                {...{
                  onMouseEnter: () => setHoveredLink('install-app'),
                  onMouseLeave: () => setHoveredLink(null)
                } as any}
              >
                <Text style={[styles.linkText, hoveredLink === 'install-app' && styles.linkTextHovered]}>Install App</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Column 3: Legal & Support */}
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Legal & Support</Text>
            <TouchableOpacity 
              style={styles.linkItem} 
              onPress={() => router.push('/faq')} 
              activeOpacity={0.7}
              {...{
                onMouseEnter: () => setHoveredLink('faq'),
                onMouseLeave: () => setHoveredLink(null)
              } as any}
            >
              <Text style={[styles.linkText, hoveredLink === 'faq' && styles.linkTextHovered]}>FAQ</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.linkItem} 
              onPress={() => router.push('/privacy')} 
              activeOpacity={0.7}
              {...{
                onMouseEnter: () => setHoveredLink('privacy'),
                onMouseLeave: () => setHoveredLink(null)
              } as any}
            >
              <Text style={[styles.linkText, hoveredLink === 'privacy' && styles.linkTextHovered]}>Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.linkItem} 
              onPress={() => router.push('/terms')} 
              activeOpacity={0.7}
              {...{
                onMouseEnter: () => setHoveredLink('terms'),
                onMouseLeave: () => setHoveredLink(null)
              } as any}
            >
              <Text style={[styles.linkText, hoveredLink === 'terms' && styles.linkTextHovered]}>Terms of Service</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.linkItem} 
              onPress={() => router.push('/safety')} 
              activeOpacity={0.7}
              {...{
                onMouseEnter: () => setHoveredLink('safety'),
                onMouseLeave: () => setHoveredLink(null)
              } as any}
            >
              <Text style={[styles.linkText, hoveredLink === 'safety' && styles.linkTextHovered]}>Safety Tips</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Divider Line */}
        <View style={styles.divider} />

        {/* Bottom Bar: Copyright & Back to Top */}
        <View style={[styles.bottomBar, isTabletOrDesktop ? styles.bottomBarDesktop : styles.bottomBarMobile]}>
          {isTabletOrDesktop && <View style={{ flex: 1 }} />}
          
          <Text style={[styles.copyrightText, isTabletOrDesktop && { flex: 2, textAlign: 'center' }]}>
            © 2026 Ooplabdh. All rights reserved. Made for campus students.
          </Text>
          
          <View style={isTabletOrDesktop ? { flex: 1, alignItems: 'flex-end', width: '100%' } : { width: '100%', alignItems: 'center' }}>
            <TouchableOpacity 
              style={[styles.backToTopButton, hoveredLink === 'backtotop' && styles.backToTopButtonHovered]} 
              onPress={scrollToTop} 
              activeOpacity={0.7}
              {...{
                onMouseEnter: () => setHoveredLink('backtotop'),
                onMouseLeave: () => setHoveredLink(null)
              } as any}
            >
              <Text style={[styles.backToTopText, hoveredLink === 'backtotop' && styles.backToTopTextHovered]}>Back to Top</Text>
              <Ionicons name="arrow-up" size={14} color={hoveredLink === 'backtotop' ? COLORS.primary : COLORS.accent} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Review Modal */}
      <Modal
        visible={isReviewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsReviewVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Review Ooplabdh</Text>
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                  <Ionicons
                    name={star <= reviewRating ? 'star' : 'star-outline'}
                    size={34}
                    color="#FBBF24"
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Your name"
              placeholderTextColor="#94A3B8"
              value={reviewName}
              onChangeText={setReviewName}
            />
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Share your review"
              placeholderTextColor="#94A3B8"
              multiline
              value={reviewText}
              onChangeText={setReviewText}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsReviewVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.submitButton, isSubmittingReview && styles.submitButtonDisabled]} onPress={submitReview} disabled={isSubmittingReview}>
                <Text style={styles.submitButtonText}>{isSubmittingReview ? 'Submitting...' : 'Submit Review'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Informational Modal */}
      <Modal
        visible={infoModalType !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoModalType(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.infoModalContent}>
            <View style={styles.infoModalHeader}>
              <Text style={styles.infoModalTitle}>
                {infoModalType ? INFO_CONTENT[infoModalType].title : ''}
              </Text>
              <TouchableOpacity onPress={() => setInfoModalType(null)} style={styles.infoModalClose}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.infoModalScroll} contentContainerStyle={styles.infoModalScrollContent}>
              {infoModalType === 'faq' ? (
                INFO_CONTENT.faq.content.map((item, idx) => (
                  <View key={idx} style={styles.faqBlock}>
                    <Text style={styles.faqQuestion}>Q: {item.q}</Text>
                    <Text style={styles.faqAnswer}>{item.a}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.infoModalText}>
                  {infoModalType ? INFO_CONTENT[infoModalType].text : ''}
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    paddingTop: 56,
    paddingBottom: 32,
    paddingHorizontal: 28,
    alignSelf: 'stretch',
    marginTop: 0,
    ...Platform.select({
      web: {
        width: '100vw',
        position: 'relative',
        left: '50%',
        marginLeft: '-50vw',
        boxSizing: 'border-box',
      } as any,
    }),
  },
  mainRow: {
    maxWidth: 1440,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'space-between',
    gap: 36,
  },
  rowDesktop: {
    flexDirection: 'row',
  },
  rowMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  column: {
    flex: 1,
    minWidth: 180,
  },
  columnBrand: {
    flex: 1.5,
  },
  logoStyle: {
    paddingLeft: 0,
    paddingVertical: 0,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.textMuted,
    lineHeight: 22,
    marginBottom: 16,
    maxWidth: 360,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIconHovered: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  linkItem: {
    marginBottom: 12,
  },
  linkText: {
    fontSize: 14,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  linkTextHovered: {
    color: COLORS.primary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    width: '100%',
    maxWidth: 1440,
    alignSelf: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  bottomBar: {
    maxWidth: 1440,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  bottomBarDesktop: {
    flexDirection: 'row',
  },
  bottomBarMobile: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  backToTopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backToTopButtonHovered: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
  },
  backToTopText: {
    fontSize: 13,
    color: COLORS.text,
    fontWeight: '600',
  },
  backToTopTextHovered: {
    color: COLORS.primary,
  },
  // Modal Common Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(9, 9, 11, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(8px)',
      } as any,
    }),
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 24,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 18,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 18,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 15,
    marginBottom: 12,
  },
  modalTextArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontWeight: '700',
  },
  submitButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: COLORS.background,
    fontWeight: '800',
  },
  // Info Modals specific styles
  infoModalContent: {
    width: '100%',
    maxWidth: 550,
    maxHeight: '80%',
    borderRadius: 18,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
    overflow: 'hidden',
  },
  infoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 16,
    marginBottom: 16,
  },
  infoModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  infoModalClose: {
    padding: 4,
  },
  infoModalScroll: {
    flex: 1,
  },
  infoModalScrollContent: {
    paddingBottom: 24,
  },
  infoModalText: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 22,
  },
  faqBlock: {
    marginBottom: 20,
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: 6,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 20,
  },
});
