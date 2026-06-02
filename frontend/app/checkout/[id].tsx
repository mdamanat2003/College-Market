import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useProductStore } from '../../store/productStore';
import { useAuthStore } from '../../store/authStore';
import { useOrderStore } from '../../store/orderStore';
import { Button } from '../../components/ui/Button';
import { PlaceholderImage } from '../../components/ui/PlaceholderImage';
import { SafeImage } from '../../components/ui/SafeImage';
import { COLORS, SPACING, RADIUS } from '../../theme/colors';

// Razorpay Script Loader (For Web)
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (Platform.OS !== 'web') return resolve(false);
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutScreen() {
  const { id } = useLocalSearchParams(); // Product ID
  const router = useRouter();
  const { user } = useAuthStore();
  const { fetchProductById } = useProductStore();
  const { createOrder, verifyPayment, isLoading: orderLoading } = useOrderStore();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        const data = await fetchProductById(id as string);
        setProduct(data);
      }
      setLoading(false);
    };
    loadData();
  }, [id]);

  const handlePayment = async () => {
    // 1. Load Script
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded && Platform.OS === 'web') {
      alert('Failed to load Razorpay. Please check your internet connection.');
      return;
    }

    // 2. Create Order from Backend
    const order = await createOrder(product._id);
    if (!order) return;

    // 3. Setup Razorpay Options
    const options = {
      key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID, // .env se uthaya
      amount: order.amount, // Paise me (paise backend se aayega)
      currency: "INR",
      name: "CampusCart Escrow",
      description: `Payment for ${product.title}`,
      order_id: order.razorpayOrderId,
      prefill: {
        name: user?.name,
        email: user?.email,
        contact: user?.phone || '9999999999'
      },
      theme: {
        color: COLORS.primary
      },
      handler: async function (response: any) {
        try {
          // 4. Verify Payment on Backend (fire-and-forget so UI can navigate instantly)
          verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            orderId: order.orderId
          }).then((success) => {
            if (!success) console.error('Payment verification failed in background');
          }).catch((err) => console.error('VerifyPayment error', err));

          // Immediate navigation to Home (no blocking alerts)
          router.replace('/(tabs)');
          
        } catch (error) {
          console.error(error);
          alert('Something went wrong during verification.');
          window.location.reload();
        }
      }
    }; // <--- YE BRACKET MISSING THA!

    // 5. Open Razorpay Modal
    if (Platform.OS === 'web') {
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert(`Payment Failed: ${response.error.description}`);
      });
      rzp.open();
    } else {
      // Future me React Native Mobile ke liye react-native-razorpay yahan aayega
      alert('Mobile payment integration coming soon!');
    }
  };

  if (loading || !product) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Ionicons name="lock-closed" size={24} color={COLORS.success} />
          <Text style={styles.headerText}>Secure Escrow Checkout</Text>
        </View>

        <View style={styles.productInfo}>
          {product.images?.[0] ? (
            <SafeImage uri={product.images[0]} style={styles.image} resizeMode="cover" />
          ) : (
            <PlaceholderImage style={styles.image} label="" size={20} />
          )}
          <View style={styles.details}>
            <Text style={styles.title}>{product.title}</Text>
            <Text style={styles.seller}>Seller: {product.seller?.name}</Text>
          </View>
        </View>

        <View style={styles.billBox}>
          <View style={styles.billRow}>
            <Text style={styles.billText}>Item Price</Text>
            <Text style={styles.billText}>₹{product.price}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billText}>Escrow Fee (0%)</Text>
            <Text style={styles.billText}>₹0</Text>
          </View>
          <View style={[styles.billRow, styles.totalRow]}>
            <Text style={styles.totalText}>Total Amount</Text>
            <Text style={styles.totalText}>₹{product.price}</Text>
          </View>
        </View>

        <Text style={styles.trustText}>
          Your money is held safely in CampusCart Escrow. The seller gets paid only when you receive the item.
        </Text>

        <Button 
          title={`Pay ₹${product.price} Securely`} 
          onPress={handlePayment} 
          loading={orderLoading} 
        />
        
        <Button 
          title="Cancel" 
          variant="outline" 
          onPress={() => router.back()} 
          disabled={orderLoading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', padding: SPACING.lg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: COLORS.card, padding: SPACING.xl, borderRadius: RADIUS.lg, width: '100%', maxWidth: 500, borderWidth: 1, borderColor: COLORS.border },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xl, gap: SPACING.sm },
  headerText: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  productInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.xl, backgroundColor: COLORS.surface, padding: SPACING.md, borderRadius: RADIUS.md },
  image: { width: 60, height: 60, borderRadius: RADIUS.sm, marginRight: SPACING.md },
  details: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  seller: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
  billBox: { marginBottom: SPACING.xl, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.md },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  billText: { fontSize: 15, color: COLORS.textMuted },
  totalRow: { borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm, marginTop: SPACING.xs },
  totalText: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  trustText: { fontSize: 12, color: COLORS.success, textAlign: 'center', marginBottom: SPACING.lg, lineHeight: 18 }
});
