import React, { useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from 'react-native';

import Footer from '../components/layout/Footer';
import { PublicNavbar } from '../components/layout/PublicNavbar';
import { COLORS, RADIUS, SPACING } from '../theme/colors';

export default function Contact() {
  const scrollRef = useRef<ScrollView>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const { width } = useWindowDimensions();
  const isCompact = width < 640;
  const isTiny = width < 390;

  return (
    <ScrollView ref={scrollRef} style={styles.page} contentContainerStyle={[styles.content, isTiny && styles.contentTiny]}>
      <View style={styles.glowBlue} />
      <View style={styles.glowMint} />

      <PublicNavbar activeRoute="contact" />

      <View style={[styles.hero, isCompact && styles.heroCompact]}>
        <View style={styles.heroTextBlock}>
          <Text style={styles.kicker}>Contact</Text>
          <Text style={[styles.title, isCompact && styles.titleCompact, isTiny && styles.titleTiny]}>
            Get in touch with Ooplabdh.
          </Text>
          <Text style={styles.body}>
            Have a question, feedback, or partnership idea? Send us a message and we will get back to you.
          </Text>
        </View>

        <View style={[styles.formCard, isTiny && styles.formCardTiny]}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} placeholder="Your name" placeholderTextColor={COLORS.textMuted} value={name} onChangeText={setName} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@college.edu"
              placeholderTextColor={COLORS.textMuted}
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
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={message}
              onChangeText={setMessage}
            />
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={async () => {
            try {
              const { api } = await import('../services/api');
              await api.post('/requests', { name, email, message });
              setName(''); setEmail(''); setMessage('');
              alert('Message sent — admin will review it soon.');
            } catch (err) {
              console.error('Send message failed', err);
              alert('Failed to send message');
            }
          }}>
            <Text style={styles.primaryButtonText}>Send Message</Text>
            <Ionicons name="send-outline" size={16} color={COLORS.background} />
          </TouchableOpacity>
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
  },
  contentTiny: {
    paddingHorizontal: 10,
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
    gap: SPACING.lg,
    alignItems: 'stretch',
    width: '100%',
  },
  heroCompact: {
    flexDirection: 'column',
  },
  heroTextBlock: {
    flex: 1,
    gap: 12,
    justifyContent: 'center',
    minWidth: 0,
  },
  kicker: {
    textTransform: 'uppercase',
    letterSpacing: 3,
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  title: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '900',
    color: COLORS.primary,
  },
  titleCompact: {
    fontSize: 30,
    lineHeight: 36,
  },
  titleTiny: {
    fontSize: 26,
    lineHeight: 32,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.textMuted,
    maxWidth: 560,
  },
  formCard: {
    flex: 1,
    borderRadius: 28,
    padding: SPACING.lg,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 14,
    minWidth: 0,
  },
  formCardTiny: {
    borderRadius: 22,
    padding: SPACING.md,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  textArea: {
    minHeight: 140,
  },
  primaryButton: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '700',
  },
});
