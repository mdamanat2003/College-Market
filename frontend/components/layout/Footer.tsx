import React from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COLORS, SPACING } from '../../theme/colors';

type FooterProps = {
  onBackToTop?: () => void;
};

export default function Footer({ onBackToTop }: FooterProps) {
  const router = useRouter();

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

  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>CampusCart 2026. All rights reserved.</Text>

      <View style={styles.footerLinks}>
        <TouchableOpacity style={styles.footerLinkButton} onPress={() => router.push('/about')}>
          <Text style={styles.footerLink}>About</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerLinkButton} onPress={() => router.push('/home')}>
          <Text style={styles.footerLink}>Features</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerLinkButton} onPress={() => router.push('/contact')}>
          <Text style={styles.footerLink}>Contact</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.footerLinkButton} onPress={scrollToTop}>
          <Text style={styles.footerLink}>Back to top</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 42,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary,
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
});
