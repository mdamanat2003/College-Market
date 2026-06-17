import React, { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Image,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  Platform,
} from 'react-native';

import Footer from '../components/layout/Footer';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { SPACING } from '../theme/colors';

type TeamMember = {
  name: string;
  role: string;
  desc: string;
  initials: string;
  accent: string;
  text: string;
  photo?: ImageSourcePropType;
};

const team: TeamMember[] = [
  {
    name: 'MD AMANAT ULLAH',
    role: 'Chief Executive Officer (CEO)',
    desc: 'Leading the technical vision and full-stack architecture for CampusCart.',
    initials: 'MA',
    accent: '#EFF6FF', // Softer pastel blue
    text: '#2563EB',
    photo: require('../assets/images/team/amanat.png'),
  },
  // {
  //   name: 'Md Adnan Karim',
  //   role: 'Co-Founder & Lead UI/UX Designer',
  //   desc: 'Crafting the premium, intuitive experience across the product.',
  //   initials: 'AK',
  //   accent: '#F5F3FF',
  //   text: '#7C3AED',
  // },
  {
    name: 'Aftab Mansoori',
    role: 'Chief Technology Officer (CTO)',
    desc: 'Building scalable application features and smooth student workflows.',
    initials: 'AM',
    accent: '#ECFDF5',
    text: '#059669',
    photo: require('../assets/images/team/aftab.jpeg'),
  },
  // {
  //   name: 'Masab Mallick',
  //   role: 'Co-Founder & Software Engineer',
  //   desc: 'Focusing on robust structures and complex campus-level features.',
  //   initials: 'MM',
  //   accent: '#FFFBEB',
  //   text: '#D97706',
  // },
  {
    name: 'Yasir Jamal Noori',
    role: 'Chief Operating Officer (COO)',
    desc: 'Testing the marketplace so transactions and chats stay reliable.',
    initials: 'YN',
    accent: '#FFF1F2',
    text: '#E11D48',
    photo: require('../assets/images/team/yasir.jpeg'),
  },
];

const pillars = [
  {
    title: 'Why We Built This',
    icon: 'alert-circle-outline' as const,
    tone: 'problem',
    points: [
      'Messages get lost in busy WhatsApp and Telegram groups.',
      'No easy way to verify the buyer or seller.',
      'Higher risk of scams, ghosting, and messy coordination.',
    ],
  },
  {
    title: 'Our Solution',
    icon: 'shield-checkmark-outline' as const,
    tone: 'solution',
    points: [
      'Escrow payments protect both sides until delivery is completed.',
      'Smart search keeps listings organized and easy to find.',
      'Verified student profiles build a trusted campus community.',
    ],
  },
];

