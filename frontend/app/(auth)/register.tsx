import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, 
  StyleSheet, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Alert 
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const registerStore = useAuthStore((s) => s.register);
  const authError = useAuthStore((s) => s.error);

  // Password Validation Logic
  const validatePassword = (pass: string) => {
    if (pass.length < 6 || pass.length > 10) return "Password must be between 6 and 10 characters.";
    if (!/[A-Z]/.test(pass)) return "Password needs at least 1 uppercase letter.";
    if (!/[a-z]/.test(pass)) return "Password needs at least 1 lowercase letter.";
    if (!/[0-9]/.test(pass)) return "Password needs at least 1 number.";
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(pass)) return "Password needs at least 1 special character.";
    return null;
  };

  const handleRegister = async () => {
    setErrorMessage('');

    // 1. Basic empty check
    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage("Please fill all the fields.");
      return;
    }

    // 2. Validate Password strength
    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

    // 3. Match passwords
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    // 4. Sab sahi hai, ab Backend ko Data bhejna hai 🚀
    try {
      const ok = await registerStore({ name, email, password, phone: '0000000000' });
      if (ok) {
        Alert.alert('Success! 🎉', 'Your account has been created.');
        router.push('/login');
      } else {
        setErrorMessage(authError || 'Registration failed.');
      }
    } catch (error) {
      console.error('Register request failed:', error);
      setErrorMessage('Server error! Backend chalu hai kya?');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Join CampusCart</Text>
            <Text style={styles.subtitle}>Create an account to start trading</Text>
          </View>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="you@college.edu or personal"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
              <Text style={styles.hintText}>
                💡 College email preferred for the Verified badge.
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Create Password</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Campus@123"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Retype your password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Create Account</Text>
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
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  container: { 
    flexGrow: 1, 
    padding: 24, 
    justifyContent: 'center',
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
  },
  header: { marginBottom: 24, marginTop: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6b7280' },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#f87171',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: { color: '#b91c1c', fontSize: 14, fontWeight: '500' },
  form: { gap: 16 },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151' },
  input: {
    borderWidth: 1, borderColor: '#e5e7eb', backgroundColor: '#f9fafb',
    borderRadius: 12, padding: 16, fontSize: 16, color: '#111827',
  },
  hintText: { fontSize: 12, color: '#059669', fontWeight: '500', marginTop: 2 },
  button: {
    backgroundColor: '#2563eb', padding: 16, borderRadius: 12,
    alignItems: 'center', marginTop: 12, boxShadow: '0 4px 8px rgba(37, 99, 235, 0.2)',
    elevation: 4,
  },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32, marginBottom: 20 },
  footerText: { color: '#6b7280', fontSize: 15 },
  footerLink: { color: '#2563eb', fontSize: 15, fontWeight: 'bold' },
});