import React, { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Pressable,
} from 'react-native';

import Footer from '../components/layout/Footer';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { COLORS, RADIUS, SPACING } from '../theme/colors';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  items: FAQItem[];
}

const FAQ_DATA: FAQCategory[] = [
  {
    title: 'General & Account',
    icon: 'school-outline',
    items: [
      {
        id: 'ga-1',
        question: 'Who can use Ooplabdh?',
        answer: 'Ooplabdh is an exclusive platform built for college students. To ensure a safe and scam-free environment, every user must go through a strict email and phone OTP verification process. No outsiders are allowed.',
      },
      {
        id: 'ga-2',
        question: 'I am not receiving my registration OTP. What should I do?',
        answer: 'Please check your Spam or Junk folder. To maintain platform security and prevent spam, we have a 60-second cooldown period between OTP requests. If it fails, please wait a minute and try again.',
      },
      {
        id: 'ga-3',
        question: 'How do I update my profile or change my avatar?',
        answer: 'You can update your full name, phone number, college details, and upload a new profile picture (avatar) directly from the "Edit Profile" section in your account dashboard.',
      },
    ],
  },
  {
    title: 'Buying & Selling',
    icon: 'cart-outline',
    items: [
      {
        id: 'bs-1',
        question: 'What kind of items can I buy or sell here?',
        answer: 'You can trade any college essential! This includes academic reference books, lab equipment (drafters, aprons, scientific calculators), hostel electronics, and even class notes.',
      },
      {
        id: 'bs-2',
        question: 'How do I contact a seller?',
        answer: "You don't need to share your personal WhatsApp number. Simply use our secure, real-time in-app chat to message the seller, negotiate the price, and fix a meeting spot on campus.",
      },
      {
        id: 'bs-3',
        question: 'How long does my product listing stay active?',
        answer: 'Your listing stays active until you mark it as "Sold" or delete it from your dashboard. We recommend updating your listings regularly to attract more buyers.',
      },
    ],
  },
  {
    title: 'Trust, Safety & Payments',
    icon: 'shield-checkmark-outline',
    items: [
      {
        id: 'ts-1',
        question: 'Is my payment safe? How should I pay?',
        answer: 'We strongly advise against paying any money upfront. Use our platform to finalize the deal, meet the seller in person at a safe campus location (like the canteen or hostel gate), inspect the item, and then make the payment via UPI or cash.',
      },
      {
        id: 'ts-2',
        question: 'Will my phone number or email be visible to everyone?',
        answer: 'No, your privacy is our priority. Your contact details are hidden from public view. All negotiations and communications happen securely within our encrypted in-app chat.',
      },
      {
        id: 'ts-3',
        question: 'What should I do if I spot a fake listing or a suspicious user?',
        answer: 'We have zero tolerance for scams. If you suspect any fraudulent activity, use the "Report User" button on their profile or listing. Our admin team will investigate and block the user immediately.',
      },
    ],
  },
  {
    title: 'Technical Help',
    icon: 'construct-outline',
    items: [
      {
        id: 'th-1',
        question: 'How does the Wishlist work?',
        answer: 'If you like a product but want to buy it later, just tap the heart icon to add it to your Wishlist. The seller will instantly receive a notification that someone is interested in their item!',
      },
      {
        id: 'th-2',
        question: "I can't find my college in the filter list. What now?",
        answer: 'If your campus is not listed yet, please drop us an email through the "Contact Us" page. We are continuously verifying and adding new colleges to our network.',
      },
    ],
  },
];

