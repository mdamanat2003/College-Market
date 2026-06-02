import { Platform } from 'react-native';

import { API_URL } from '../services/api';

const LOCALHOST_PATTERN = /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?/i;

export function resolveImageUri(uri?: string | null) {
  if (!uri) return null;

  const value = uri.trim();
  if (!value) return null;

  if (/^(blob:|data:|file:|content:)/i.test(value)) {
    return value;
  }

  if (/^https?:\/\//i.test(value)) {
    if (Platform.OS === 'web' && /^http:\/\//i.test(value) && !LOCALHOST_PATTERN.test(value)) {
      return value.replace(/^http:\/\//i, 'https://');
    }

    return value;
  }

  try {
    return new URL(value, API_URL).toString();
  } catch {
    return value;
  }
}