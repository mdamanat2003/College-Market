import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useAuthStore } from '../../store/authStore';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { COLORS, SPACING } from '../../theme/colors';

// Strict Zod Validation Schema
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // Error confirmPassword field par dikhayega
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error } = useAuthStore();

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    // API ko confirmPassword nahi chahiye
    const { confirmPassword, ...registerData } = data;
    
    const success = await register(registerData);
    if (success) {
      router.replace('/'); // Registration successful, go to Home
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the student marketplace</Text>

          {error && <Text style={styles.globalError}>{error}</Text>}

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
             <Input label="Full Name" placeholder="e.g. MD AMANAT ULLAH" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.name?.message} />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Email Address" placeholder="college email preferred" autoCapitalize="none" keyboardType="email-address" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.email?.message} />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Phone Number" placeholder="10-digit mobile number" keyboardType="numeric" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.phone?.message} />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Password" placeholder="Minimum 6 characters" secureTextEntry onBlur={onBlur} onChangeText={onChange} value={value} error={errors.password?.message} />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input label="Confirm Password" placeholder="Retype your password" secureTextEntry onBlur={onBlur} onChangeText={onChange} value={value} error={errors.confirmPassword?.message} />
            )}
          />

          <Button title="Sign Up" onPress={handleSubmit(onSubmit)} loading={isLoading} />

          <View style={styles.footer}>
            <Text style={{ color: COLORS.textMuted }}>Already have an account? </Text>
            <Link href="/(auth)/login" style={styles.link}>Sign In</Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: SPACING.lg },
  card: {
    backgroundColor: COLORS.card, padding: SPACING.xl, borderRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05,
    shadowRadius: 12, elevation: 2, maxWidth: 450, width: '100%', alignSelf: 'center',
  },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.xs },
  subtitle: { fontSize: 16, color: COLORS.textMuted, marginBottom: SPACING.xl },
  globalError: { color: COLORS.danger, backgroundColor: '#FEE2E2', padding: SPACING.sm, borderRadius: 8, marginBottom: SPACING.md, textAlign: 'center', overflow: 'hidden' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg },
  link: { color: COLORS.accent, fontWeight: '600' }
});