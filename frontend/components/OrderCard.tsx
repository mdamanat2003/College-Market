import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../services/api'; // Path check kar lijiyega
import { COLORS, RADIUS, SPACING } from '../theme/colors';

export default function OrderCard({ item, refreshOrders }: { item: any, refreshOrders: () => void }) {
  // Refund States
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [otherDesc, setOtherDesc] = useState('');

  // Rating States
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const refundReasons = [
    "Product is not according to your wish",
    "Product received different",
    "Product pickUp problem",
    "Other"
  ];

  // 1. Receive Order
  const handleReceive = async () => {
    try {
      await api.put(`/orders/${item._id}/receive`);
      Alert.alert("Success", "Thanks for confirming!");
      refreshOrders();
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Something went wrong");
    }
  };

  // 2. Submit Refund
  const handleSubmitRefund = async () => {
    if (!selectedReason) return Alert.alert("Error", "Please select a reason.");
    try {
      await api.put(`/orders/${item._id}/dispute`, {
        reason: selectedReason,
        description: selectedReason === 'Other' ? otherDesc : ''
      });
      setModalVisible(false);
      Alert.alert("Request Sent", "Admin will review your refund request shortly.");
      refreshOrders();
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to submit request");
    }
  };

  // 3. Submit Rating
  const handleSubmitReview = async () => {
    if (rating === 0) return Alert.alert("Error", "Please select at least 1 star ⭐");
    try {
      await api.post('/reviews', {
        orderId: item._id,
        rating: rating,
        comment: comment
      });
      setRatingModalVisible(false);
      setRating(0);
      setComment('');
      Alert.alert("Success", "Thank you for rating the seller!");
      refreshOrders();
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to submit review");
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.orderId}>Order #{item._id.slice(-6).toUpperCase()}</Text>
        <Text style={[styles.statusBadge, 
          item.status === 'Completed' ? {color: '#059669'} : 
          item.isDisputed ? {color: '#DC2626'} : 
          {}
        ]}>
          {item.status === 'Completed' ? "Completed ✅" : 
           item.status === 'Cancelled' ? "Refunded ❌" :
           item.isDisputed ? "Dispute Raised ⚠️" : 
           item.deliveryStatus === 'Received' ? "Item Received ✅" : 
           "Pending ⏳"}
        </Text>
      </View>

      <View style={{ marginVertical: 10 }}>
         <Text style={{ fontSize: 16, fontWeight: 'bold', color: COLORS.heading }}>{item.product?.title || 'Unknown Product'}</Text>
         <Text style={{ fontSize: 14, color: COLORS.textMuted }}>₹{item.amount || item.product?.price}</Text>
         <Text style={{ fontSize: 12, color: COLORS.textMuted }}>Seller: {item.seller?.name || 'Unknown'}</Text>
      </View>

      {/* Buttons Logic */}
      {!item.isDisputed && item.deliveryStatus !== 'Received' && item.status !== 'Completed' && item.status !== 'Cancelled' && (
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.helpBtn} onPress={() => setModalVisible(true)}>
            <Text style={styles.helpText}>HELP (Refund)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.receiveBtn} onPress={handleReceive}>
            <Text style={styles.receiveText}>Order Received</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* REVIEW BUTTON: Sirf tab dikhega jab order complete ho */}
      {item.status === 'Completed' && !item.hasReviewed && (
        <View style={styles.actionsRow}>
           <TouchableOpacity
             style={styles.rateBtn}
             onPress={() => {
               setRating(0);
               setComment('');
               setRatingModalVisible(true);
             }}
           >
             <Text style={styles.rateBtnText}>⭐ Review Seller</Text>
           </TouchableOpacity>
        </View>
      )}

      {/* ----------------- REFUND MODAL (Existing) ----------------- */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
         {/* ... Refund Modal ka purana code exactly same ... */}
         <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Request Refund</Text>
            {refundReasons.map((reason, index) => (
              <TouchableOpacity key={index} style={styles.radioOption} onPress={() => setSelectedReason(reason)}>
                <Ionicons name={selectedReason === reason ? "radio-button-on" : "radio-button-off"} size={24} color="#2563EB" />
                <Text style={styles.radioText}>{reason}</Text>
              </TouchableOpacity>
            ))}
            {selectedReason === 'Other' && (
              <TextInput style={styles.textInput} placeholder="Describe reason..." placeholderTextColor={COLORS.textMuted} multiline value={otherDesc} onChangeText={setOtherDesc} />
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelBtn}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleSubmitRefund} style={styles.submitBtn}><Text style={styles.submitText}>Submit</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ----------------- RATING MODAL (New) ----------------- */}
      <Modal visible={ratingModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Review & Rate {item.seller?.name || 'Seller'}</Text>
            <Text style={{color: COLORS.textMuted, marginBottom: 15, textAlign: 'center'}}>One review includes both your star rating and feedback.</Text>
            
            {/* 5-Star Interactive UI */}
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <Ionicons 
                    name={star <= rating ? "star" : "star-outline"} 
                    size={40} 
                    color={star <= rating ? "#F59E0B" : "#D1D5DB"} // Golden yellow if active, gray if inactive
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.textInput}
              placeholder="Write a review (optional)..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
              value={comment}
              onChangeText={setComment}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setRatingModalVisible(false)} style={styles.cancelBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSubmitReview} style={styles.submitBtn}>
                <Text style={styles.submitText}>Submit Review</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  // ... (Aapke baaki purane styles yahan rahenge)
  card: { padding: 15, backgroundColor: COLORS.card, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: COLORS.border },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  orderId: { color: COLORS.textMuted, fontWeight: 'bold' },
  statusBadge: { color: COLORS.warning, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 10 },
  helpBtn: { flex: 1, padding: 10, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, alignItems: 'center' },
  helpText: { color: COLORS.danger, fontWeight: 'bold' },
  receiveBtn: { flex: 1, padding: 10, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 8, alignItems: 'center' },
  receiveText: { color: COLORS.success, fontWeight: 'bold' },
  
  // Rating Button Style
  rateBtn: { flex: 1, padding: 10, backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.2)' },
  rateBtnText: { color: COLORS.warning, fontWeight: 'bold' },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: COLORS.card, padding: 20, borderRadius: 15, borderWidth: 1, borderColor: COLORS.border },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, textAlign: 'center', color: COLORS.heading },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20 },
  radioOption: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 },
  radioText: { fontSize: 15, color: COLORS.text },
  textInput: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 10, minHeight: 80, textAlignVertical: 'top', backgroundColor: COLORS.background, color: COLORS.heading },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, gap: 15 },
  cancelBtn: { padding: 10 },
  cancelText: { color: COLORS.textMuted, fontWeight: 'bold' },
  submitBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  submitText: { color: COLORS.background, fontWeight: 'bold' }
});