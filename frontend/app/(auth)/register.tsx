import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Alert,
  useWindowDimensions,
  DimensionValue,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { COLLEGES } from '../../constants/colleges';
import { useAuthStore } from '../../store/authStore';

const COLORS = {
  background: '#09090b',
  card: '#18181b',
  primary: '#38BDF8', // Sky 400
  primaryHover: '#0ea5e9',
  heading: '#F8FAFC',
  label: '#E2E8F0',
  placeholder: '#64748B',
  border: '#27272a',
  link: '#38BDF8',
  success: '#10B981',
  error: '#EF4444',
  helper: '#94A3B8',
};

type RegisterFieldName =
  | 'name'
  | 'email'
  | 'phone'
  | 'college'
  | 'confirmEmail'
  | 'otherCollege'
  | 'password'
  | 'confirmPassword';

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, 'Full name must be at least 3 characters.')
      .max(50, 'Full name must be at most 50 characters.'),
    email: z.string().trim().email('Enter a valid email address.').transform((value) => value.toLowerCase()),
    phone: z.string().trim().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits.'),
    college: z.string().optional(),
    confirmEmail: z.string().trim().min(1, 'Confirm your email or enter an alternate contact.'),
    otherCollege: z.string().optional(),
    password: z
      .string()
      .trim()
      .min(8, 'Password must be at least 8 characters.')
      .max(12, 'Password must be at most 12 characters.')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter.')
      .regex(/[a-z]/, 'Password must include at least one lowercase letter.')
      .regex(/[0-9]/, 'Password must include at least one number.')
      .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must include at least one special character.'),
    confirmPassword: z.string().trim().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })
  .refine((data) => data.confirmEmail.toLowerCase() === data.email || /^\d{10}$/.test(data.confirmEmail), {
    message: 'Enter matching email or a 10 digit alternate contact.',
    path: ['confirmEmail'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const getPasswordStrength = (password: string): { label: string, color: string, width: DimensionValue } => {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[!@#$%^&*(),.?":{}|<>]/.test(password),
  ];
  const score = checks.filter(Boolean).length;

  if (!password) return { label: 'Enter a password', color: COLORS.helper, width: '0%' };
  if (score <= 2) return { label: 'Weak password', color: COLORS.error, width: '34%' };
  if (score <= 4) return { label: 'Good password', color: '#F59E0B', width: '68%' };
  return { label: 'Strong password', color: COLORS.success, width: '100%' };
};

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCollegeList, setShowCollegeList] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [focusedField, setFocusedField] = useState<RegisterFieldName | 'emailOtp' | null>(null);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 900;
  const router = useRouter();
  const registerStore = useAuthStore((s) => s.register);
  const sendOtpStore = useAuthStore((s) => s.sendRegistrationOtp);
  const verifyOtpStore = useAuthStore((s) => s.verifyRegistrationOtp);
  const authError = useAuthStore((s) => s.error);

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors, isValid, isSubmitting },
    setError,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      college: '',
      confirmEmail: '',
      otherCollege: '',
      password: '',
      confirmPassword: '',
    },
  });

  const watchedEmail = watch('email');
  const watchedPhone = watch('phone');
  const watchedCollege = watch('college');
  const watchedPassword = watch('password') || '';
  const passwordStrength = getPasswordStrength(watchedPassword);

  const inputStyle = (field: string, hasError: boolean) => [
    styles.input,
    focusedField === field && styles.inputFocused,
    hasError && styles.inputError,
  ];

  const handleSendOtp = async () => {
    setServerError('');
    const email = getValues('email');
    const phone = getValues('phone');

    if (!email || !phone || errors.email || errors.phone) {
      Alert.alert('Error', 'Please enter a valid email and phone number first.');
      return;
    }

    const result = await sendOtpStore({ email, phone });
    if (result.success) {
      setIsOtpSent(true);
      Alert.alert('OTP Sent', 'Please check your email for the verification code.');
    } else {
      setServerError(result.message || 'Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async () => {
    setServerError('');
    if (!emailOtp) {
      Alert.alert('Error', 'Please enter the email OTP.');
      return;
    }

    const email = getValues('email');

    const result = await verifyOtpStore({ email, emailOtp });
    if (result.success) {
      setIsVerified(true);
      Alert.alert('Verified!', 'Your email has been verified. You can now complete registration.');
    } else {
      setServerError(result.message || 'OTP verification failed.');
    }
  };

  const mapServerErrorToField = (message: string): keyof RegisterFormValues | null => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('username')) return 'email';
    if (lowerMessage.includes('email')) return 'email';
    if (lowerMessage.includes('phone')) return 'phone';
    if (lowerMessage.includes('name')) return 'name';
    if (lowerMessage.includes('password')) return 'password';
    return null;
  };

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError('');

    if (!isVerified) {
      Alert.alert('Verification Required', 'Please verify your email and phone number before registering.');
      return;
    }

    try {
      if (values.college === 'Other') {
        if (!values.otherCollege || !values.otherCollege.trim() || values.otherCollege.trim().length < 3) {
          setError('otherCollege', { type: 'manual', message: 'Please enter your college name (min 3 chars).' });
          return;
        }
      }

      const selectedCollege = values.college === 'Other' ? (values.otherCollege || '').trim() : (values.college || '').trim();
      const emailLocalPart = values.email.split('@')[0].replace(/[^A-Za-z0-9_]/g, '_').slice(0, 15) || 'campus_user';
      const generatedUsername = `${emailLocalPart}_${values.phone.slice(-4)}`;

      const ok = await registerStore({
        name: values.name.trim(),
        username: generatedUsername,
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim(),
        password: values.password.trim(),
        college: selectedCollege,
      });

      if (ok) {
        Alert.alert('Success!', 'Your account has been created.');
        router.replace('/login');
      } else {
        const message = authError || 'Registration failed.';
        const field = mapServerErrorToField(message);

        if (field) {
          setError(field, { type: 'server', message });
        } else {
          setServerError(message);
        }
      }
    } catch (error) {
      console.error('Register request failed:', error);
      setServerError('Server error. Please check that the backend is running.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={[styles.container, isDesktop && styles.containerDesktop]} showsVerticalScrollIndicator={false}>
          <View style={styles.pageShell}>
            <View style={styles.hero}>
              <Text style={styles.heroTitle}>Create Your Account</Text>
              <Text style={styles.heroSubtitle}>Join Ooplabdh and start trading with your campus community.</Text>
            </View>

            {serverError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{serverError}</Text>
              </View>
            ) : null}

            <View style={styles.card}>
              <View style={styles.form}>
                <View style={styles.inputGroupFull}>
                  <Text style={styles.label}>Full Name</Text>
                  <Controller
                    control={control}
                    name="name"
                    render={({ field: { value, onChange, onBlur } }) => (
                      <TextInput
                        style={inputStyle('name', Boolean(errors.name))}
                        placeholder="John Doe"
                        placeholderTextColor={COLORS.placeholder}
                        autoCapitalize="words"
                        value={value}
                        onFocus={() => setFocusedField('name')}
                        onBlur={() => {
                          setFocusedField(null);
                          onBlur();
                        }}
                        onChangeText={(text) => {
                          onChange(text);
                          if (serverError) setServerError('');
                        }}
                        maxLength={50}
                      />
                    )}
                  />
                  {errors.name ? <Text style={styles.fieldErrorText}>{errors.name.message}</Text> : null}
                </View>

                <View style={[styles.row, isDesktop && styles.rowDesktop]}>
                  <View style={[styles.inputGroup, isDesktop && styles.halfField]}>
                    <Text style={styles.label}>Email Address</Text>
                    <Controller
                      control={control}
                      name="email"
                      render={({ field: { value, onChange, onBlur } }) => (
                        <TextInput
                          style={inputStyle('email', Boolean(errors.email))}
                          placeholder="you@college.edu"
                          placeholderTextColor={COLORS.placeholder}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          value={value}
                          onFocus={() => setFocusedField('email')}
                          onBlur={() => {
                            setFocusedField(null);
                            onBlur();
                          }}
                          onChangeText={(text) => {
                            onChange(text);
                            if (serverError) setServerError('');
                          }}
                          maxLength={254}
                        />
                      )}
                    />
                    {errors.email ? <Text style={styles.fieldErrorText}>{errors.email.message}</Text> : null}
                    <Text style={styles.hintText}>College email preferred for the Verified badge.</Text>
                  </View>

                  <View style={[styles.inputGroup, isDesktop && styles.halfField]}>
                    <Text style={styles.label}>Phone Number</Text>
                    <Controller
                      control={control}
                      name="phone"
                      render={({ field: { value, onChange, onBlur } }) => (
                        <TextInput
                          style={inputStyle('phone', Boolean(errors.phone))}
                          placeholder="Enter 10 digit phone number"
                          placeholderTextColor={COLORS.placeholder}
                          keyboardType="phone-pad"
                          autoCapitalize="none"
                          autoCorrect={false}
                          value={value}
                          onFocus={() => setFocusedField('phone')}
                          onBlur={() => {
                            setFocusedField(null);
                            onBlur();
                          }}
                          onChangeText={(text) => {
                            onChange(text);
                            if (serverError) setServerError('');
                          }}
                          maxLength={10}
                        />
                      )}
                    />
                    {errors.phone ? <Text style={styles.fieldErrorText}>{errors.phone.message}</Text> : null}
                  </View>
                </View>

                {/* OTP Section */}
                {!isVerified && (
                  <View style={styles.otpContainer}>
                    {!isOtpSent ? (
                      <TouchableOpacity
                        style={[styles.verifyButton, (!watchedEmail || !watchedPhone || Boolean(errors.email) || Boolean(errors.phone)) && styles.buttonDisabled]}
                        onPress={handleSendOtp}
                        disabled={!watchedEmail || !watchedPhone || Boolean(errors.email) || Boolean(errors.phone)}
                      >
                        <Text style={styles.verifyButtonText}>Send Verification OTP</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.otpInputGroup}>
                        <View style={styles.inputGroup}>
                          <Text style={styles.label}>Email OTP</Text>
                          <TextInput
                            style={inputStyle('emailOtp', false)}
                            placeholder="6-digit code"
                            keyboardType="number-pad"
                            value={emailOtp}
                            onChangeText={setEmailOtp}
                            maxLength={6}
                            onFocus={() => setFocusedField('emailOtp')}
                            onBlur={() => setFocusedField(null)}
                          />
                        </View>
                        <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyOtp}>
                          <Text style={styles.verifyButtonText}>Verify Code</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setIsOtpSent(false)}>
                          <Text style={styles.resendText}>Edit email/phone or resend OTP</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}

                {isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                    <Text style={styles.verifiedText}>Email & Phone Verified</Text>
                  </View>
                )}

                <View style={[styles.row, isDesktop && styles.rowDesktop]}>
                  <View style={[styles.inputGroup, isDesktop && styles.halfField]}>
                    <Text style={styles.label}>College</Text>
                    <Controller
                      control={control}
                      name="college"
                      render={({ field: { value, onChange } }) => (
                        <View>
                          <TouchableOpacity
                            style={[styles.selectInput, focusedField === 'college' && styles.inputFocused, errors.college && styles.inputError]}
                            onPress={() => {
                              setFocusedField('college');
                              setShowCollegeList((current) => !current);
                            }}
                            activeOpacity={0.9}
                          >
                            <Text style={[styles.selectText, value ? styles.selectTextActive : styles.selectTextPlaceholder]}>
                              {value || 'Select your college'}
                            </Text>
                            <Ionicons name="chevron-down" size={18} color={COLORS.helper} />
                          </TouchableOpacity>

                          {showCollegeList ? (
                            <View style={styles.collegeList}>
                              {COLLEGES.map((college) => (
                                <TouchableOpacity
                                  key={college}
                                  onPress={() => {
                                    onChange(college);
                                    setShowCollegeList(false);
                                    setFocusedField(null);
                                  }}
                                  style={styles.collegeItem}
                                >
                                  <Text style={styles.collegeItemText}>{college}</Text>
                                </TouchableOpacity>
                              ))}
                            </View>
                          ) : null}
                        </View>
                      )}
                    />
                    {errors.college ? <Text style={styles.fieldErrorText}>{errors.college.message}</Text> : null}
                  </View>

                  <View style={[styles.inputGroup, isDesktop && styles.halfField]}>
                    <Text style={styles.label}>Confirm Email / Alternate Contact</Text>
                    <Controller
                      control={control}
                      name="confirmEmail"
                      render={({ field: { value, onChange, onBlur } }) => (
                        <TextInput
                          style={inputStyle('confirmEmail', Boolean(errors.confirmEmail))}
                          placeholder="Re-enter email or backup contact"
                          placeholderTextColor={COLORS.placeholder}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          value={value}
                          onFocus={() => setFocusedField('confirmEmail')}
                          onBlur={() => {
                            setFocusedField(null);
                            onBlur();
                          }}
                          onChangeText={(text) => {
                            onChange(text);
                            if (serverError) setServerError('');
                          }}
                          maxLength={254}
                        />
                      )}
                    />
                    {errors.confirmEmail ? <Text style={styles.fieldErrorText}>{errors.confirmEmail.message}</Text> : null}
                  </View>
                </View>

                {watchedCollege === 'Other' ? (
                  <View style={styles.inputGroupFull}>
                    <Text style={styles.label}>Enter your college name</Text>
                    <Controller
                      control={control}
                      name="otherCollege"
                      render={({ field: { value, onChange } }) => (
                        <TextInput
                          style={inputStyle('otherCollege', Boolean(errors.otherCollege))}
                          placeholder="Full college name"
                          placeholderTextColor={COLORS.placeholder}
                          value={value}
                          onFocus={() => setFocusedField('otherCollege')}
                          onBlur={() => setFocusedField(null)}
                          onChangeText={(text) => onChange(text)}
                          maxLength={150}
                        />
                      )}
                    />
                    {errors.otherCollege ? <Text style={styles.fieldErrorText}>{errors.otherCollege.message}</Text> : null}
                  </View>
                ) : null}

                <View style={[styles.row, isDesktop && styles.rowDesktop]}>
                  <View style={[styles.inputGroup, isDesktop && styles.halfField]}>
                    <Text style={styles.label}>Create Password</Text>
                    <View style={styles.passwordInputWrap}>
                      <Controller
                        control={control}
                        name="password"
                        render={({ field: { value, onChange, onBlur } }) => (
                          <TextInput
                            style={[...inputStyle('password', Boolean(errors.password)), styles.passwordInput]}
                            placeholder="8-12 chars, e.g. Campus@12"
                            placeholderTextColor={COLORS.placeholder}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={value}
                            onFocus={() => setFocusedField('password')}
                            onBlur={() => {
                              setFocusedField(null);
                              onBlur();
                            }}
                            onChangeText={(text) => {
                              onChange(text);
                              if (serverError) setServerError('');
                            }}
                            maxLength={12}
                          />
                        )}
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
                    <View style={styles.strengthTrack}>
                      <View style={[styles.strengthFill, { width: passwordStrength.width, backgroundColor: passwordStrength.color }]} />
                    </View>
                    <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>{passwordStrength.label}</Text>
                    {errors.password ? <Text style={styles.fieldErrorText}>{errors.password.message}</Text> : null}
                  </View>

                  <View style={[styles.inputGroup, isDesktop && styles.halfField]}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={styles.passwordInputWrap}>
                      <Controller
                        control={control}
                        name="confirmPassword"
                        render={({ field: { value, onChange, onBlur } }) => (
                          <TextInput
                            style={[...inputStyle('confirmPassword', Boolean(errors.confirmPassword)), styles.passwordInput]}
                            placeholder="Retype your password"
                            placeholderTextColor={COLORS.placeholder}
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                            value={value}
                            onFocus={() => setFocusedField('confirmPassword')}
                            onBlur={() => {
                              setFocusedField(null);
                              onBlur();
                            }}
                            onChangeText={(text) => {
                              onChange(text);
                              if (serverError) setServerError('');
                            }}
                            maxLength={12}
                          />
                        )}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowConfirmPassword((current) => !current)}
                        accessibilityRole="button"
                        accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={COLORS.helper} />
                      </TouchableOpacity>
                    </View>
                    {errors.confirmPassword ? <Text style={styles.fieldErrorText}>{errors.confirmPassword.message}</Text> : null}
                  </View>
                </View>

                <Pressable
                  style={[styles.button, isButtonHovered && styles.buttonHover, (!isValid || isSubmitting) && styles.buttonDisabled]}
                  onPress={handleSubmit(onSubmit)}
                  disabled={!isValid || isSubmitting}
                  onHoverIn={() => setIsButtonHovered(true)}
                  onHoverOut={() => setIsButtonHovered(false)}
                >
                  <Text style={styles.buttonText}>{isSubmitting ? 'Creating Account...' : 'Create Account'}</Text>
                </Pressable>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Already have an account? </Text>
                  <Link href="/login" asChild>
                    <TouchableOpacity>
                      <Text style={styles.footerLink}>Sign In</Text>
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
  containerDesktop: {
    paddingHorizontal: 32,
    paddingVertical: 34,
  },
  pageShell: {
    width: '100%',
    maxWidth: 920,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 22,
  },
  heroTitle: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800',
    color: COLORS.heading,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
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
    padding: 24,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.04,
    shadowRadius: 35,
    elevation: 3,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: COLORS.error, fontSize: 14, fontWeight: '600' },
  form: { gap: 16 },
  row: { gap: 16 },
  rowDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  inputGroup: { gap: 8, flex: 1 },
  inputGroupFull: { gap: 8, width: '100%' },
  halfField: { flex: 1 },
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
  },
  inputFocused: {
    borderColor: COLORS.primary,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  selectInput: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 16,
    flex: 1,
    marginRight: 12,
  },
  selectTextPlaceholder: { color: COLORS.placeholder },
  selectTextActive: { color: COLORS.heading },
  collegeList: {
    maxHeight: 220,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    marginTop: 8,
    overflow: 'hidden',
    zIndex: 20,
  },
  collegeItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  collegeItemText: {
    color: COLORS.heading,
    fontSize: 15,
    fontWeight: '500',
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
  strengthTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 999,
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: '700',
  },
  hintText: {
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.success,
    fontWeight: '600',
    marginTop: -2,
  },
  fieldErrorText: {
    color: COLORS.error,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
  },
  button: {
    width: '100%',
    minHeight: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: 'rgba(56, 189, 248, 0.26)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 22,
    elevation: 4,
  },
  buttonHover: {
    backgroundColor: COLORS.primaryHover,
  },
  buttonDisabled: {
    opacity: 0.58,
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
  otpContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 8,
  },
  otpInputGroup: {
    gap: 12,
  },
  verifyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: '#09090b',
    fontWeight: '700',
    fontSize: 14,
  },
  resendText: {
    color: COLORS.primary,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    gap: 8,
  },
  verifiedText: {
    color: COLORS.success,
    fontWeight: '700',
    fontSize: 14,
  },
});
