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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { COLORS, SPACING } from '../../theme/colors';
import { api } from '../../services/api';

type FooterProps = {
  onBackToTop?: () => void;
};

export default function Footer({ onBackToTop }: FooterProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isPhone = width <= 480;
  const [isReviewVisible, setIsReviewVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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
      <View style={[styles.footer, isPhone && styles.phoneFooter]}>
        <Text style={styles.footerText}>Ooplabdh 2026. All rights reserved.</Text>

        <View style={[styles.footerLinks, isPhone && styles.phoneFooterLinks]}>
          <TouchableOpacity style={styles.footerLinkButton} onPress={() => router.push('/about')}>
            <Text style={styles.footerLink}>About</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerLinkButton} onPress={() => router.push('/home')}>
            <Text style={styles.footerLink}>Features</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerLinkButton} onPress={() => router.push('/contact')}>
            <Text style={styles.footerLink}>Contact</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerLinkButton} onPress={() => setIsReviewVisible(true)}>
            <Text style={styles.footerLink}>Review</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerLinkButton} onPress={scrollToTop}>
            <Text style={styles.footerLink}>Back to top</Text>
          </TouchableOpacity>
        </View>
      </View>

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
    </>
  );
}

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 42,
    paddingBottom: 42, // Content ke hisab se padding
    marginBottom: 0,   // 👈 Niche ka koi bhi default margin khatam karne ke liye
    backgroundColor: COLORS.card,
  },
  phoneFooter: {
    paddingTop: 40,
    paddingBottom: 39,
  },
  footerText: {
    color: '#CBD5E1',
    fontSize: 15,
    textAlign: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 22,
    marginTop: 8,
  },
  phoneFooterLinks: {
    columnGap: 20,
    rowGap: 8,
  },
  footerLinkButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  footerLink: {
    color: '#CBD5E1',
    fontSize: 15,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 18,
    backgroundColor: COLORS.card,
    padding: 22,
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
    color: '#fff',
    fontWeight: '800',
  },
});
