import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

vi.mock('react-native', () => ({
  I18nManager: {
    isRTL: false,
    allowRTL: vi.fn(),
    forceRTL: vi.fn(),
  },
  Platform: {
    OS: 'web',
  },
}));

import { useLanguageStore } from '../languageStore';

describe('languageStore', () => {
  beforeEach(() => {
    useLanguageStore.getState().setLanguage('en');
  });

  it('should initialize with default English language', () => {
    const state = useLanguageStore.getState();
    expect(state.language).toBe('en');
    expect(state.isRTL).toBe(false);
    expect(state.t('welcomeBack')).toBe('Welcome Back');
  });

  it('should change language to Hindi', () => {
    useLanguageStore.getState().setLanguage('hi');
    const state = useLanguageStore.getState();

    expect(state.language).toBe('hi');
    expect(state.isRTL).toBe(false);
    expect(state.t('welcomeBack')).toBe('वापसी पर स्वागत है');
    expect(state.t('signIn')).toBe('साइन इन करें');
  });

  it('should change language to Arabic and enable RTL', () => {
    useLanguageStore.getState().setLanguage('ar');
    const state = useLanguageStore.getState();

    expect(state.language).toBe('ar');
    expect(state.isRTL).toBe(true);
    expect(state.dir).toBe('rtl');
    expect(state.t('welcomeBack')).toBe('مرحباً بعودتك');
    expect(state.t('signIn')).toBe('تسجيل الدخول');
  });

  it('should fallback to key or English string if translation is missing', () => {
    const state = useLanguageStore.getState();
    expect(state.t('nonExistentKey' as any, 'Fallback Value')).toBe('Fallback Value');
  });
});
