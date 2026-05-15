import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useProductStore } from '../store/productStore';
import { COLORS, RADIUS, SPACING } from '../theme/colors';

const CATEGORIES = ['Electronics', 'Books', 'Furniture', 'Vehicles', 'Others'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Used'];

export default function AddProductScreen() {
  const router = useRouter();
  const { addProduct, isLoading, error } = useProductStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [condition, setCondition] = useState('Good');
  const [college, setCollege] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !price.trim()) {
      Alert.alert('Missing fields', 'Title, description, and price are required.');
      return;
    }

    const success = await addProduct({
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      condition,
      college: college.trim() || undefined,
      images: imageUrl.trim() ? [imageUrl.trim()] : [],
    });

    if (success) {
      router.replace('/');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.title}>List a Product</Text>
          <Text style={styles.subtitle}>Create a listing for the campus marketplace</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Input label="Title" placeholder="Product title" value={title} onChangeText={setTitle} />
          <Input
            label="Description"
            placeholder="Describe the product"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={styles.textArea}
          />
          <Input label="Price" placeholder="0" keyboardType="numeric" value={price} onChangeText={setPrice} />
          <Input label="College" placeholder="Your college name" value={college} onChangeText={setCollege} />
          <Input label="Image URL" placeholder="Optional image link" value={imageUrl} onChangeText={setImageUrl} autoCapitalize="none" />

          <Text style={styles.sectionLabel}>Category</Text>
          <View style={styles.chipRow}>
            {CATEGORIES.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, category === item && styles.chipActive]}
                onPress={() => setCategory(item)}
              >
                <Text style={[styles.chipText, category === item && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Condition</Text>
          <View style={styles.chipRow}>
            {CONDITIONS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.chip, condition === item && styles.chipActive]}
                onPress={() => setCondition(item)}
              >
                <Text style={[styles.chipText, condition === item && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button title="Publish Listing" onPress={handleSubmit} loading={isLoading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  card: {
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    marginBottom: SPACING.xl,
  },
  error: {
    color: COLORS.danger,
    marginBottom: SPACING.md,
  },
  textArea: {
    minHeight: 120,
    paddingTop: SPACING.md,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.text,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
  },
});