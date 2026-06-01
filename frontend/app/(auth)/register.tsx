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
  ScrollView,
  Alert,
} from 'react-native';
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, 'Full name must be at least 3 characters.')
      .max(50, 'Full name must be at most 50 characters.'),
    username: z
      .string()
      .trim()
      .min(4, 'Username must be at least 4 characters.')
      .max(20, 'Username must be at most 20 characters.')
      .regex(/^[A-Za-z0-9_]+$/, 'Username can only use letters, numbers, and underscores.'),
    email: z.string().trim().email('Enter a valid email address.').transform((value) => value.toLowerCase()),
    phone: z.string().trim().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits.'),
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
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const router = useRouter();
  const registerStore = useAuthStore((s) => s.register);
  const authError = useAuthStore((s) => s.error);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
    setError,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const mapServerErrorToField = (message: string): keyof RegisterFormValues | null => {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('username')) return 'username';
    if (lowerMessage.includes('email')) return 'email';
    if (lowerMessage.includes('phone')) return 'phone';
    if (lowerMessage.includes('name')) return 'name';
    if (lowerMessage.includes('password')) return 'password';
    return null;
  };

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError('');

    try {
      const ok = await registerStore({
        name: values.name.trim(),
        username: values.username.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim(),
        password: values.password.trim(),
      });

      if (ok) {
        Alert.alert('Success! 🎉', 'Your account has been created.');
        router.replace('/(auth)/login');
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
      setServerError('Server error! Backend chalu hai kya?');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Join CampusCart</Text>
            <Text style={styles.subtitle}>Create an account to start trading</Text>
          </View>

          {serverError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {serverError}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    style={[styles.input, errors.name && styles.inputError]}
                    placeholder="John Doe (3-50 characters)"
                    placeholderTextColor="#cbd5e1"
                    autoCapitalize="words"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      onChange(text);
                      if (serverError) setServerError('');
                    }}
                    maxLength={50}
                  />
                )}
              />
              {errors.name ? <Text style={styles.fieldErrorText}>⚠️ {errors.name.message}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Username</Text>
              <Controller
                control={control}
                name="username"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    style={[styles.input, errors.username && styles.inputError]}
                    placeholder="campus_user_01 (4-20 chars)"
                    placeholderTextColor="#cbd5e1"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      onChange(text);
                      if (serverError) setServerError('');
                    }}
                    maxLength={20}
                  />
                )}
              />
              {errors.username ? <Text style={styles.fieldErrorText}>⚠️ {errors.username.message}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="you@college.edu or personal"
                    placeholderTextColor="#cbd5e1"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      onChange(text);
                      if (serverError) setServerError('');
                    }}
                    maxLength={254}
                  />
                )}
              />
              {errors.email ? <Text style={styles.fieldErrorText}>⚠️ {errors.email.message}</Text> : null}
              <Text style={styles.hintText}>💡 College email preferred for the Verified badge.</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <Controller
                control={control}
                name="phone"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    style={[styles.input, errors.phone && styles.inputError]}
                    placeholder="10 digit phone number"
                    placeholderTextColor="#cbd5e1"
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={(text) => {
                      onChange(text);
                      if (serverError) setServerError('');
                    }}
                    maxLength={10}
                  />
                )}
              />
              {errors.phone ? <Text style={styles.fieldErrorText}>⚠️ {errors.phone.message}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Create Password</Text>
              <View style={styles.passwordInputWrap}>
                <Controller
                  control={control}
                  name="password"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                      placeholder="8-12 chars, e.g. Campus@12"
                      placeholderTextColor="#cbd5e1"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={value}
                      onBlur={onBlur}
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
                  accessibilityLabel={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>
              {errors.password ? <Text style={styles.fieldErrorText}>⚠️ {errors.password.message}</Text> : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordInputWrap}>
                <Controller
                  control={control}
                  name="confirmPassword"
                  render={({ field: { value, onChange, onBlur } }) => (
                    <TextInput
                      style={[styles.input, styles.passwordInput, errors.confirmPassword && styles.inputError]}
                      placeholder="Retype your password"
                      placeholderTextColor="#cbd5e1"
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={value}
                      onBlur={onBlur}
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
                  accessibilityLabel={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={22}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword ? <Text style={styles.fieldErrorText}>⚠️ {errors.confirmPassword.message}</Text> : null}
            </View>

            <TouchableOpacity
              style={[styles.button, (!isValid || isSubmitting) && styles.buttonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || isSubmitting}
            >
              <Text style={styles.buttonText}>{isSubmitting ? 'Creating Account...' : 'Create Account'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
  },
  header: { marginBottom: 24, marginTop: 20 },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: "#6b7280" },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#f87171',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: '#b91c1c', fontSize: 14, fontWeight: '500' },
  fieldErrorText: { color: '#b91c1c', fontSize: 13, fontWeight: '500' },
  form: { gap: 16 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151" },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#111827",
  },
  passwordInputWrap: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    paddingRight: 52,
  },
  inputError: {
    borderColor: '#f87171',
    backgroundColor: '#fff5f5',
  },
  eyeButton: {
    position: "absolute",
    right: 14,
    height: 44,
    width: 36,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    elevation: 10,
  },
  hintText: { fontSize: 12, color: "#059669", fontWeight: "500", marginTop: 2 },
  button: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
    boxShadow: "0 4px 8px rgba(37, 99, 235, 0.2)",
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 32,
    marginBottom: 20,
  },
  footerText: { color: "#6b7280", fontSize: 15 },
  footerLink: { color: "#2563eb", fontSize: 15, fontWeight: "bold" },
});
