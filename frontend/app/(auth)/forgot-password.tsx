import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
// import { api } from '../../services/api'; // Aapka API path

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Enter email', 'Please enter your registered email address.');
      return;
    }

    setLoading(true);
    try {
      // Placeholder: implement API call to send OTP
      // await api.post('/auth/forgot-password', { email });
      Alert.alert('OTP Sent', 'Check your email for the 6-digit code.');
      router.push('/login');
    } catch (err) {
      console.error('Send OTP failed', err);
      Alert.alert('Error', 'Unable to send OTP. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.formWrapper}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          
          <Text style={styles.title}>Reset Password 🔒</Text>
          <Text style={styles.subtitle}>Enter your registered email address and we will send you a 6-digit OTP.</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TouchableOpacity style={styles.button} onPress={handleSendOTP} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send OTP</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  // Poore screen ka background
  safeArea: { 
    flex: 1, 
    backgroundColor: '#F3F4F6' // Light grey background 
  },
  // Form ko center karne ke liye
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
  },
  // Ye main card hai jo maximum 450px lega aur premium lagega
  formWrapper: {
    width: '100%',
    maxWidth: 450, // 👈 Ye stretch hone se rokega
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 16,
    // Shadows for premium card effect
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3, 
  },
  backBtn: { 
    alignSelf: 'flex-start',
    marginBottom: 20,
    padding: 5,
    marginLeft: -5,
  },
  title: { 
    fontSize: 26, 
    fontWeight: 'bold', 
    color: '#111827', 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 15, 
    color: '#6B7280', 
    marginBottom: 25, 
    lineHeight: 22 
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    padding: 16, 
    borderRadius: 12, 
    fontSize: 16, 
    marginBottom: 20, 
    backgroundColor: '#F9FAFB',
    color: '#111827'
  },
  button: { 
    backgroundColor: '#2563EB', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 5,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: { 
    color: '#ffffff', 
    fontSize: 16, 
    fontWeight: 'bold',
    letterSpacing: 0.5 
  }
});