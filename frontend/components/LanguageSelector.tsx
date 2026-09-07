import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  TouchableWithoutFeedback,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LANGUAGES, LanguageCode } from '../constants/translations';
import { useTranslation } from '../store/languageStore';

const COLORS = {
  background: '#09090b',
  card: '#18181b',
  cardHover: '#27272a',
  accent: '#38BDF8',
  text: '#F8FAFC',
  subtext: '#94A3B8',
  border: '#27272a',
  overlay: 'rgba(0, 0, 0, 0.75)',
};

interface LanguageSelectorProps {
  style?: object;
  compact?: boolean;
}

export function LanguageSelector({ style, compact = false }: LanguageSelectorProps) {
  const { language, setLanguage, t, isRTL } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const currentOption = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const handleSelect = (code: LanguageCode) => {
    setLanguage(code);
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Instagram Style Header Trigger Button */}
      <TouchableOpacity
        style={[styles.triggerBtn, isHovered && styles.triggerBtnHovered]}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t('selectLanguage')}
        {...({
          onHoverIn: () => setIsHovered(true),
          onHoverOut: () => setIsHovered(false),
        } as any)}
      >
        <Ionicons name="globe-outline" size={16} color={COLORS.accent} style={styles.globeIcon} />
        <Text style={styles.triggerText}>
          {compact ? currentOption.label : currentOption.nativeLabel}
        </Text>
        <Ionicons name="chevron-down" size={14} color={COLORS.subtext} />
      </TouchableOpacity>

      {/* Language Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalCard, isRTL && styles.modalCardRTL]}>
                <View style={styles.modalHeader}>
                  <View style={styles.headerTitleRow}>
                    <Ionicons name="language-outline" size={20} color={COLORS.accent} />
                    <Text style={styles.modalTitle}>{t('selectLanguage')}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeBtn}
                    accessibilityRole="button"
                  >
                    <Ionicons name="close" size={20} color={COLORS.subtext} />
                  </TouchableOpacity>
                </View>

                <View style={styles.optionList}>
                  {LANGUAGES.map((item) => {
                    const isSelected = item.code === language;
                    return (
                      <Pressable
                        key={item.code}
                        style={({ hovered }: any) => [
                          styles.optionItem,
                          hovered && styles.optionItemHovered,
                          isSelected && styles.optionItemSelected,
                          isRTL && styles.optionItemRTL,
                        ]}
                        onPress={() => handleSelect(item.code)}
                      >
                        <View style={styles.optionLeft}>
                          <Text style={styles.flagEmoji}>{item.flag}</Text>
                          <View style={styles.labelCol}>
                            <Text
                              style={[
                                styles.nativeLabelText,
                                isSelected && styles.selectedText,
                              ]}
                            >
                              {item.nativeLabel}
                            </Text>
                            <Text style={styles.englishLabelText}>{item.label}</Text>
                          </View>
                        </View>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={22} color={COLORS.accent} />
                        )}
                      </Pressable>
                    );
                  })}
                </View>

                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    gap: 6,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transitionProperty: 'all',
        transitionDuration: '200ms',
      } as any,
      default: {},
    }),
  },
  triggerBtnHovered: {
    backgroundColor: 'rgba(56, 189, 248, 0.16)',
    borderColor: COLORS.accent,
    transform: [{ translateY: -1 }],
  },
  globeIcon: {
    marginRight: 2,
  },
  triggerText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 20,
    ...Platform.select({
      web: {
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 25px rgba(56, 189, 248, 0.15)',
      } as any,
      default: {
        elevation: 10,
      },
    }),
  },
  modalCardRTL: {
    direction: 'rtl',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  optionList: {
    gap: 10,
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transitionProperty: 'all',
        transitionDuration: '150ms',
      } as any,
      default: {},
    }),
  },
  optionItemRTL: {
    flexDirection: 'row-reverse',
  },
  optionItemHovered: {
    backgroundColor: COLORS.cardHover,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  optionItemSelected: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderColor: COLORS.accent,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flagEmoji: {
    fontSize: 22,
  },
  labelCol: {
    gap: 2,
  },
  nativeLabelText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  selectedText: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  englishLabelText: {
    color: COLORS.subtext,
    fontSize: 12,
  },
  cancelBtn: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cancelBtnText: {
    color: COLORS.subtext,
    fontSize: 14,
    fontWeight: '600',
  },
});
