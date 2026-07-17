import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { en, type MessageKey } from './en';
import { zhHans } from './zh-Hans';

export type Locale = 'en' | 'zh-Hans';

const DICTS: Record<Locale, Record<MessageKey, string>> = {
  en,
  'zh-Hans': zhHans,
};

const STORAGE_KEY = 'locale';

function initialLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'zh-Hans') {
      return stored;
    }
  } catch {
    // ignore
  }
  return navigator.language.toLowerCase().startsWith('zh') ? 'zh-Hans' : 'en';
}

interface I18nValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: MessageKey) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    document.documentElement.lang = next === 'zh-Hans' ? 'zh-Hans' : 'en';
    setLocaleState(next);
  }, []);

  const t = useCallback((key: MessageKey) => DICTS[locale][key] ?? en[key] ?? key, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
