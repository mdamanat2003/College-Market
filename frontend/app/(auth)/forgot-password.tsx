import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';

const COLORS = {
  background: '#09090b',
  card: '#18181b',
  primary: '#38BDF8', // Sky 400
  primaryHover: '#0ea5e9',
  focus: '#7dd3fc',
  heading: '#F8FAFC',
  label: '#E2E8F0',
  placeholder: '#64748B',
  border: '#27272a',
  link: '#38BDF8',
  error: '#EF4444',
  success: '#10B981',
  helper: '#94A3B8',
};

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const router = useRouter();

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Enter email', 'Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      if (response.data.success) {
        Alert.alert('OTP Sent', 'Check your email for the 6-digit code.');
        setStep(2);
      } else {
        Alert.alert('Error', response.data.message || 'Unable to send OTP. Please try again.');
      }
    } catch (err: any) {
      console.error('Send OTP failed', err);
      Alert.alert('Error', err.response?.data?.message || 'Unable to send OTP. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!otp) {
      Alert.alert('Enter OTP', 'Please enter the 6-digit verification code.');
      return;
    }
    if (!newPassword) {
      Alert.alert('Enter Password', 'Please enter your new password.');
      return;
    }
    if (newPassword.length < 8 || newPassword.length > 12) {
      Alert.alert('Weak Password', 'Password must be between 8 and 12 characters.');
      return;
    }
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      Alert.alert('Invalid Password', 'Password must include uppercase, lowercase, number, and special character.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword: newPassword.trim(),
      });
      if (response.data.success) {
        Alert.alert('Success', 'Password has been reset successfully! You can now log in.');
        router.replace('/login');
      } else {
        Alert.alert('Error', response.data.message || 'Reset password failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Reset password failed', err);
      Alert.alert('Error', err.response?.data?.message || 'Unable to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.formWrapper}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={COLORS.heading} />
            </TouchableOpacity>
            
            <Text style={styles.title}>Reset Password 🔒</Text>
            
            {step === 1 ? (
              <>
                <Text style={styles.subtitle}>Enter your registered email address and we will send you a 6-digit OTP.</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={[styles.input, focusedField === 'email' && styles.inputFocused]}
                    placeholder="you@college.edu"
                    placeholderTextColor={COLORS.placeholder}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={setEmail}
                  />
                </View>

                <TouchableOpacity style={styles.button} onPress={handleSendOTP} disabled={loading}>
                  {loading ? <ActivityIndicator color="#09090b" /> : <Text style={styles.buttonText}>Send OTP</Text>}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.subtitle}>Enter the 6-digit code sent to your email and choose a new password.</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Verification Code (OTP)</Text>
                  <TextInput
                    style={[styles.input, focusedField === 'otp' && styles.inputFocused]}
                    placeholder="Enter 6-digit OTP"
                    placeholderTextColor={COLORS.placeholder}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onFocus={() => setFocusedField('otp')}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={setOtp}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.passwordInputWrap}>
                    <TextInput
                      style={[styles.input, styles.passwordInput, focusedField === 'newPassword' && styles.inputFocused]}
                      placeholder="8-12 chars, e.g. Campus@12"
                      placeholderTextColor={COLORS.placeholder}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      value={newPassword}
                      onFocus={() => setFocusedField('newPassword')}
                      onBlur={() => setFocusedField(null)}
                      onChangeText={setNewPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword((current) => !current)}
                    >
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={COLORS.helper} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirm New Password</Text>
                  <View style={styles.passwordInputWrap}>
                    <TextInput
                      style={[styles.input, styles.passwordInput, focusedField === 'confirmPassword' && styles.inputFocused]}
                      placeholder="Retype new password"
                      placeholderTextColor={COLORS.placeholder}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      value={confirmPassword}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowConfirmPassword((current) => !current)}
                    >
                      <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={COLORS.helper} />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
                  {loading ? <ActivityIndicator color="#09090b" /> : <Text style={styles.buttonText}>Reset Password</Text>}
                </TouchableOpacity>

                <TouchableOpacity style={styles.resendBtn} onPress={() => setStep(1)} disabled={loading}>
                  <Text style={styles.resendText}>← Change Email / Request New OTP</Text>
                </TouchableOpacity>
              </>
            )}
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
    maxWidth: 450,
    backgroundColor: COLORS.card,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.04,
    shadowRadius: 35,
    elevation: 3, 
  },
  backBtn: { 
    alignSelf: 'flex-start',
    marginBottom: 20,
    padding: 5,
    marginLeft: -5,
  },
  title: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: COLORS.heading, 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 15, 
    color: COLORS.helper, 
    marginBottom: 25, 
    lineHeight: 22 
  },
  inputGroup: { 
    gap: 8,
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    color: COLORS.label,
  },
  input: { 
    minHeight: 54,
    borderWidth: 1, 
    borderColor: COLORS.border, 
    paddingVertical: 14,
    paddingHorizontal: 16, 
    borderRadius: 14, 
    fontSize: 16, 
    backgroundColor: COLORS.card,
    color: COLORS.heading,
  },
  inputFocused: {
    borderColor: COLORS.focus,
  },
  passwordInputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 52,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    height: 44,
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  button: { 
    width: '100%',
    minHeight: 56,
    backgroundColor: COLORS.primary, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: 'rgba(56, 189, 248, 0.26)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 22,
    elevation: 4,
  },
  buttonText: { 
    color: '#09090b', 
    fontSize: 16, 
    fontWeight: '800',
  },
  resendBtn: {
    marginTop: 20,
    alignSelf: 'center',
    padding: 5,
  },
  resendText: {
    color: COLORS.link,
    fontSize: 14,
    fontWeight: '700',
  }
});