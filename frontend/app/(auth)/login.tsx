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
  background: '#09090b',
  card: '#18181b',
  signIn: '#38BDF8', // Sky 400
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

type LoginFieldName = 'email' | 'password';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
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
        const currentUser = useAuthStore.getState().user;

        if (currentUser?.role === 'admin') {
          useAuthStore.getState().logout();
          setFieldError('email', 'Admin login is not allowed from here. Please use the Admin Portal.');
          return;
        }

        Alert.alert('Welcome back!', `Hi ${normalizedEmail}`);
        router.replace('/(tabs)');
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
              <Text style={styles.subtitle}>Sign in to continue to Ooplabdh</Text>
            </View>

            <View style={styles.card}>
              <TouchableOpacity 
                onPress={() => {
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace('/home');
                  }
                }} 
                style={styles.backToHomeBtn}
              >
                <Ionicons name="arrow-back" size={16} color={COLORS.link} />
                <Text style={styles.backToHomeText}>Back to Home</Text>
              </TouchableOpacity>
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={inputStyle('email', Boolean(fieldErrors.email))}
                    placeholder="you@college.edu"
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
  {...{ 
    onHoverIn: () => setForgotHovered(true), 
    onHoverOut: () => setForgotHovered(false) 
  } as any}
>
                  <Text style={[styles.forgotPasswordText, forgotHovered && styles.linkHovered]}>Forgot password?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, isButtonHovered && styles.buttonHovered]}
                  onPress={handleLogin}
                  {...{ 
                    onHoverIn: () => setIsButtonHovered(true), 
                    onHoverOut: () => setIsButtonHovered(false) 
                  } as any}
                  activeOpacity={0.86}
                >
                  <Text style={styles.buttonText}>Sign In</Text>
                </TouchableOpacity>



                <View style={styles.footer}>
                  <Text style={styles.footerText}>Don't have an account? </Text>
                  <Link href="/register" asChild>
                    <TouchableOpacity {...{ 
                      onHoverIn: () => setFooterHovered(true), 
                      onHoverOut: () => setFooterHovered(false) 
                    } as any  }>
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
    maxWidth: 500,
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
    borderRadius: 24,
    padding: 28,
    ...Platform.select({
      web: {
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45), 0 0 20px rgba(56, 189, 248, 0.04)',
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
  form: { gap: 16 },
  userTypeRow: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
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
    backgroundColor: COLORS.signIn,
    borderColor: COLORS.signIn,
  },
  userTypeText: {
    color: COLORS.label,
    fontSize: 14,
    fontWeight: '700',
  },
  userTypeTextActive: {
    color: '#09090b',
    fontWeight: '800',
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
    ...Platform.select({
      web: {
        transitionProperty: 'all',
        transitionDuration: '200ms',
      } as any,
      default: {},
    }),
  },
  inputFocused: {
    borderColor: '#38BDF8',
    backgroundColor: '#09090b',
    ...Platform.select({
      web: { 
        boxShadow: '0 0 0 4px rgba(56, 189, 248, 0.2)',
        outline: 'none',
      } as any,
      default: {},
    }),
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
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
    shadowColor: 'rgba(56, 189, 248, 0.24)',
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
  backToHomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 18,
    alignSelf: 'flex-start',
  },
  backToHomeText: {
    color: COLORS.link,
    fontSize: 14,
    fontWeight: '700',
  },
});
