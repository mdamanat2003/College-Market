import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  background: '#09090b',
  card: '#18181b',
  primary: '#38BDF8',
  primaryHover: '#0ea5e9',
  heading: '#F8FAFC',
  label: '#E2E8F0',
  placeholder: '#64748B',
  border: '#27272a',
  link: '#38BDF8',
  error: '#EF4444',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.1)',
  warningBorder: 'rgba(245, 158, 11, 0.25)',
  helper: '#94A3B8',
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.formWrapper}>
            <TouchableOpacity onPress={() => router.replace('/login')} style={styles.backToHomeBtn}>
              <Ionicons name="arrow-back" size={16} color={COLORS.link} />
              <Text style={styles.backToHomeText}>Back to Login</Text>
            </TouchableOpacity>

            <View style={styles.iconHeaderContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="lock-closed" size={32} color={COLORS.warning} />
              </View>
            </View>

            <Text style={styles.title}>Password Reset Disabled</Text>
            
            <View style={styles.noticeBox}>
              <View style={styles.noticeHeader}>
                <Ionicons name="warning-outline" size={20} color={COLORS.warning} />
                <Text style={styles.noticeTitle}>Feature Unavailable</Text>
              </View>
              <Text style={styles.noticeText}>
                Because OTP verification is currently disabled in system settings, password reset has been deactivated to prevent unauthorized account access.
              </Text>
              <Text style={[styles.noticeText, { marginTop: 8 }]}>
                OTP वेरिफिकेशन बंद होने के कारण, सुरक्षा कारणों से पासवर्ड रिसेट की सुविधा अस्थायी रूप से बंद कर दी गई है।
              </Text>
            </View>

            <View style={styles.supportBox}>
              <Text style={styles.supportTitle}>Need Help Accessing Your Account?</Text>
              <Text style={styles.supportText}>
                Please reach out directly to the college marketplace admin or support team for account assistance.
              </Text>
            </View>

            <TouchableOpacity 
              style={[styles.button, isButtonHovered && styles.buttonHovered]} 
              onPress={() => router.replace('/login')} 
              {...{
                onHoverIn: () => setIsButtonHovered(true),
                onHoverOut: () => setIsButtonHovered(false),
              } as any}
            >
              <Text style={styles.buttonText}>Return to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  keyboardView: { 
    flex: 1 
  },
  container: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
  },
  formWrapper: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: COLORS.card,
    padding: 28,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      web: {
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45), 0 0 20px rgba(245, 158, 11, 0.05)',
      } as any,
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.4,
        shadowRadius: 30,
        elevation: 8,
      },
    }),
  },
  iconHeaderContainer: {
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.warningBg,
    borderWidth: 1,
    borderColor: COLORS.warningBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: COLORS.heading, 
    marginBottom: 20,
    textAlign: 'center',
  },
  noticeBox: {
    backgroundColor: COLORS.warningBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.warningBorder,
    padding: 18,
    marginBottom: 20,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.warning,
  },
  noticeText: {
    fontSize: 14,
    color: COLORS.label,
    lineHeight: 20,
  },
  supportBox: {
    backgroundColor: '#09090b',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  supportTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.heading,
    marginBottom: 6,
  },
  supportText: {
    fontSize: 13,
    color: COLORS.helper,
    lineHeight: 18,
  },
  button: { 
    width: '100%',
    minHeight: 52,
    backgroundColor: COLORS.primary, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: 'rgba(56, 189, 248, 0.26)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
    ...Platform.select({
      web: {
        transitionProperty: 'all',
        transitionDuration: '200ms',
        boxShadow: '0 8px 16px rgba(56, 189, 248, 0.15)',
      } as any,
      default: {},
    }),
  },
  buttonHovered: {
    transform: [{ translateY: -2 }, { scale: 1.01 }],
    ...Platform.select({
      web: { 
        boxShadow: '0 14px 28px rgba(56, 189, 248, 0.32)',
        filter: 'brightness(1.05)',
      } as any,
      default: {},
    }),
  },
  buttonText: { 
    color: '#09090b', 
    fontSize: 16, 
    fontWeight: '800',
  },
  backToHomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  backToHomeText: {
    color: COLORS.link,
    fontSize: 14,
    fontWeight: '700',
  },
});