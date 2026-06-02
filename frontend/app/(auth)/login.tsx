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
  Alert,
  ScrollView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

const COLORS = {
  background: '#F5F7FB',
  card: '#FFFFFF',
  signIn: '#2563EB',
  focus: '#7C9DF0',
  heading: '#1E293B',
  label: '#374151',
  placeholder: '#94A3B8',
  border: '#DCE3EE',
  link: '#2563EB',
  error: '#EF4444',
  success: '#16A34A',
  helper: '#64748B',
};

type LoginFieldName = 'email' | 'password';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [focusedField, setFocusedField] = useState<LoginFieldName | null>(null);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [forgotHovered, setForgotHovered] = useState(false);
  const [footerHovered, setFooterHovered] = useState(false);
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const inputStyle = (field: LoginFieldName, hasError: boolean) => [
    styles.input,
    focusedField === field && styles.inputFocused,
    hasError && styles.inputError,
  ];

  const setFieldError = (field: LoginFieldName, message: string) => {
    setFieldErrors((current) => ({ ...current, [field]: message }));
  };

  const mapLoginError = (message: string) => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('email')) return { email: message };
    if (lowerMessage.includes('password')) return { password: message };
    return { password: message };
  };

  const handleLogin = async () => {
    setFieldErrors({});

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setFieldError('email', 'Email is required.');
    }

    if (!password) {
      setFieldError('password', 'Password is required.');
    }

    if (!normalizedEmail || !password) {
      return;
    }

    try {
      const ok = await login({ email: normalizedEmail, password });
      if (ok) {
        Alert.alert('Welcome back!', `Hi ${normalizedEmail}`);
        const currentUser = useAuthStore.getState().user;

        if (isAdminLogin && currentUser?.role !== 'admin') {
          setFieldError('password', 'This account is not an admin. Please login with an admin account.');
          return;
        }

        if (currentUser?.role === 'admin') {
          router.replace('/admin/dashboard');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        setFieldErrors(mapLoginError(useAuthStore.getState().error || 'Login failed'));
      }
    } catch (err) {
      console.error('Login error:', err);
      setFieldError('password', 'Server error. Is the backend running?');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.pageShell}>
            <View style={styles.hero}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to continue to CampusCart</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.form}>
                <View style={styles.userTypeRow}>
                  <TouchableOpacity
                    onPress={() => setIsAdminLogin(false)}
                    style={[styles.userTypePill, !isAdminLogin && styles.userTypePillActive]}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.userTypeText, !isAdminLogin && styles.userTypeTextActive]}>User Login</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setIsAdminLogin(true)}
                    style={[styles.userTypePill, isAdminLogin && styles.userTypePillActive]}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.userTypeText, isAdminLogin && styles.userTypeTextActive]}>Admin Login</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={inputStyle('email', Boolean(fieldErrors.email))}
                    placeholder={isAdminLogin ? 'admin@campus.edu' : 'you@college.edu'}
                    placeholderTextColor={COLORS.placeholder}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={email}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (fieldErrors.email) setFieldErrors((current) => ({ ...current, email: undefined }));
                    }}
                  />
                  {fieldErrors.email ? <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text> : null}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.passwordInputWrap}>
                    <TextInput
                      style={[...inputStyle('password', Boolean(fieldErrors.password)), styles.passwordInput]}
                      placeholder="Enter your password"
                      placeholderTextColor={COLORS.placeholder}
                      secureTextEntry={!showPassword}
                      value={password}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (fieldErrors.password) setFieldErrors((current) => ({ ...current, password: undefined }));
                      }}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword((current) => !current)}
                      accessibilityRole="button"
                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={COLORS.helper} />
                    </TouchableOpacity>
                  </View>
                  {fieldErrors.password ? <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text> : null}
                </View>

                <TouchableOpacity
                  style={styles.forgotPassword}
                  onPress={() => router.push('/forgot-password')}
                  onHoverIn={() => setForgotHovered(true)}
                  onHoverOut={() => setForgotHovered(false)}
                >
                  <Text style={[styles.forgotPasswordText, forgotHovered && styles.linkHovered]}>Forgot password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, isButtonHovered && styles.buttonHovered]}
                  onPress={handleLogin}
                  onHoverIn={() => setIsButtonHovered(true)}
                  onHoverOut={() => setIsButtonHovered(false)}
                  activeOpacity={0.86}
                >
                  <Text style={styles.buttonText}>Sign In</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Don't have an account? </Text>
                  <Link href="/register" asChild>
                    <TouchableOpacity onHoverIn={() => setFooterHovered(true)} onHoverOut={() => setFooterHovered(false)}>
                      <Text style={[styles.footerLink, footerHovered && styles.linkHovered]}>Sign Up</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1 },
  container: {
    flexGrow: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 28,
  },
  pageShell: {
    width: '100%',
    maxWidth: 460,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 22,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800',
    color: COLORS.heading,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.helper,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 14px 35px rgba(30, 41, 59, 0.08)',
    elevation: 3,
  },
  form: { gap: 16 },
  userTypeRow: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 999,
    padding: 4,
  },
  userTypePill: {
    flex: 1,
    minHeight: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userTypePillActive: {
    borderColor: COLORS.signIn,
    backgroundColor: '#EFF6FF',
  },
  userTypeText: {
    color: COLORS.label,
    fontSize: 14,
    fontWeight: '700',
  },
  userTypeTextActive: {
    color: COLORS.signIn,
  },
  inputGroup: { gap: 8 },
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
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: COLORS.heading,
    transitionProperty: 'border-color, box-shadow, background-color',
    transitionDuration: '180ms',
  },
  inputFocused: {
    borderColor: COLORS.focus,
    boxShadow: '0 0 0 3px rgba(124, 157, 240, 0.14)',
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: '#FFFBFB',
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
    elevation: 10,
  },
  fieldErrorText: {
    color: COLORS.error,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  forgotPasswordText: {
    color: COLORS.link,
    fontWeight: '700',
    fontSize: 14,
  },
  linkHovered: {
    textDecorationLine: 'underline',
  },
  button: {
    width: '100%',
    minHeight: 56,
    backgroundColor: COLORS.signIn,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    boxShadow: '0 10px 22px rgba(37, 99, 235, 0.24)',
    elevation: 4,
    transitionProperty: 'box-shadow, opacity, transform',
    transitionDuration: '180ms',
  },
  buttonHovered: {
    boxShadow: '0 14px 28px rgba(37, 99, 235, 0.28)',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 2,
  },
  footerText: {
    color: COLORS.helper,
    fontSize: 15,
  },
  footerLink: {
    color: COLORS.link,
    fontSize: 15,
    fontWeight: '800',
  },
});
