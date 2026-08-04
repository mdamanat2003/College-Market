import React, { useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import Footer from '../components/layout/Footer';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { COLORS, RADIUS, SPACING } from '../theme/colors';

export default function TermsOfService() {
  const scrollRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();
  const isTiny = width < 390;

  return (
    <ScrollView ref={scrollRef} style={styles.page} showsVerticalScrollIndicator={false}>
      {/* Ambient background glows */}
      <View style={styles.glowBlue} />
      <View style={styles.glowMint} />

      <PublicNavbar activeRoute="about" />

      <View style={styles.content}>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.pill}>
            <Ionicons name="document-text" size={14} color={COLORS.accent} />
            <Text style={styles.pillText}>Legal Agreement</Text>
          </View>
          <Text style={[styles.heroTitle, isTiny && styles.heroTitleTiny]}>
            Terms of Service
          </Text>
          <Text style={styles.heroSub}>
            Last Updated: July 2026
          </Text>
          <Text style={styles.heroBody}>
            Welcome to Ooplabdh! By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully before creating an account or using our services.
          </Text>
        </View>

        {/* Policy Content Card */}
        <View style={styles.policyCard}>
          {/* Section 1 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Eligibility and Account Registration</Text>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Ionicons name="ellipse" size={6} color={COLORS.accent} style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>Student-Only Platform: </Text>
                  Ooplabdh is designed exclusively for college students. By registering, you confirm that you are a currently enrolled student.
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="ellipse" size={6} color={COLORS.accent} style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>Verification: </Text>
                  You must verify your account using a valid email address and phone number via our OTP system. We reserve the right to suspend or terminate accounts that provide false or misleading information.
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="ellipse" size={6} color={COLORS.accent} style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>Account Security: </Text>
                  You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.
                </Text>
              </View>
            </View>
          </View>

          {/* Section 2 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. Buying and Selling Rules</Text>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Ionicons name="ellipse" size={6} color={COLORS.accent} style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>Accurate Listings: </Text>
                  Sellers must provide accurate descriptions, clear images, and fair prices for their items. Misleading or deceptive listings are strictly prohibited.
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="ellipse" size={6} color={COLORS.accent} style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>Prohibited Items: </Text>
                  You may not list or sell illegal, dangerous, or unauthorized items (e.g., weapons, stolen goods, hazardous materials). The platform is meant for academic essentials, electronics, and hostel items.
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="ellipse" size={6} color={COLORS.accent} style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>Independent Transactions: </Text>
                  Ooplabdh acts solely as a connecting platform for buyers and sellers. We do not own, inspect, or guarantee the quality, safety, or legality of the items listed.
                </Text>
              </View>
            </View>
          </View>

          {/* Section 3 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Payment and Handover Safety</Text>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Ionicons name="ellipse" size={6} color={COLORS.accent} style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>On-Campus Exchange: </Text>
                  We strongly recommend that buyers and sellers meet in safe, public areas within the college campus (e.g., canteens, hostel gates, library areas) to complete the physical exchange.
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="ellipse" size={6} color={COLORS.accent} style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>Payment Guidelines: </Text>
                  Buyers should thoroughly inspect the item before making any payment. Ooplabdh is not responsible for any financial losses, upfront payment scams, or disputes arising from transactions between users.
                </Text>
              </View>
            </View>
          </View>

          {/* Section 4 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. User Conduct and Restrictions</Text>
            <Text style={styles.sectionBody}>
              You agree not to use Ooplabdh to:
            </Text>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Ionicons name="close-circle-outline" size={16} color={COLORS.danger} style={styles.bulletCheck} />
                <Text style={styles.bulletText}>Harass, threaten, or abuse other students.</Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="close-circle-outline" size={16} color={COLORS.danger} style={styles.bulletCheck} />
                <Text style={styles.bulletText}>Spam the platform with duplicate listings, irrelevant content, or promotional links.</Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="close-circle-outline" size={16} color={COLORS.danger} style={styles.bulletCheck} />
                <Text style={styles.bulletText}>Bypass our security measures or attempt to extract personal contact details of other users outside of the provided secure in-app chat.</Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="close-circle-outline" size={16} color={COLORS.danger} style={styles.bulletCheck} />
                <Text style={styles.bulletText}>Engage in any fraudulent activity or post fake UPI payment screenshots.</Text>
              </View>
            </View>
          </View>

          {/* Section 5 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Moderation and Account Termination</Text>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Ionicons name="ellipse" size={6} color={COLORS.accent} style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  We reserve the right to remove any product listing that violates these terms without prior notice.
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="ellipse" size={6} color={COLORS.accent} style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  Ooplabdh administrators hold the right to block (<Text style={styles.boldText}>isBlocked</Text>) or permanently delete the accounts of users reported for scams, ghosting, or inappropriate behavior.
                </Text>
              </View>
            </View>
          </View>

          {/* Section 6 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Disclaimer of Warranties</Text>
            <Text style={styles.sectionBody}>
              Ooplabdh is provided on an "AS IS" and "AS AVAILABLE" basis. We do not warrant that the platform will be uninterrupted, bug-free, or entirely secure. To the fullest extent permitted by law, we disclaim all warranties, express or implied, regarding the items traded on our platform.
            </Text>
          </View>

          {/* Section 7 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Limitation of Liability</Text>
            <Text style={styles.sectionBody}>
              Ooplabdh, its creators, and its administrators shall not be liable for any direct, indirect, incidental, or consequential damages resulting from your use of the platform, your interactions with other users, or the purchase/sale of any items.
            </Text>
          </View>

          {/* Section 8 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Changes to the Terms</Text>
            <Text style={styles.sectionBody}>
              We may modify these Terms of Service at any time. Your continued use of Ooplabdh after any changes indicates your acceptance of the new terms.
            </Text>
          </View>

          {/* Section 9 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>9. Contact Information</Text>
            <Text style={styles.sectionBody}>
              For any questions regarding these terms, disputes, or to report a user, please contact us at:
            </Text>
            <View style={styles.contactCard}>
              <View style={styles.contactRow}>
                <Ionicons name="mail-outline" size={18} color={COLORS.accent} />
                <Text style={styles.contactText}>legal@ooplabdh.com</Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="globe-outline" size={18} color={COLORS.accent} />
                <Text style={styles.contactText}>Via the App: Contact Us section in the footer.</Text>
              </View>
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
  heroSub: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '600',
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
    gap: 10,
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
    gap: 8,
    marginTop: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    marginTop: 8,
    opacity: 0.8,
  },
  bulletCheck: {
    marginTop: 2,
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
  contactCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    gap: 12,
    marginTop: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
});
