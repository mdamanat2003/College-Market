import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { api } from '../../services/api';
import { COLORS, SPACING, RADIUS } from '../../theme/colors';

export default function AdminRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/requests');
      setRequests(res.data.requests || []);
    } catch (err) {
      // Surface useful error info for debugging admin UI
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
    } catch (err) {
      console.error('Failed to update request', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Contact Requests</Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {error ? (
            <View style={{ padding: 12 }}>
              <Text style={{ color: '#b91c1c', marginBottom: 8 }}>Error: {error}</Text>
              <TouchableOpacity onPress={fetchRequests} style={{ backgroundColor: '#2563eb', padding: 8, borderRadius: 8 }}>
                <Text style={{ color: '#fff' }}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : requests.length === 0 ? (
            <Text style={styles.empty}>No requests</Text>
          ) : requests.map((r) => (
            <View key={r._id} style={styles.item}>
              <View style={{ flex: 1 }}>
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
  container: { flex: 1, padding: SPACING.lg, backgroundColor: COLORS.background },
  header: { fontSize: 20, fontWeight: '700', marginBottom: SPACING.md, color: COLORS.text },
  list: { gap: SPACING.md },
  item: { flexDirection: 'row', gap: SPACING.md, backgroundColor: COLORS.card, padding: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border },
  name: { fontWeight: '700', color: COLORS.text },
  message: { marginTop: 6, color: COLORS.textMuted },
  meta: { marginTop: 8, fontSize: 12, color: COLORS.textMuted },
  actions: { alignItems: 'center', justifyContent: 'center' },
  status: { marginBottom: 8, fontSize: 12, color: COLORS.textMuted, textTransform: 'capitalize' },
  resolveBtn: { backgroundColor: '#059669', padding: 8, borderRadius: 8 },
  empty: { color: COLORS.textMuted },
});