export default function About() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [hoveredMember, setHoveredMember] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const isWide = width >= 900;
  const isTablet = width >= 640;
  const isTiny = width < 390;

  return (
    // 👇 ScrollView se restricted contentContainerStyle hata diya 👇
    <ScrollView ref={scrollRef} style={styles.page} showsVerticalScrollIndicator={false}>
      {/* Background Ambient Glows */}
      <View style={styles.glowBlue} />
      <View style={styles.glowMint} />

      {/* 👇 NAYA WRAPPER: Baki saari cheezein center aur max 1200px rahengi 👇 */}
      <View style={styles.content}>
        <PublicNavbar activeRoute="about" />

        {/* Hero Section */}
        <View style={[styles.hero, isWide && styles.heroWide]}>
          <View style={styles.heroCopy}>
            <View style={styles.pill}>
              <Ionicons name="sparkles" size={14} color="#38BDF8" />
              <Text style={styles.pillText}>Built for students, by students</Text>
            </View>

            <Text style={[styles.heroTitle, isTiny && styles.heroTitleTiny]}>
              Redefining Campus{'\n'}Commerce.
            </Text>
            <Text style={styles.heroBody}>
              CampusCart was born from a simple frustration: students needed a safer,
              cleaner way to buy, sell, and connect without relying on noisy group chats.
            </Text>

            <View style={styles.ctaRow}>
              <Pressable 
                style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]} 
                onPress={() => router.push('/(auth)/register')}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </Pressable>
              
              <Pressable 
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]} 
                onPress={() => router.push('/home')}
              >
                <Ionicons name="compass-outline" size={18} color="#475569" />
                <Text style={styles.secondaryButtonText}>Explore Home</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.heroPanel}>
            <View style={styles.heroStatCard}>
              <Text style={styles.heroStatValue}>100%</Text>
              <Text style={styles.heroStatLabel}>Verified Campus Network</Text>
            </View>
            <View style={styles.heroStatCardAlt}>
              <Text style={[styles.heroStatValue, { color: '#fff' }]}>5</Text>
              <Text style={[styles.heroStatLabel, { color: '#94A3B8' }]}>Founders Building Trust</Text>
            </View>
          </View>
        </View>

        {/* Pillars Section (What & Why) */}
        <View style={[styles.sectionGrid, isWide && styles.sectionGridWide]}>
          {pillars.map((item) => (
            <View
              key={item.title}
              style={[styles.pillarCard, item.tone === 'solution' ? styles.solutionCard : styles.problemCard]}
            >
              <View style={styles.pillarHeader}>
                <View style={[styles.pillarIconWrap, item.tone === 'solution' ? styles.solutionIcon : styles.problemIcon]}>
                  <Ionicons
                    name={item.icon}
                    size={24}
                    color={item.tone === 'solution' ? '#2563EB' : '#EF4444'}
                  />
                </View>
                <Text style={styles.pillarTitle}>{item.title}</Text>
              </View>

              <View style={styles.bulletList}>
                {item.points.map((point) => (
                  <View key={point} style={styles.bulletRow}>
                    <View style={[styles.bulletMarkBadge, item.tone === 'solution' ? styles.badgeSuccess : styles.badgeDanger]}>
                      <Ionicons 
                        name={item.tone === 'solution' ? 'checkmark' : 'close'} 
                        size={12} 
                        color={item.tone === 'solution' ? '#059669' : '#DC2626'} 
                      />
                    </View>
                    <Text style={styles.bulletText}>{point}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Team Section */}
        <View style={styles.sectionHeading}>
          <Text style={styles.sectionKicker}>Our Team</Text>
          <Text style={[styles.sectionTitle, isTiny && styles.sectionTitleTiny]}>Meet the minds behind it.</Text>
          <Text style={styles.sectionBody}>
            The team building CampusCart as a reliable, premium experience for every student on campus.
          </Text>
        </View>

        <View style={styles.founderWrap}>
          <Pressable
            //@ts-ignore - React Native Web hover props
            onHoverIn={() => setHoveredMember(team[0].name)}
            onHoverOut={() => setHoveredMember(null)}
            style={({ pressed }) => [
              styles.founderCard,
              (hoveredMember === team[0].name || pressed) && styles.teamCardActive
            ]}
          >
            <View style={[styles.avatar, { backgroundColor: team[0].accent }]}>
              {team[0].photo ? (
                <Image source={team[0].photo} style={styles.memberPhoto} />
              ) : (
                <Text style={[styles.avatarText, { color: team[0].text }]}>{team[0].initials}</Text>
              )}
            </View>
            <Text style={styles.memberName}>{team[0].name}</Text>
            <Text style={styles.memberRole}>{team[0].role}</Text>
            <Text style={styles.memberDesc}>{team[0].desc}</Text>
          </Pressable>
        </View>

        <View style={[styles.teamGrid, isTablet && styles.teamGridWide, isWide && styles.teamGridDesktop]}>
          {team.slice(1).map((member) => (
            <Pressable
              key={member.name}
              //@ts-ignore
              onHoverIn={() => setHoveredMember(member.name)}
              onHoverOut={() => setHoveredMember(null)}
              style={({ pressed }) => [
                styles.teamCard,
                isTablet && styles.teamCardWide,
                isWide && styles.teamCardDesktop,
                (hoveredMember === member.name || pressed) && styles.teamCardActive,
              ]}
            >
              <View style={[styles.avatarSmall, { backgroundColor: member.accent }]}>
                {member.photo ? (
                  <Image source={member.photo} style={styles.memberPhoto} />
                ) : (
                  <Text style={[styles.avatarTextSmall, { color: member.text }]}>{member.initials}</Text>
                )}
              </View>
              <Text style={styles.memberNameSmall}>{member.name}</Text>
              <Text style={styles.memberRoleSmall}>{member.role}</Text>
              <Text style={styles.memberDescSmall}>{member.desc}</Text>
            </Pressable>
          ))}
        </View>

        {/* Deep Dark CTA Banner */}
        <View style={styles.ctaPanel}>
          {/* Decorative background circles */}
          <View style={styles.ctaCircle1} />
          <View style={styles.ctaCircle2} />
          
          <View style={styles.ctaTextBlock}>
            {/* <Text style={styles.ctaKicker}>READY TO LAUNCH</Text> */}
            <Text style={[styles.ctaTitle, isTiny && styles.ctaTitleTiny]}>
              A premium campus marketplace that feels safe, fast, and built just for you.
            </Text>
          </View>
          <Pressable 
            style={({ pressed }) => [styles.ctaButton, pressed && styles.buttonPressed]} 
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.ctaButtonText}>Join CampusCart</Text>
            <Ionicons name="arrow-forward" size={16} color="#0F172A" />
          </Pressable>
        </View>
      </View> 
      {/* 👆 WRAPPER KHATAM 👆 */}

      {/* 👇 FOOTER WRAPPER KE BAHAR HAI (To ye 100% width lega) 👇 */}
      <Footer onBackToTop={() => scrollRef.current?.scrollTo({ y: 0, animated: true })} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Ultra light neutral background
  },
  content: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.xl,
    maxWidth: 1200, // Max width for ultrawide screens
    alignSelf: 'center',
    width: '100%',
  },
  glowBlue: {
    position: 'absolute',
    top: -50,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 300,
    backgroundColor: 'rgba(59,130,246,0.06)',
    filter: Platform.OS === 'web' ? 'blur(60px)' : undefined,
  },
  glowMint: {
    position: 'absolute',
    top: 300,
    left: -100,
    width: 350,
    height: 350,
    borderRadius: 350,
    backgroundColor: 'rgba(16,185,129,0.05)',
    filter: Platform.OS === 'web' ? 'blur(80px)' : undefined,
  },
  hero: {
    gap: SPACING.lg,
    marginTop: 20,
  },
  heroWide: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 60,
  },
  heroCopy: {
    flex: 1.2,
    gap: 20,
  },
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#E0F2FE',
  },
  pillText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 44,
    lineHeight: 48,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -1, // Startup style typography
  },
  heroTitleTiny: {
    fontSize: 34,
    lineHeight: 40,
  },
  heroBody: {
    maxWidth: 600,
    fontSize: 17,
    lineHeight: 26,
    color: '#475569',
  },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 10,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  secondaryButtonText: {
    color: '#334155',
    fontSize: 15,
    fontWeight: '700',
  },
  buttonPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  heroPanel: {
    flex: 0.8,
    gap: 16,
    minWidth: 280,
  },
  heroStatCard: {
    borderRadius: 24,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
  },
  heroStatCardAlt: {
    borderRadius: 24,
    backgroundColor: '#0F172A',
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 4,
  },
  heroStatValue: {
    fontSize: 48,
    lineHeight: 52,
    fontWeight: '900',
    color: '#2563EB',
    letterSpacing: -1,
  },
  heroStatLabel: {
    marginTop: 4,
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },
  sectionGrid: {
    gap: 20,
    marginTop: 20,
  },
  sectionGridWide: {
    flexDirection: 'row',
  },
  pillarCard: {
    flex: 1,
    borderRadius: 24,
    padding: 28,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.03,
    shadowRadius: 16,
    elevation: 2,
  },
  problemCard: {
    borderColor: '#FEE2E2',
  },
  solutionCard: {
    borderColor: '#DBEAFE',
  },
  pillarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },
  pillarIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  problemIcon: {
    backgroundColor: '#FEF2F2',
  },
  solutionIcon: {
    backgroundColor: '#EFF6FF',
  },
  pillarTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  bulletList: {
    gap: 16,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bulletMarkBadge: {
    marginTop: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDanger: {
    backgroundColor: '#FEE2E2',
  },
  badgeSuccess: {
    backgroundColor: '#D1FAE5',
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
    color: '#475569',
  },
  sectionHeading: {
    gap: 8,
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 10,
  },
  sectionKicker: {
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  sectionTitleTiny: {
    fontSize: 26,
    lineHeight: 32,
  },
  sectionBody: {
    maxWidth: 600,
    fontSize: 16,
    lineHeight: 24,
    color: '#64748B',
    textAlign: 'center',
  },
  founderWrap: {
    alignItems: 'center',
  },
  founderCard: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderRadius: 28,
    padding: 32,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    transitionProperty: 'all',
    transitionDuration: '200ms',
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 45, // Premium squircle
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    paddingTop: 15, 
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  memberName: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  memberRole: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#2563EB',
  },
  memberDesc: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 24,
    color: '#64748B',
  },
  teamGrid: {
    gap: 20,
  },
  teamGridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  teamGridDesktop: {
    gap: 24,
  },
  teamCard: {
    width: '100%',
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
    transitionProperty: 'all',
    transitionDuration: '200ms',
  },
  teamCardWide: {
    flexBasis: '46%',
    flexGrow: 1,
    maxWidth: 380,
  },
  teamCardDesktop: {
    flexBasis: '22%',
    flexGrow: 0,
    maxWidth: 280,
  },
  teamCardActive: {
    borderColor: '#BFDBFE',
    transform: [{ translateY: -6 }],
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  avatarSmall: {
    width: 120,
    height: 120,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
    paddingTop: 12,
  },
  avatarTextSmall: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  memberPhoto: {
    width: '85%',
    height: '85%',
    resizeMode: 'contain',
  },
  memberNameSmall: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  memberRoleSmall: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  memberDescSmall: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
    color: '#64748B',
    maxWidth: 240,
  },
  ctaPanel: {
    borderRadius: 32,
    padding: 40,
    backgroundColor: '#0B1120', // Very deep rich dark blue
    gap: 24,
    alignItems: 'center',
    marginTop: 20,
    overflow: 'hidden', // Contains the decorative circles
    position: 'relative',
  },
  ctaCircle1: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 250,
    backgroundColor: 'rgba(37, 99, 235, 0.2)', // Soft primary glow
  },
  ctaCircle2: {
    position: 'absolute',
    bottom: -80,
    left: -40,
    width: 200,
    height: 200,
    borderRadius: 200,
    backgroundColor: 'rgba(56, 189, 248, 0.1)', // Soft cyan glow
  },
  ctaTextBlock: {
    gap: 12,
    alignItems: 'center',
    zIndex: 1, // Keep text above circles
  },
  ctaKicker: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 2,
  },
  ctaTitle: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    maxWidth: 500,
    letterSpacing: -0.5,
  },
  ctaTitleTiny: {
    fontSize: 24,
    lineHeight: 32,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 999,
    backgroundColor: '#ffffff', // Stark white button on dark background
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  ctaButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },
});
