import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { COLORS, SPACING, RADIUS } from '../../theme/colors';

export default function AdminLoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const handleAdminLogin = async () => {
    setErrorMsg(null);
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setErrorMsg('Please enter both admin email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await login({ email: normalizedEmail, password });
      setIsSubmitting(false);

      if (success) {
        const currentUser = useAuthStore.getState().user;
        if (currentUser?.role === 'admin') {
          router.replace('/admin/dashboard');
        } else {
          // If non-admin tries to log in through admin portal
          useAuthStore.getState().logout();
          setErrorMsg('Access Denied. This account is not an authorized administrator.');
        }
      } else {
        const storeErr = useAuthStore.getState().error;
        setErrorMsg(storeErr || 'Invalid admin credentials.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorMsg('Server connection failed. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            {/* Header Badge */}
            <View style={styles.badgeWrap}>
              <Ionicons name="shield-checkmark" size={28} color="#EF4444" />
              <Text style={styles.badgeText}>ADMIN PORTAL</Text>
            </View>

            <Text style={styles.title}>Login as a administrator</Text>
            <Text style={styles.subtitle}>Enter your secure credentials to manage Ooplabdh</Text>

            {errorMsg ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Admin Email</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="admin@ooplabdh.shop"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••••••"
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity 
              style={styles.submitBtn} 
              onPress={handleAdminLogin}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Ionicons name="key-outline" size={18} color="#000" style={{ marginRight: 6 }} />
                  <Text style={styles.submitBtnText}>Authenticate Admin</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => router.replace('/home')}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={16} color={COLORS.textMuted} />
              <Text style={styles.backBtnText}>Return to Main Site</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING.md },
  
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 440,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    gap: SPACING.md,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },

  badgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    gap: 6,
  },
  badgeText: { color: '#EF4444', fontSize: 12, fontWeight: '800', letterSpacing: 1 },

  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginTop: SPACING.xs },
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: -4 },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
  },
  errorText: { color: '#EF4444', fontSize: 13, flex: 1, fontWeight: '600' },

  inputGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: SPACING.md,
  },
  inputIcon: { marginRight: SPACING.xs },
  input: { flex: 1, height: 48, color: COLORS.text, fontSize: 14 },
  eyeBtn: { padding: SPACING.xs },

  submitBtn: {
    backgroundColor: '#38BDF8',
    height: 48,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  submitBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },

  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    marginTop: SPACING.xs,
  },
  backBtnText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
});
