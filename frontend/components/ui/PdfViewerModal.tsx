import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SPACING } from '../../theme/colors';

interface PdfViewerModalProps {
  visible: boolean;
  onClose: () => void;
  fileUrl: string;
  title: string;
  subject?: string;
  branch?: string;
  semester?: string;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  visible,
  onClose,
  fileUrl,
  title,
  subject,
  branch,
  semester,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { width, height } = useWindowDimensions();
  const isPhone = width <= 560;

  if (!visible || !fileUrl) return null;

  const encodedUrl = encodeURIComponent(fileUrl);
  // Google Docs Viewer embed URL for cross-platform iframe support
  const viewerUrl =
    Platform.OS === 'web'
      ? fileUrl.toLowerCase().endsWith('.pdf')
        ? fileUrl
        : `https://docs.google.com/gview?embedded=true&url=${encodedUrl}`
      : `https://docs.google.com/gview?embedded=true&url=${encodedUrl}`;

  const handleOpenExternal = () => {
    Linking.openURL(fileUrl).catch((err) => {
      console.error('[PdfViewerModal] Couldn\'t open URL:', err);
      Alert.alert('Error', 'Unable to open file link in browser.');
    });
  };

  const handleCopyLink = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(fileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        Alert.alert('Link Copied', fileUrl);
      }
    } catch (e) {
      Alert.alert('Link', fileUrl);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header Bar */}
        <View style={[styles.header, isPhone && styles.headerPhone]}>
          <View style={styles.headerTitleBox}>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Ionicons name="document-text-outline" size={12} color="#38BDF8" />
                <Text style={styles.badgeText}>{subject || 'PDF Note'}</Text>
              </View>
              {(branch || semester) && (
                <View style={styles.subBadge}>
                  <Text style={styles.subBadgeText}>
                    {[branch, semester].filter(Boolean).join(' • ')}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.docTitle} numberOfLines={1}>
              {title || 'Academic Resource'}
            </Text>
          </View>

          {/* Controls / Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={handleCopyLink}
              activeOpacity={0.7}
            >
              <Ionicons
                name={copied ? 'checkmark' : 'link-outline'}
                size={18}
                color={copied ? '#10B981' : '#F8FAFC'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconBtn, styles.externalBtn]}
              onPress={handleOpenExternal}
              activeOpacity={0.7}
            >
              <Ionicons name="open-outline" size={18} color="#38BDF8" />
              {!isPhone && <Text style={styles.externalBtnText}>External</Text>}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconBtn, styles.closeBtn]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="#F8FAFC" />
            </TouchableOpacity>
          </View>
        </View>

        {/* PDF Viewer Frame Body */}
        <View style={styles.body}>
          {isLoading && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#38BDF8" />
              <Text style={styles.loadingText}>Loading Document Viewer...</Text>
            </View>
          )}

          {Platform.OS === 'web' ? (
            <iframe
              src={viewerUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: '#09090b',
              }}
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
              title={title}
            />
          ) : (
            // For native Expo environments on React Native Web
            <iframe
              src={viewerUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                backgroundColor: '#09090b',
              }}
              onLoad={() => setIsLoading(false)}
              title={title}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    height: 64,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
  },
  headerPhone: {
    paddingHorizontal: SPACING.sm,
  },
  headerTitleBox: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#38BDF8',
  },
  subBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  subBadgeText: {
    fontSize: 10,
    color: '#94A3B8',
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  externalBtn: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    width: 'auto',
    gap: 4,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderWidth: 1,
  },
  externalBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#38BDF8',
  },
  closeBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  body: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#09090b',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#09090b',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: '#94A3B8',
  },
});
