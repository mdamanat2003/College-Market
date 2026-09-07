import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager, Platform } from 'react-native';
import { LANGUAGES, LanguageCode, translations, TranslationKeys } from '../constants/translations';

interface LanguageState {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: TranslationKeys, fallback?: string) => string;
  isRTL: boolean;
  dir: 'ltr' | 'rtl';
}

const applyDirection = (lang: LanguageCode) => {
  const selectedLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  const isRTL = selectedLang.dir === 'rtl';

  try {
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
    }
  } catch (e) {
    console.warn('Could not set I18nManager direction:', e);
  }

  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    document.documentElement.dir = selectedLang.dir;
    document.documentElement.lang = selectedLang.code;
  }
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: 'en',

      setLanguage: (lang: LanguageCode) => {
        applyDirection(lang);
        const selectedLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
        set({
          language: lang,
          isRTL: selectedLang.dir === 'rtl',
          dir: selectedLang.dir,
        });
      },

      t: (key: TranslationKeys, fallback?: string): string => {
        const currentLang = get().language || 'en';
        const langDict = translations[currentLang] || translations.en;
        if (key in langDict) {
          return langDict[key as keyof typeof langDict];
        }
        if (key in translations.en) {
          return translations.en[key as keyof typeof translations.en];
        }
        return fallback || String(key);
      },

      isRTL: false,
      dir: 'ltr',
    }),
    {
      name: 'language-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          applyDirection(state.language);
        }
      },
    }
  )
);

// Helper hook for functional components
export const useTranslation = () => {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const t = useLanguageStore((s) => s.t);
  const isRTL = useLanguageStore((s) => s.isRTL);
  const dir = useLanguageStore((s) => s.dir);

  return { language, setLanguage, t, isRTL, dir, LANGUAGES };
};
