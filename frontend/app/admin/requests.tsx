import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { api } from '../../services/api';
import { COLORS, SPACING, RADIUS } from '../../theme/colors';

export default function AdminRequests() {
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/requests');
      setRequests(res.data.requests || []);
    } catch (err: any) {
      console.error('Failed to load requests', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch';
      const status = err?.response?.status;
      setError(status ? `${status} - ${msg}` : msg);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => {
    fetchRequests();
  }, []));

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/requests/${id}/status`, { status });
      setRequests((cur) => cur.map(r => r._id === id ? { ...r, status } : r));
    } catch (err: any) {
      console.error('Failed to update request', err);
    }
  };

  const contactRequests = requests.filter(r => !r.message || !r.message.includes('[Academic Request]'));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Requests</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>Error: {error}</Text>
              <TouchableOpacity onPress={fetchRequests} style={styles.retryBtn}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : contactRequests.length === 0 ? (
            <Text style={styles.empty}>No general requests found.</Text>
          ) : contactRequests.map((r) => (
            <View key={r._id} style={styles.item}>
              <View style={styles.itemInfo}>
                <Text style={styles.name}>{r.name} · {r.email}</Text>
                <Text style={styles.message}>{r.message}</Text>
                <Text style={styles.meta}>{new Date(r.createdAt).toLocaleString()}</Text>
              </View>
              <View style={styles.actions}>
                <Text style={styles.status}>{r.status}</Text>
                {r.status !== 'resolved' && (
                  <TouchableOpacity style={styles.resolveBtn} onPress={() => updateStatus(r._id, 'resolved')}>
                    <Ionicons name="checkmark-done-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { height: 60, backgroundColor: COLORS.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)' },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  list: { padding: SPACING.md, paddingTop: SPACING.lg, gap: SPACING.md },
  item: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md, backgroundColor: COLORS.card, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', justifyContent: 'space-between' },
  itemInfo: { flex: 1, minWidth: 220, gap: 4 },
  name: { fontWeight: '700', color: COLORS.text, fontSize: 15 },
  message: { marginTop: 2, color: COLORS.textMuted, fontSize: 14 },
  meta: { marginTop: 4, fontSize: 11, color: COLORS.textMuted },
  actions: { alignItems: 'flex-end', justifyContent: 'center', minWidth: 80, gap: 4 },
  status: { fontSize: 12, color: COLORS.textMuted, textTransform: 'capitalize' },
  resolveBtn: { backgroundColor: '#059669', padding: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  empty: { color: COLORS.textMuted, textAlign: 'center', marginTop: SPACING.xl },
  errorBox: { padding: SPACING.lg, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.danger, alignItems: 'center' },
  errorText: { color: COLORS.danger, fontWeight: '600', marginBottom: 12 },
  retryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.sm },
  retryBtnText: { color: COLORS.background, fontWeight: '700' },
});
