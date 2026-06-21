import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { api } from '../../services/api';
import { COLORS, SPACING, RADIUS } from '../../theme/colors';

const parseRequestMessage = (message: string) => {
  const lines = message.split('\n');
  let branch = '';
  let semester = '';
  let subject = '';
  let details = '';

  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('Branch:')) branch = trimmedLine.replace('Branch:', '').trim();
    if (trimmedLine.startsWith('Semester:')) semester = trimmedLine.replace('Semester:', '').trim();
    if (trimmedLine.startsWith('Subject:')) subject = trimmedLine.replace('Subject:', '').trim();
    if (trimmedLine.startsWith('Details:')) details = trimmedLine.replace('Details:', '').trim();
  });

  return { branch, semester, subject, details };
};

export default function AdminAcademicRequests() {
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
      console.error('Failed to load academic requests', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to fetch';
      setError(msg);
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
      console.error('Failed to update status', err);
      Alert.alert('Error', 'Failed to update request status.');
    }
  };

  const academicRequests = requests.filter(r => r.message && r.message.includes('[Academic Request]'));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notes & PyQ Requests</Text>
        <TouchableOpacity onPress={fetchRequests} style={styles.backBtn}>
          <Ionicons name="refresh" size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>Error: {error}</Text>
              <TouchableOpacity onPress={fetchRequests} style={styles.retryBtn}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : academicRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="mail-open-outline" size={48} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No active notes requests from students.</Text>
            </View>
          ) : (
            academicRequests.map((r) => {
              const detailsObj = parseRequestMessage(r.message);
              const isResolved = r.status === 'resolved';

              return (
                <View key={r._id} style={[styles.card, isResolved && styles.resolvedCard]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.subjectInfo}>
                      <Text style={styles.subjectText}>{detailsObj.subject || 'Unknown Subject'}</Text>
                      <View style={styles.badgeRow}>
                        <View style={styles.branchBadge}>
                          <Text style={styles.badgeText}>{detailsObj.branch || 'Any'}</Text>
                        </View>
                        <View style={styles.semesterBadge}>
                          <Text style={styles.badgeText}>{detailsObj.semester || 'Any'}</Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.statusBox}>
                      <Text style={[styles.statusText, isResolved ? styles.statusResolved : styles.statusNew]}>
                        {r.status || 'new'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardBody}>
                    <Text style={styles.detailLabel}>Additional Details:</Text>
                    <Text style={styles.detailText}>{detailsObj.details || 'None provided'}</Text>
                    
                    <View style={styles.divider} />
                    
                    <View style={styles.studentInfoRow}>
                      <Ionicons name="person-outline" size={14} color={COLORS.textMuted} />
                      <Text style={styles.studentInfoText}>Requested by: {r.name} ({r.email})</Text>
                    </View>
                    <View style={styles.studentInfoRow}>
                      <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                      <Text style={styles.studentInfoText}>{new Date(r.createdAt).toLocaleString()}</Text>
                    </View>
                  </View>

                  <View style={styles.cardActions}>
                    {!isResolved && (
                      <>
                        <TouchableOpacity 
                          style={styles.fulfillBtn}
                          onPress={() => router.push(`/academic/upload?branch=${encodeURIComponent(detailsObj.branch)}&semester=${encodeURIComponent(detailsObj.semester)}&subject=${encodeURIComponent(detailsObj.subject)}`)}
                        >
                          <Ionicons name="cloud-upload-outline" size={18} color={COLORS.background} />
                          <Text style={styles.fulfillBtnText}>Fulfill / Upload</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.resolveBtn}
                          onPress={() => updateStatus(r._id, 'resolved')}
                        >
                          <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                          <Text style={styles.resolveBtnText}>Mark Resolved</Text>
                        </TouchableOpacity>
                      </>
                    )}
                    {isResolved && (
                      <View style={styles.resolvedLabelBox}>
                        <Ionicons name="checkmark-done" size={18} color={COLORS.success} />
                        <Text style={styles.resolvedLabelText}>Request Fulfilled</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { height: 60, backgroundColor: COLORS.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: SPACING.lg, gap: SPACING.md, maxWidth: 800, width: '100%', alignSelf: 'center' },
  
  errorBox: { padding: SPACING.lg, backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.danger, alignItems: 'center' },
  errorText: { color: COLORS.danger, fontWeight: '600', marginBottom: 12 },
  retryBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.sm },
  retryBtnText: { color: COLORS.background, fontWeight: '700' },
  
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12 },
  emptyText: { color: COLORS.textMuted, fontSize: 15, textAlign: 'center' },
  
  card: { backgroundColor: COLORS.card, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, overflow: 'hidden' },
  resolvedCard: { opacity: 0.6, borderColor: COLORS.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  subjectInfo: { flex: 1, gap: 6 },
  subjectText: { fontSize: 16, fontWeight: '700', color: COLORS.heading },
  badgeRow: { flexDirection: 'row', gap: 6 },
  branchBadge: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.sm },
  semesterBadge: { backgroundColor: COLORS.surface, paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border },
  badgeText: { fontSize: 11, fontWeight: '600', color: COLORS.text },
  
  statusBox: { alignSelf: 'flex-start' },
  statusText: { fontSize: 11, fontWeight: '700', borderRadius: RADIUS.round, paddingHorizontal: 8, paddingVertical: 4, textTransform: 'uppercase' },
  statusNew: { color: COLORS.accent, backgroundColor: 'rgba(56, 189, 248, 0.1)' },
  statusResolved: { color: COLORS.success, backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  
  cardBody: { paddingVertical: SPACING.sm },
  detailLabel: { fontSize: 12, fontWeight: '600', color: COLORS.textMuted, marginBottom: 4 },
  detailText: { fontSize: 14, color: COLORS.text, lineHeight: 20 },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.md },
  studentInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  studentInfoText: { fontSize: 12, color: COLORS.textMuted },
  
  cardActions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm },
  fulfillBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, paddingVertical: 10, borderRadius: RADIUS.md, gap: 6 },
  fulfillBtnText: { color: COLORS.background, fontWeight: '700', fontSize: 14 },
  resolveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface, paddingVertical: 10, borderRadius: RADIUS.md, gap: 6, borderWidth: 1, borderColor: COLORS.border },
  resolveBtnText: { color: COLORS.text, fontWeight: '600', fontSize: 14 },
  
  resolvedLabelBox: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 8 },
  resolvedLabelText: { color: COLORS.success, fontSize: 14, fontWeight: '700' }
});
