import React, { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View, Platform } from 'react-native';

import Footer from '../components/layout/Footer';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { COLORS, RADIUS, SPACING } from '../theme/colors';

export default function Contact() {
  const scrollRef = useRef<ScrollView>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { width } = useWindowDimensions();

  const isDesktop = width >= 800;
  const isMobile = width < 800;
  const isTiny = width < 380;

  return (
    <ScrollView ref={scrollRef} style={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.glowBlue} />
      <View style={styles.glowMint} />

      <View style={[styles.content, isMobile && styles.contentMobile, isTiny && styles.contentTiny]}>
        <PublicNavbar activeRoute="contact" />

        <View style={[styles.hero, isMobile && styles.heroMobile]}>
          {/* 1. TOP: Left Column (Text & Heading) */}
          <View style={[styles.heroTextBlock, isDesktop && styles.heroTextBlockDesktop]}>
            <Text style={styles.kicker}>Contact Us</Text>
            <Text style={[styles.title, isMobile && styles.titleMobile, isTiny && styles.titleTiny]}>
              Get in touch with Ooplabdh.
            </Text>
            <Text style={styles.body}>
              Have a question, feedback, or partnership idea? Send us a message and we will get back to you.
            </Text>
          </View>

          {/* 2. DOWN: Right Column (Contact Form) */}
          <View style={[styles.formCard, isDesktop && styles.formCardDesktop, isMobile && styles.formCardMobile, isTiny && styles.formCardTiny]}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Your name" 
                placeholderTextColor="#CBD5E1" 
                value={name} 
                onChangeText={setName} 
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="you@college.edu"
                placeholderTextColor="#CBD5E1"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Message</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="How can we help?"
                placeholderTextColor="#CBD5E1"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={message}
                onChangeText={setMessage}
              />
            </View>

            <TouchableOpacity 
              testID="sell-btn"
              style={styles.primaryButton} 
              activeOpacity={0.8}
              onPress={async () => {
                if (!name || !email || !message) {
                  alert('Please fill in all fields.');
                  return;
                }
                try {
                  const { api } = await import('../services/api');
                  await api.post('/requests', { name, email, message });
                  setName(''); setEmail(''); setMessage('');
                  alert('Message sent — admin will review it soon.');
                } catch (err) {
                  console.error('Send message failed', err);
                  alert('Failed to send message');
                }
              }}
            >
              <Text style={styles.primaryButtonText}>Send Message</Text>
              <Ionicons name="send-outline" size={16} color="#09090b" />
            </TouchableOpacity>
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
    paddingBottom: SPACING.xl,
    gap: SPACING.xl,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  contentMobile: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: SPACING.lg,
  },
  contentTiny: {
    paddingHorizontal: 12,
  },
  glowBlue: {
    position: 'absolute',
    top: 50,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(59,130,246,0.08)',
  },
  glowMint: {
    position: 'absolute',
    top: 250,
    left: -110,
    width: 260,
    height: 260,
    borderRadius: 260,
    backgroundColor: 'rgba(16,185,129,0.06)',
  },
  hero: {
    flexDirection: 'row',
    gap: 32,
    alignItems: 'flex-start',
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
    marginTop: 10,
  },
  heroMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 24,
    marginTop: 0,
  },
  heroTextBlock: {
    width: '100%',
    gap: 12,
    justifyContent: 'center',
    minWidth: 0,
  },
  heroTextBlockDesktop: {
    flex: 1,
  },
  kicker: {
    textTransform: 'uppercase',
    letterSpacing: 3,
    fontSize: 15,
    color: '#38BDF8',
    fontWeight: '800',
  },
  title: {
    fontSize: 38,
    lineHeight: 44,
    fontWeight: '900',
    color: COLORS.primary,
  },
  titleMobile: {
    fontSize: 32,
    lineHeight: 38,
  },
  titleTiny: {
    fontSize: 24,
    lineHeight: 30,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    color: COLORS.textMuted,
    maxWidth: 540,
  },
  formCard: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 24,
    padding: SPACING.xl,
    backgroundColor: 'rgba(24, 24, 27, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 14,
    minWidth: 0,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
      } as any,
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 6,
      },
    }),
  },
  formCardDesktop: {
    flex: 1,
  },
  formCardMobile: {
    borderRadius: 20,
    padding: SPACING.lg,
    gap: 12,
    alignSelf: 'center',
  },
  formCardTiny: {
    padding: SPACING.md,
    borderRadius: 16,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(39, 39, 42, 0.65)',
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: '#F8FAFC',
    width: '100%',
  },
  textArea: {
    minHeight: 100,
    height: 110,
    paddingTop: 10,
  },
  primaryButton: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: RADIUS.round,
    backgroundColor: '#38BDF8',
    width: '100%',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 16px rgba(56, 189, 248, 0.35)',
      } as any,
      default: {
        shadowColor: '#38BDF8',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
      },
    }),
  },
  primaryButtonText: {
    color: '#09090b',
    fontSize: 14.5,
    fontWeight: '800',
  },
});
