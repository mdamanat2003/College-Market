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
  Image,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';
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
      .max(50, 'Full name must be at most 50 characters.')
      .regex(/^[a-zA-Z\s.-]+$/, 'Full name can only contain letters, spaces, dots, and hyphens.'),
    email: z
      .string()
      .trim()
      .min(5, 'Email address must be at least 5 characters.')
      .max(50, 'Email address must be at most 50 characters.')
      .email('Enter a valid email address.')
      .transform((value) => value.toLowerCase()),
    phone: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.'),
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
  .refine((data) => data.confirmEmail.toLowerCase() === data.email || /^[6-9]\d{9}$/.test(data.confirmEmail), {
    message: 'Enter matching email or a valid 10-digit alternate mobile number.',
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
  const [collegeSearchQuery, setCollegeSearchQuery] = useState('');
  const [serverError, setServerError] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [collegeIdProofUri, setCollegeIdProofUri] = useState<string | null>(null);
  const [idProofError, setIdProofError] = useState('');
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

  const filteredColleges = COLLEGES.filter((college) =>
    college.toLowerCase().includes(collegeSearchQuery.toLowerCase())
  );

  const inputStyle = (field: string, hasError: boolean) => [
    styles.input,
    focusedField === field && styles.inputFocused,
    hasError && styles.inputError,
  ];

  const pickIdProof = async () => {
    setIdProofError('');
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission Denied!', 'Gallery access is required.');

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      let fileSize = asset.fileSize;

      if (!fileSize && asset.uri) {
        try {
          const resp = await fetch(asset.uri);
          const blob = await resp.blob();
          fileSize = blob.size;
        } catch (e) {
          console.warn('Could not determine blob size:', e);
        }
      }

      if (fileSize && fileSize > 1 * 1024 * 1024) {
        setIdProofError('ID proof image 1MB se badi hai! Kripya 1MB se kam size ki image upload karein.');
        setCollegeIdProofUri(null);
        return;
      }
      setIdProofError('');
      setCollegeIdProofUri(asset.uri);
    }
  };

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

    if (!collegeIdProofUri) {
      setIdProofError('College ID proof photo upload karna compulsory hai.');
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

      const formData = new FormData();
      formData.append('name', values.name.trim());
      formData.append('username', generatedUsername);
      formData.append('email', values.email.trim().toLowerCase());
      formData.append('phone', values.phone.trim());
      formData.append('password', values.password.trim());
      formData.append('college', selectedCollege);

      let filename = collegeIdProofUri.split('/').pop() || 'id_proof.jpg';
      if (!filename.includes('.')) {
        filename = 'id_proof.jpg';
      }
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      if (Platform.OS === 'web') {
        const response = await fetch(collegeIdProofUri);
        const blob = await response.blob();
        formData.append('collegeIdProof', blob, filename);
      } else {
        formData.append('collegeIdProof', {
          uri: Platform.OS === 'ios' ? collegeIdProofUri.replace('file://', '') : collegeIdProofUri,
          name: filename,
          type,
        } as any);
      }

      const ok = await registerStore(formData);

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
                <Ionicons name="arrow-back" size={16} color={COLORS.primary} />
                <Text style={styles.backToHomeText}>Back to Home</Text>
              </TouchableOpacity>
              <View style={styles.form}>
                <View style={styles.inputGroupFull}>
                  <Text style={styles.label}>Full Name *</Text>
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
                    <Text style={styles.label}>Email Address *</Text>
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
                          maxLength={50}
                        />
                      )}
                    />
                    {errors.email ? <Text style={styles.fieldErrorText}>{errors.email.message}</Text> : null}
                    <Text style={styles.hintText}>College email preferred for the Verified badge.</Text>
                  </View>

                  <View style={[styles.inputGroup, isDesktop && styles.halfField]}>
                    <Text style={styles.label}>Phone Number *</Text>
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
                            const cleaned = text.replace(/[^0-9]/g, '');
                            onChange(cleaned);
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
                    <Text style={styles.label}>College *</Text>
                    <Controller
                      control={control}
                      name="college"
                      render={({ field: { value, onChange } }) => (
                        <View>
                          <TouchableOpacity
                            style={[styles.selectInput, focusedField === 'college' && styles.inputFocused, errors.college && styles.inputError]}
                            onPress={() => {
                              setFocusedField('college');
                              setShowCollegeList((current) => {
                                const next = !current;
                                if (!next) setCollegeSearchQuery('');
                                return next;
                              });
                            }}
                            activeOpacity={0.9}
                          >
                            <Text style={[styles.selectText, value ? styles.selectTextActive : styles.selectTextPlaceholder]}>
                              {value || 'Select your college'}
                            </Text>
                            <Ionicons name="chevron-down" size={18} color={COLORS.helper} />
                          </TouchableOpacity>

                          {showCollegeList ? (
                            <View style={styles.collegeListContainer}>
                              <View style={styles.searchBarContainer}>
                                <Ionicons name="search-outline" size={18} color={COLORS.placeholder} style={styles.searchIcon} />
                                <TextInput
                                  style={styles.collegeSearchInput}
                                  placeholder="Search college..."
                                  placeholderTextColor={COLORS.placeholder}
                                  value={collegeSearchQuery}
                                  onChangeText={setCollegeSearchQuery}
                                  autoCapitalize="none"
                                  autoCorrect={false}
                                />
                                {collegeSearchQuery ? (
                                  <TouchableOpacity onPress={() => setCollegeSearchQuery('')}>
                                    <Ionicons name="close-circle" size={18} color={COLORS.helper} />
                                  </TouchableOpacity>
                                ) : null}
                              </View>
                              <ScrollView style={styles.collegeListScroll} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                                {filteredColleges.map((college) => (
                                  <TouchableOpacity
                                    key={college}
                                    onPress={() => {
                                      onChange(college);
                                      setShowCollegeList(false);
                                      setFocusedField(null);
                                      setCollegeSearchQuery('');
                                    }}
                                    style={styles.collegeItem}
                                  >
                                    <Text style={styles.collegeItemText}>{college}</Text>
                                  </TouchableOpacity>
                                ))}
                                {filteredColleges.length === 0 ? (
                                  <View style={styles.noResultsContainer}>
                                    <Text style={styles.noResultsText}>No colleges found</Text>
                                    <TouchableOpacity
                                      style={styles.selectOtherBtn}
                                      onPress={() => {
                                        onChange('Other');
                                        setShowCollegeList(false);
                                        setFocusedField(null);
                                        setCollegeSearchQuery('');
                                      }}
                                    >
                                      <Text style={styles.selectOtherBtnText}>Select "Other"</Text>
                                    </TouchableOpacity>
                                  </View>
                                ) : null}
                              </ScrollView>
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
                    <Text style={styles.label}>Enter your college name *</Text>
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

                {/* College ID Proof Section */}
                <View style={styles.inputGroupFull}>
                  <Text style={styles.label}>College ID Proof * (Anything that proves you're a student)</Text>
                  <TouchableOpacity
                    style={[
                      styles.idProofPicker,
                      collegeIdProofUri ? styles.idProofPickerSelected : null,
                      idProofError ? styles.idProofPickerError : null,
                    ]}
                    onPress={pickIdProof}
                    activeOpacity={0.8}
                  >
                    {collegeIdProofUri ? (
                      <View style={styles.idProofPreviewContainer}>
                        <Image source={{ uri: collegeIdProofUri }} style={styles.idProofPreview} resizeMode="contain" />
                        <View style={styles.changeIdProofBadge}>
                          <Ionicons name="camera-outline" size={16} color="#fff" />
                          <Text style={styles.changeIdProofText}>Change ID Proof</Text>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.idProofPlaceholder}>
                        <Ionicons name="card-outline" size={36} color={idProofError ? COLORS.error : COLORS.helper} />
                        <Text style={styles.idProofPlaceholderText}>Upload student ID card photo</Text>
                        <Text style={styles.idProofHelperText}>Ensure your name & college name are clearly visible (Max 1MB)</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  {idProofError ? (
                    <View style={styles.idProofErrorBadge}>
                      <Ionicons name="alert-circle" size={16} color={COLORS.error} />
                      <Text style={styles.idProofErrorText}>{idProofError}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={[styles.row, isDesktop && styles.rowDesktop]}>
                  <View style={[styles.inputGroup, isDesktop && styles.halfField]}>
                    <Text style={styles.label}>Create Password *</Text>
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
                    <Text style={styles.label}>Confirm Password *</Text>
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
  collegeListContainer: {
    maxHeight: 250,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    marginTop: 8,
    overflow: 'hidden',
    zIndex: 30,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  collegeSearchInput: {
    flex: 1,
    color: COLORS.heading,
    fontSize: 14,
    height: '100%',
    padding: 0,
  },
  collegeListScroll: {
    maxHeight: 200,
  },
  noResultsContainer: {
    padding: 16,
    alignItems: 'center',
  },
  noResultsText: {
    color: COLORS.helper,
    fontSize: 14,
    marginBottom: 8,
  },
  selectOtherBtn: {
    backgroundColor: COLORS.border,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  selectOtherBtnText: {
    color: COLORS.heading,
    fontSize: 13,
    fontWeight: '600',
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
  buttonHover: {
    backgroundColor: COLORS.primaryHover,
    transform: [{ translateY: -2 }, { scale: 1.01 }],
    ...Platform.select({
      web: { 
        boxShadow: '0 14px 28px rgba(56, 189, 248, 0.32)',
        filter: 'brightness(1.05)',
      } as any,
      default: {},
    }),
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
  idProofPicker: {
    minHeight: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginTop: 6,
    padding: 12,
  },
  idProofPickerSelected: {
    borderStyle: 'solid',
    borderColor: 'rgba(56, 189, 248, 0.3)',
    backgroundColor: 'rgba(56, 189, 248, 0.02)',
  },
  idProofPickerError: {
    borderColor: COLORS.error,
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
  },
  idProofErrorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  idProofErrorText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  idProofPlaceholder: {
    alignItems: 'center',
    gap: 6,
  },
  idProofPlaceholderText: {
    color: COLORS.label,
    fontSize: 14,
    fontWeight: '700',
  },
  idProofHelperText: {
    color: COLORS.helper,
    fontSize: 12,
    textAlign: 'center',
  },
  idProofPreviewContainer: {
    width: '100%',
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  idProofPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  changeIdProofBadge: {
    position: 'absolute',
    bottom: 8,
    backgroundColor: 'rgba(9, 9, 11, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  changeIdProofText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  backToHomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 18,
    alignSelf: 'flex-start',
  },
  backToHomeText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