export default function FAQ() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const isWide = width >= 900;
  const isTablet = width >= 640;
  const isTiny = width < 390;

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Filter FAQs based on search query
  const filteredFAQ = FAQ_DATA.map((category) => {
    const items = category.items.filter(
      (item) =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...category, items };
  }).filter((category) => category.items.length > 0);

  return (
    <ScrollView ref={scrollRef} style={styles.page} showsVerticalScrollIndicator={false}>
      {/* Ambient background glows */}
      <View style={styles.glowBlue} />
      <View style={styles.glowMint} />

      <View style={styles.content}>
        <PublicNavbar activeRoute="faq" />

        {/* Hero Header Section */}
        <View style={styles.heroSection}>
          <View style={styles.pill}>
            <Ionicons name="help-circle" size={14} color={COLORS.accent} />
            <Text style={styles.pillText}>Frequently Asked Questions</Text>
          </View>
          <Text style={[styles.heroTitle, isTiny && styles.heroTitleTiny]}>
            Got Questions?{'\n'}We've Got Answers.
          </Text>
          <Text style={styles.heroBody}>
            Find quick answers to general queries, buying and selling guidelines, security practices, and technical troubleshooting on Ooplabdh.
          </Text>

          {/* Search Bar */}
          <View style={[styles.searchBar, isTablet && styles.searchBarTablet]}>
            <Ionicons name="search-outline" size={20} color={COLORS.textMuted} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search FAQ by keywords..."
              placeholderTextColor={COLORS.textMuted}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                // Auto-expand items when searching to make answers visible immediately
                if (text.trim().length > 0) {
                  const autoExpanded: Record<string, boolean> = {};
                  FAQ_DATA.forEach((cat) => {
                    cat.items.forEach((item) => {
                      if (
                        item.question.toLowerCase().includes(text.toLowerCase()) ||
                        item.answer.toLowerCase().includes(text.toLowerCase())
                      ) {
                        autoExpanded[item.id] = true;
                      }
                    });
                  });
                  setExpandedItems(autoExpanded);
                }
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* FAQ Accordion Section */}
        <View style={styles.faqContainer}>
          {filteredFAQ.length === 0 ? (
            <View style={styles.noResultsCard}>
              <Ionicons name="search-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.noResultsTitle}>No results found</Text>
              <Text style={styles.noResultsSub}>We couldn't find any answers matching "{searchQuery}". Try different keywords.</Text>
            </View>
          ) : (
            filteredFAQ.map((category) => (
              <View key={category.title} style={styles.categorySection}>
                {/* Category Header */}
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryIconWrap}>
                    <Ionicons name={category.icon} size={20} color={COLORS.accent} />
                  </View>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                </View>

                {/* Accordion Cards */}
                <View style={styles.accordionList}>
                  {category.items.map((item) => {
                    const isExpanded = !!expandedItems[item.id];
                    return (
                      <View
                        key={item.id}
                        style={[
                          styles.faqCard,
                          isExpanded && styles.faqCardExpanded,
                        ]}
                      >
                        <Pressable
                          style={styles.faqHeader}
                          onPress={() => toggleExpand(item.id)}
                        >
                          <Text style={[styles.faqQuestion, isExpanded && styles.faqQuestionExpanded]}>
                            {item.question}
                          </Text>
                          <Ionicons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={18}
                            color={isExpanded ? COLORS.accent : COLORS.textMuted}
                            style={styles.chevron}
                          />
                        </Pressable>

                        {isExpanded && (
                          <View style={styles.faqBody}>
                            <Text style={styles.faqAnswer}>{item.answer}</Text>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Contact Banner Section */}
        <View style={[styles.contactBanner, isWide && styles.contactBannerWide]}>
          <View style={styles.contactInfo}>
            <Text style={styles.contactTitle}>Still have questions?</Text>
            <Text style={styles.contactBody}>
              If you couldn't find the answers you're looking for, or if your college isn't listed yet, please get in touch with us!
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.contactButton, pressed && styles.buttonPressed]}
            onPress={() => router.push('/contact')}
          >
            <Text style={styles.contactButtonText}>Contact Support</Text>
            <Ionicons name="mail-outline" size={16} color={COLORS.background} />
          </Pressable>
        </View>
      </View>

      <Footer onBackToTop={() => scrollRef.current?.scrollTo({ y: 0, animated: true })} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.background,
    position: 'relative',
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: 0,
    gap: SPACING.xl,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  glowBlue: {
    position: 'absolute',
    top: 50,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(59, 130, 246, 0.06)',
  },
  glowMint: {
    position: 'absolute',
    top: 300,
    left: -110,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
  },
  heroSection: {
    alignItems: 'center',
    textAlign: 'center',
    marginTop: SPACING.md,
    gap: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.round,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  pillText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  heroTitle: {
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '900',
    color: COLORS.primary,
    textAlign: 'center',
  },
  heroTitleTiny: {
    fontSize: 28,
    lineHeight: 34,
  },
  heroBody: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textMuted,
    textAlign: 'center',
    maxWidth: 600,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 14,
    height: 52,
    width: '100%',
    maxWidth: 500,
    marginTop: SPACING.md,
  },
  searchBarTablet: {
    height: 56,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: COLORS.text,
    fontSize: 15,
  },
  clearButton: {
    padding: 4,
  },
  faqContainer: {
    width: '100%',
    gap: SPACING.lg,
  },
  categorySection: {
    gap: SPACING.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  categoryIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  accordionList: {
    gap: 10,
  },
  faqCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  faqCardExpanded: {
    borderColor: 'rgba(56, 189, 248, 0.3)',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 16,
    gap: 12,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    lineHeight: 20,
  },
  faqQuestionExpanded: {
    color: COLORS.accent,
  },
  chevron: {
    flexShrink: 0,
  },
  faqBody: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 12,
  },
  faqAnswer: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textMuted,
  },
  noResultsCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 8,
  },
  noResultsSub: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 20,
  },
  contactBanner: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 16,
    marginTop: SPACING.md,
  },
  contactBannerWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 32,
  },
  contactInfo: {
    flex: 1,
    gap: 6,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  contactBody: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textMuted,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.accent,
    alignSelf: 'stretch',
    minWidth: 160,
  },
  contactButtonText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.85,
  },
});
