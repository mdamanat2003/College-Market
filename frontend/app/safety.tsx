import React, { useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import Footer from '../components/layout/Footer';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { COLORS, RADIUS, SPACING } from '../theme/colors';

export default function SafetyTips() {
  const scrollRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const isTiny = width < 390;

  return (
    <ScrollView ref={scrollRef} style={styles.page} showsVerticalScrollIndicator={false}>
      {/* Ambient background glows */}
      <View style={styles.glowBlue} />
      <View style={styles.glowMint} />

      <View style={styles.content}>
        <PublicNavbar activeRoute="about" />

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.pill}>
            <Ionicons name="shield-half" size={14} color={COLORS.accent} />
            <Text style={styles.pillText}>Trust & Safety Guidelines</Text>
          </View>
          <Text style={[styles.heroTitle, isTiny && styles.heroTitleTiny]}>
            Your Safety is{'\n'}Our Priority.
          </Text>
          <Text style={styles.heroBody}>
            Ooplabdh is an exclusive, verified community for college students. While we work hard to keep scammers out, being a smart buyer and seller is your best defense. Follow these safety tips for a smooth and secure campus trading experience.
          </Text>
        </View>

        {/* Content Section */}
        <View style={styles.policyCard}>
          {/* Section 1: The Golden Rules */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🌟 The Golden Rules (For Everyone)</Text>
            </View>
            <View style={styles.bulletList}>
              <View style={[styles.bulletItem, styles.highlightBox]}>
                <Ionicons name="cash-outline" size={18} color={COLORS.warning} style={styles.boxIcon} />
                <View style={styles.boxContent}>
                  <Text style={styles.boldText}>Never Pay Upfront</Text>
                  <Text style={styles.boxText}>Avoid transferring money before physically receiving and inspecting the item.</Text>
                </View>
              </View>

              <View style={[styles.bulletItem, styles.highlightBox]}>
                <Ionicons name="people-outline" size={18} color={COLORS.accent} style={styles.boxIcon} />
                <View style={styles.boxContent}>
                  <Text style={styles.boldText}>Meet in Public</Text>
                  <Text style={styles.boxText}>Always choose a safe, populated, and well-lit area on campus for the exchange (e.g., College Canteen, Library Cafe, or Hostel Main Gate).</Text>
                </View>
              </View>

              <View style={[styles.bulletItem, styles.highlightBox]}>
                <Ionicons name="chatbubbles-outline" size={18} color={COLORS.success} style={styles.boxIcon} />
                <View style={styles.boxContent}>
                  <Text style={styles.boldText}>Keep Chats on Ooplabdh</Text>
                  <Text style={styles.boxText}>Do not share your personal phone number or move the conversation to WhatsApp/Telegram until you absolutely trust the other person. Our in-app chat is secure and designed for your privacy.</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Section 2: Safety Tips for Buyers */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛍️ Safety Tips for Buyers</Text>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Ionicons name="eye-outline" size={18} color={COLORS.accent} style={styles.bulletCheck} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>Inspect Before You Accept: </Text>
                  Check the condition of the book, calculator, or electronic device thoroughly before making the payment. Turn on electronics to ensure they work.
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="alert-circle-outline" size={18} color={COLORS.warning} style={styles.bulletCheck} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>Beware of "Too Good to Be True": </Text>
                  If a brand-new scientific calculator is being sold for ₹100, it’s likely a scam or a damaged product. Ask questions if the price seems suspiciously low.
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="card-outline" size={18} color={COLORS.accent} style={styles.bulletCheck} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>Verify UPI Details: </Text>
                  When making a digital payment, ensure the name on the UPI app matches the seller's name or username on Ooplabdh.
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="time-outline" size={18} color={COLORS.accent} style={styles.bulletCheck} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>Don't Rush: </Text>
                  Scammers often create a false sense of urgency (e.g., "Pay me half right now or I am selling it to someone else"). Take your time and stick to the Golden Rules.
                </Text>
              </View>
            </View>
          </View>

          {/* Section 3: Safety Tips for Sellers */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📦 Safety Tips for Sellers</Text>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Ionicons name="warning-outline" size={18} color={COLORS.danger} style={styles.bulletCheck} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>Beware of Fake Payment Screenshots: </Text>
                  This is the most common college scam! Never hand over your item just by looking at a UPI screenshot. Always check your own bank app or SMS to confirm the money has actually been credited to your account.
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="cash-outline" size={18} color={COLORS.accent} style={styles.bulletCheck} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>Don't Accept Overpayments: </Text>
                  If a buyer accidentally "overpays" digitally and asks for a refund of the difference, it is a classic scam. Tell them you will return the money only after it reflects in your official bank statement.
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="wallet-outline" size={18} color={COLORS.accent} style={styles.bulletCheck} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>Cash is Still Cool: </Text>
                  If you are unsure about digital payments, simply ask for cash during the meetup.
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="checkmark-done-outline" size={18} color={COLORS.success} style={styles.bulletCheck} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>Remove Sold Items: </Text>
                  Once your item is sold, immediately mark it as "Sold" or delete the listing to stop receiving messages from other interested buyers.
                </Text>
              </View>
            </View>
          </View>

          {/* Section 4: What to do if something goes wrong? */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚨 What to do if something goes wrong?</Text>
            <Text style={styles.sectionBody}>
              We have zero tolerance for scams and abusive behavior. If a user asks for money upfront, sends fake payment screenshots, or acts inappropriately:
            </Text>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Ionicons name="close-circle-outline" size={16} color={COLORS.danger} style={styles.bulletDot} />
                <Text style={styles.bulletText}>Do not proceed with the transaction.</Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="camera-outline" size={16} color={COLORS.accent} style={styles.bulletDot} />
                <Text style={styles.bulletText}>Take screenshots of the conversation as proof.</Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="flag-outline" size={16} color={COLORS.warning} style={styles.bulletDot} />
                <Text style={styles.bulletText}>Click the "Report User" button on their profile or the product listing.</Text>
              </View>
            </View>
            <View style={styles.reportCallout}>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.danger} />
              <Text style={styles.reportCalloutText}>
                Our moderation team will investigate immediately and block the user from the platform if found guilty.
              </Text>
            </View>
          </View>
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
    maxWidth: 900,
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
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  glowMint: {
    position: 'absolute',
    top: 350,
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
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.textMuted,
    textAlign: 'center',
    maxWidth: 700,
    marginTop: 4,
  },
  policyCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    gap: SPACING.lg,
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: 6,
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textMuted,
  },
  bulletList: {
    gap: 12,
    marginTop: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bulletDot: {
    marginTop: 8,
    opacity: 0.8,
  },
  bulletCheck: {
    marginTop: 2,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textMuted,
  },
  boldText: {
    color: COLORS.text,
    fontWeight: '700',
  },
  highlightBox: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  boxIcon: {
    marginTop: 2,
  },
  boxContent: {
    flex: 1,
    gap: 4,
  },
  boxText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: COLORS.textMuted,
  },
  reportCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    gap: 10,
    marginTop: 8,
  },
  reportCalloutText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 20,
    color: COLORS.danger,
    fontWeight: '600',
  },
});
