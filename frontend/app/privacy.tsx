import React, { useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import Footer from '../components/layout/Footer';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { COLORS, RADIUS, SPACING } from '../theme/colors';

export default function PrivacyPolicy() {
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
            <Ionicons name="shield-checkmark" size={14} color={COLORS.accent} />
            <Text style={styles.pillText}>Trust & Security</Text>
          </View>
          <Text style={[styles.heroTitle, isTiny && styles.heroTitleTiny]}>
            Privacy Policy
          </Text>
          <Text style={styles.heroSub}>
            Last Updated: July 2026
          </Text>
          <Text style={styles.heroBody}>
            Welcome to Ooplabdh! Your privacy is our top priority. This Privacy Policy explains how we collect, use, and protect your personal information when you use our platform to buy, sell, and trade within your college campus.
          </Text>
        </View>

        {/* Policy Content Card */}
        <View style={styles.policyCard}>
          {/* Section 1 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
            <Text style={styles.sectionBody}>
              To provide a secure and verified campus marketplace, we collect the following types of information:
            </Text>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Ionicons name="ellipse" size={6} color={COLORS.accent} style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>Account Information: </Text>
                  When you register, we collect your full name, username, email address, phone number, and college name.
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="ellipse" size={6} color={COLORS.accent} style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>Authentication Data: </Text>
                  We generate and temporarily store One-Time Passwords (OTPs) to verify your email and phone number.
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="ellipse" size={6} color={COLORS.accent} style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>Listing & Activity Data: </Text>
                  Information you provide when creating a listing (product title, description, price, condition, and images). We also track your wishlist activity.
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="ellipse" size={6} color={COLORS.accent} style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>Communication Data: </Text>
                  Messages sent and received through our in-app Socket.io chat system to facilitate negotiations between buyers and sellers.
                </Text>
              </View>
            </View>
          </View>

          {/* Section 2 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
            <Text style={styles.sectionBody}>
              We use your data exclusively to improve your campus trading experience:
            </Text>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.success} style={styles.bulletCheck} />
                <Text style={styles.bulletText}>To verify that you are a genuine student and maintain a scam-free community.</Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.success} style={styles.bulletCheck} />
                <Text style={styles.bulletText}>To create and manage your personal account and product listings.</Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.success} style={styles.bulletCheck} />
                <Text style={styles.bulletText}>To facilitate secure, real-time communication between buyers and sellers without exposing personal contact details.</Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.success} style={styles.bulletCheck} />
                <Text style={styles.bulletText}>To send essential service updates, such as OTPs, password reset links, and new notification alerts.</Text>
              </View>
            </View>
          </View>

          {/* Section 3 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. How We Share Your Information</Text>
            <Text style={styles.sectionBody}>
              We do not sell, rent, or trade your personal information to third parties.
            </Text>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Ionicons name="ellipse" size={6} color={COLORS.accent} style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>With Other Users: </Text>
                  Your username, avatar, college, and trust rating are visible to other verified students. Your phone number and email address are strictly hidden from public view and other users to protect your privacy.
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="ellipse" size={6} color={COLORS.accent} style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>For Legal & Safety Reasons: </Text>
                  We may disclose your information if required by law or to protect the safety, rights, and property of Ooplabdh and its users (e.g., investigating fraud or reported scams).
                </Text>
              </View>
            </View>
          </View>

          {/* Section 4 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Data Security</Text>
            <Text style={styles.sectionBody}>
              We implement industry-standard security measures to keep your data safe:
            </Text>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Ionicons name="shield-outline" size={16} color={COLORS.accent} style={styles.bulletCheck} />
                <Text style={styles.bulletText}>Passwords are securely hashed and encrypted in our database.</Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="shield-outline" size={16} color={COLORS.accent} style={styles.bulletCheck} />
                <Text style={styles.bulletText}>Access to the platform requires strict OTP verification.</Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="shield-outline" size={16} color={COLORS.accent} style={styles.bulletCheck} />
                <Text style={styles.bulletText}>Product images are securely hosted using cloud storage solutions.</Text>
              </View>
            </View>
            <Text style={[styles.sectionBody, { marginTop: 12, fontStyle: 'italic' }]}>
              While we strive to protect your personal information, no method of transmission over the internet is 100% secure. We encourage you to use strong passwords and keep your login credentials confidential.
            </Text>
          </View>

          {/* Section 5 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Your Rights and Controls</Text>
            <Text style={styles.sectionBody}>
              You have full control over your data on Ooplabdh:
            </Text>
            <View style={styles.bulletList}>
              <View style={styles.bulletItem}>
                <Ionicons name="ellipse" size={6} color={COLORS.accent} style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>Update Profile: </Text>
                  You can edit your name, phone number, college, and avatar at any time via your account dashboard.
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="ellipse" size={6} color={COLORS.accent} style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>Manage Listings: </Text>
                  You can edit, mark as sold, or permanently delete your product listings.
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="ellipse" size={6} color={COLORS.accent} style={styles.bulletDot} />
                <Text style={styles.bulletText}>
                  <Text style={styles.boldText}>Account Deletion: </Text>
                  You can request the permanent deletion of your account and associated data by contacting our support team.
                </Text>
              </View>
            </View>
          </View>

          {/* Section 6 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Third-Party Links</Text>
            <Text style={styles.sectionBody}>
              Our platform may contain links to third-party websites or services (e.g., external image links). We are not responsible for the privacy practices or content of these external sites.
            </Text>
          </View>

          {/* Section 7 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>7. Changes to This Policy</Text>
            <Text style={styles.sectionBody}>
              We may update this Privacy Policy from time to time to reflect changes in our platform or legal requirements. We will notify you of any significant changes via email or an in-app notification.
            </Text>
          </View>

          {/* Section 8 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>8. Contact Us</Text>
            <Text style={styles.sectionBody}>
              If you have any questions, concerns, or requests regarding this Privacy Policy, please reach out to us at:
            </Text>
            <View style={styles.contactCard}>
              <View style={styles.contactRow}>
                <Ionicons name="mail-outline" size={18} color={COLORS.accent} />
                <Text style={styles.contactText}>support@ooplabdh.com</Text>
              </View>
              <View style={styles.contactRow}>
                <Ionicons name="globe-outline" size={18} color={COLORS.accent} />
                <Text style={styles.contactText}>Via the App: Use the "Contact Us" section in the website footer.</Text>
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
