import React, { useState } from "react";
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
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const setFieldError = (field: 'email' | 'password', message: string) => {
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
        // If user selected admin login but authenticated user is not admin, show error
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue to CampusCart</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.adminToggleRow}>
            <TouchableOpacity onPress={() => setIsAdminLogin(!isAdminLogin)} style={[styles.adminToggle, isAdminLogin && styles.adminToggleActive]}>
              <Text style={[styles.adminToggleText, isAdminLogin && styles.adminToggleTextActive]}>{isAdminLogin ? 'Admin login' : 'User login'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, fieldErrors.email && styles.inputError]}
              placeholder={isAdminLogin ? 'admin@campus.edu' : 'you@college.edu or any email'}
              placeholderTextColor="#cbd5e1"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (fieldErrors.email) setFieldErrors((current) => ({ ...current, email: undefined }));
              }}
            />
            {fieldErrors.email ? <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.email}</Text> : null}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordInputWrap}>
              <TextInput
                style={[styles.input, styles.passwordInput, fieldErrors.password && styles.inputError]}
                placeholder="••••••••"
                placeholderTextColor="#cbd5e1"
                secureTextEntry={!showPassword}
                value={password}
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
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>
            {fieldErrors.password ? <Text style={styles.fieldErrorText}>⚠️ {fieldErrors.password}</Text> : null}
          </View>

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => router.push("/forgot-password")}
          >
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Do not have an account? </Text>
          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  container: { 
    flex: 1, 
    padding: 24, 
    justifyContent: 'center',
    width: '100%',
    maxWidth: 450, // Screen chahe kitni badi ho, ye 450px se bada nahi hoga
    alignSelf: 'center', // Box ko screen ke ekdum beech me laayega
  },
  header: { marginBottom: 32 },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  subtitle: { fontSize: 16, color: "#6b7280" },
  form: { gap: 20 },
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
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 52,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    height: 44,
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 10,
  },
  forgotPassword: { alignSelf: "flex-end" },
  forgotPasswordText: { color: "#2563eb", fontWeight: "500", fontSize: 14 },
  button: {
    backgroundColor: "#2563eb",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    boxShadow: "0 4px 8px rgba(37, 99, 235, 0.2)",
    elevation: 4,
  },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 32 },
  footerText: { color: "#6b7280", fontSize: 15 },
  footerLink: { color: "#2563eb", fontSize: 15, fontWeight: "bold" },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#f87171',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: '#b91c1c', fontSize: 14, fontWeight: '500' },
  fieldErrorText: { color: '#b91c1c', fontSize: 13, fontWeight: '500' },
  adminToggleRow: { alignItems: 'center', marginBottom: 8 },
  adminToggle: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: '#e5e7eb' },
  adminToggleActive: { backgroundColor: '#2563eb', borderColor: '#2563eb' },
  adminToggleText: { color: '#374151', fontWeight: '600' },
  adminToggleTextActive: { color: '#fff' },
  inputError: {
    borderColor: '#f87171',
    backgroundColor: '#fff5f5',
  },
});
