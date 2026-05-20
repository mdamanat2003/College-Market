import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { SPACING } from '../theme/colors';

const featureCards = [
  {
    title: 'Secure Escrow Payments',
    description: 'Funds stay protected until the deal is completed.',
    icon: 'shield-checkmark-outline' as const,
    span: 2,
  },
  {
    title: 'Live Chat',
    description: 'Negotiate instantly with fast in-app messaging.',
    icon: 'chatbubbles-outline' as const,
    span: 2,
  },
  {
    title: 'Smart Search',
    description: 'Find books, gadgets, and dorm essentials in seconds.',
    icon: 'search-outline' as const,
    span: 1,
  },
  {
    title: 'Verified Campus Users',
    description: 'Keep the marketplace trusted with student verification.',
    icon: 'checkmark-done-circle-outline' as const,
    span: 1,
  },
];

const stats = [
  { value: '120+', label: 'campus groups' },
  { value: '< 2 min', label: 'average reply' },
  { value: '98.6%', label: 'trusted sellers' },
];

export default function LandingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const isMobile = width < 520;
  const isCompact = width < 380;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.glowBlue} />
      <View style={styles.glowPurple} />

      <View style={styles.navWrap}>
        <View style={[styles.navbar, isMobile && styles.navbarMobile]}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              <Ionicons name="cart-outline" size={18} color="#7dd3fc" />
            </View>
            <View>
              <Text style={styles.brandTitle}>CampusCart</Text>
              <Text style={styles.brandSubtitle}>College marketplace, reimagined</Text>
            </View>
          </View>

          <View style={[styles.navActions, isMobile && styles.navActionsMobile]}>
            <TouchableOpacity style={styles.navLink} onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.navLinkText}>Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryNavButton} onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.primaryNavButtonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={[styles.hero, isDesktop && styles.heroDesktop]}>
        <View style={styles.heroCopy}>
          <View style={styles.pill}>
            <Ionicons name="sparkles-outline" size={14} color="#7dd3fc" />
            <Text style={styles.pillText}>Trusted campus trading for students</Text>
          </View>

          <Text style={[styles.headline, isMobile && styles.headlineMobile, isCompact && styles.headlineCompact]}>Buy, sell, and chat across campus with confidence.</Text>
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
            <View style={[styles.mockupTopBar, isMobile && styles.mockupTopBarMobile]}>
              <View>
                <Text style={styles.mockupKicker}>CampusCart Dashboard</Text>
                <Text style={[styles.mockupTitle, isMobile && styles.mockupTitleMobile]}>Student commerce at a glance</Text>
              </View>
              <View style={[styles.onlinePill, isMobile && styles.onlinePillMobile]}>
                <Ionicons name="people-outline" size={12} color="#a7f3d0" />
                <Text style={styles.onlineText}>247 online</Text>
              </View>
            </View>

            <View style={[styles.mockupGrid, isMobile && styles.mockupGridMobile]}>
              <View style={[styles.mockupLargeCard, styles.borderCard]}>
                <View style={styles.cardHeaderRow}>
                  <View>
                    <Text style={styles.cardLabel}>Featured listing</Text>
                    <Text style={styles.cardTitle}>MacBook Air M2</Text>
                  </View>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>Escrow ready</Text>
                  </View>
                </View>

                <View style={styles.chartPanel}>
                  <View style={styles.chartTopRow}>
                    <View style={styles.mockupLines}>
                      <View style={styles.lineShort} />
                      <View style={styles.lineLong} />
                      <View style={styles.lineMid} />
                    </View>
                    <View style={styles.starBadge}>
                      <Ionicons name="star" size={16} color="#fbbf24" />
                    </View>
                  </View>

                  <View style={[styles.chartBars, isMobile && styles.chartBarsMobile]}>
                    {[44, 68, 55, 82, 64].map((height, index) => (
                      <View key={index} style={styles.chartBarTrack}>
                        <View style={[styles.chartBarFill, { height: `${height}%` }]} />
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              <View style={[styles.sideStack, isMobile && styles.sideStackMobile]}>
                <View style={[styles.smallCard, styles.borderCard]}>
                  <Text style={styles.cardLabel}>Live chat</Text>
                  <View style={styles.chatBubbleRight}>
                    <Text style={styles.chatTextDark}>Is this still available?</Text>
                  </View>
                  <View style={styles.chatBubbleLeft}>
                    <Text style={styles.chatTextLight}>Yes, can meet near the library at 5 PM.</Text>
                  </View>
                </View>

                <View style={[styles.smallCard, styles.borderCard]}>
                  <Text style={styles.cardLabel}>Verified seller</Text>
                  <View style={styles.sellerRow}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>A</Text>
                    </View>
                    <View>
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

      <View style={styles.sectionCopy}>
        <Text style={styles.sectionLabel}>About CampusCart</Text>
        <Text style={styles.sectionTitle}>A polished marketplace built for student life.</Text>
        <Text style={styles.sectionBody}>
          CampusCart blends the calm confidence of premium SaaS design with the practical needs of a campus marketplace, making every step from discovery to payment feel effortless.
        </Text>
      </View>

      <View style={styles.sectionHeaderRow}>
        <View>
          <Text style={styles.sectionLabel}>Features</Text>
          <Text style={styles.sectionTitle}>Built as a bento grid.</Text>
        </View>
      </View>

      <View style={[styles.featureGrid, isMobile && styles.featureGridMobile]}>
        {featureCards.map((item, index) => {
          const widthStyle = isMobile ? styles.featureFull : item.span === 2 ? styles.featureWide : styles.featureNormal;
          const heightStyle = index === 1 ? styles.featureTall : null;

          return (
            <View key={item.title} style={[styles.featureCard, widthStyle, heightStyle]}>
              <View style={styles.featureIconWrap}>
                <Ionicons name={item.icon} size={20} color="#7dd3fc" />
              </View>
              <Text style={styles.featureTitle}>{item.title}</Text>
              <Text style={styles.featureDescription}>{item.description}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.ctaPanel}>
        <View style={styles.ctaTextBlock}>
          <Text style={styles.sectionLabel}>Ready to launch</Text>
          <Text style={styles.ctaTitle}>A premium landing page that feels like the product itself.</Text>
        </View>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.primaryButtonText}>Sign Up Now</Text>
          <Ionicons name="arrow-forward" size={16} color="#0a0a0a" />
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>CampusCart 2026. All rights reserved.</Text>
        <View style={styles.footerLinks}>
          <Text style={styles.footerLink}>About</Text>
          <Text style={styles.footerLink}>Features</Text>
          <Text style={styles.footerLink}>Contact</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    paddingBottom: 40,
    paddingTop: 14,
  },
  navWrap: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
  },
  navbar: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navbarMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandMark: {
    width: 40,
    height: 40,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  brandSubtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    marginTop: 2,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  navActionsMobile: {
    alignSelf: 'flex-end',
  },
  navLink: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  navLinkText: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryNavButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  primaryNavButtonText: {
    color: '#0a0a0a',
    fontSize: 14,
    fontWeight: '700',
  },
  hero: {
    paddingHorizontal: SPACING.md,
    gap: 24,
  },
  heroDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 28,
  },
  heroCopy: {
    flex: 1,
    zIndex: 1,
  },
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 18,
  },
  pillText: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    fontWeight: '600',
  },
  headline: {
    color: '#fff',
    fontSize: 52,
    lineHeight: 58,
    fontWeight: '900',
    letterSpacing: -2,
    maxWidth: 640,
  },
  headlineMobile: {
    fontSize: 38,
    lineHeight: 42,
    letterSpacing: -1.4,
    maxWidth: 420,
  },
  headlineCompact: {
    fontSize: 34,
    lineHeight: 38,
  },
  subheadline: {
    marginTop: 18,
    color: 'rgba(255,255,255,0.68)',
    fontSize: 16,
    lineHeight: 26,
    maxWidth: 640,
  },
  heroButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
    flexWrap: 'wrap',
  },
  heroButtonsMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 999,
  },
  primaryButtonText: {
    color: '#0a0a0a',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  secondaryButtonText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    fontWeight: '700',
  },
  statsRow: {
    marginTop: 28,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statsRowMobile: {
    gap: 10,
  },
  statCard: {
    minWidth: 120,
    padding: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statCardMobile: {
    minWidth: 0,
    flexBasis: '48%',
    flexGrow: 1,
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  mockupWrap: {
    flex: 1,
    minHeight: 460,
    justifyContent: 'center',
  },
  mockupWrapMobile: {
    minHeight: 0,
  },
  mockupGlow: {
    position: 'absolute',
    left: 20,
    right: 20,
    top: 20,
    bottom: 20,
    borderRadius: 36,
    backgroundColor: 'rgba(59,130,246,0.16)',
  },
  mockupCard: {
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    shadowColor: '#8b5cf6',
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  mockupTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  mockupTopBarMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
  },
  mockupKicker: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  mockupTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  mockupTitleMobile: {
    fontSize: 16,
    lineHeight: 20,
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(16,185,129,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.18)',
  },
  onlinePillMobile: {
    alignSelf: 'flex-start',
  },
  onlineText: {
    color: '#a7f3d0',
    fontSize: 12,
    fontWeight: '700',
  },
  mockupGrid: {
    marginTop: 14,
    gap: 14,
  },
  mockupGridMobile: {
    gap: 12,
  },
  mockupLargeCard: {
    borderRadius: 28,
    padding: 16,
    backgroundColor: '#0F0F12',
  },
  sideStack: {
    gap: 14,
  },
  sideStackMobile: {
    gap: 12,
  },
  smallCard: {
    borderRadius: 28,
    padding: 16,
    backgroundColor: '#0F0F12',
  },
  borderCard: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: 'rgba(255,255,255,0.52)',
    fontSize: 12,
    marginBottom: 4,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(14,165,233,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(14,165,233,0.2)',
  },
  statusPillText: {
    color: '#7dd3fc',
    fontSize: 11,
    fontWeight: '700',
  },
  chartPanel: {
    marginTop: 16,
    height: 180,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  chartTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mockupLines: {
    gap: 8,
  },
  lineShort: {
    width: 64,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  lineLong: {
    width: 130,
    height: 26,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  lineMid: {
    width: 88,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  starBadge: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartBars: {
    flex: 1,
    marginTop: 22,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  chartBarsMobile: {
    marginTop: 18,
    gap: 6,
  },
  chartBarTrack: {
    flex: 1,
    height: '100%',
    borderRadius: 999,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 4,
  },
  chartBarFill: {
    width: '100%',
    borderRadius: 999,
    backgroundColor: '#8b5cf6',
  },
  chatBubbleRight: {
    alignSelf: 'flex-end',
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    maxWidth: '88%',
  },
  chatBubbleLeft: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    maxWidth: '88%',
  },
  chatTextDark: {
    color: '#0a0a0a',
    fontSize: 13,
    fontWeight: '600',
  },
  chatTextLight: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
  },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c3aed',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  sellerName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  sellerMeta: {
    marginTop: 3,
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
  },
  sectionCopy: {
    marginTop: 40,
    paddingHorizontal: SPACING.md,
    paddingTop: 28,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  sectionHeaderRow: {
    marginTop: 24,
    paddingHorizontal: SPACING.md,
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    letterSpacing: 2.8,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    marginTop: 12,
    color: '#fff',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -1,
    maxWidth: 640,
  },
  sectionBody: {
    marginTop: 12,
    color: 'rgba(255,255,255,0.65)',
    fontSize: 16,
    lineHeight: 26,
    maxWidth: 760,
  },
  featureGrid: {
    marginTop: 18,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureGridMobile: {
    gap: 10,
  },
  featureCard: {
    minHeight: 160,
    padding: 18,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'space-between',
  },
  featureNormal: {
    width: '48%',
  },
  featureWide: {
    width: '100%',
  },
  featureFull: {
    width: '100%',
  },
  featureTall: {
    minHeight: 208,
  },
  featureIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  featureTitle: {
    marginTop: 14,
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  featureDescription: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.63)',
    fontSize: 13,
    lineHeight: 21,
  },
  ctaPanel: {
    marginTop: 28,
    marginHorizontal: SPACING.md,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 16,
  },
  ctaTextBlock: {
    maxWidth: 760,
  },
  ctaTitle: {
    marginTop: 10,
    color: '#fff',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  footer: {
    marginTop: 24,
    paddingHorizontal: SPACING.md,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    gap: 12,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    textAlign: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  footerLink: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  glowBlue: {
    position: 'absolute',
    left: -80,
    top: 160,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(59,130,246,0.18)',
  },
  glowPurple: {
    position: 'absolute',
    right: -90,
    top: 280,
    width: 240,
    height: 240,
    borderRadius: 999,
    backgroundColor: 'rgba(168,85,247,0.16)',
  },
});