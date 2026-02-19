import React, { createContext, useContext, useState, ReactNode } from 'react';
import enTranslations from './translations/en.json';
import sqTranslations from './translations/sq.json';

type Language = 'en' | 'sq';

interface Translations {
  [key: string]: any;
}

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const translations: Record<Language, Translations> = {
  en: enTranslations,
  sq: sqTranslations,
};

// Get language from localStorage or default to Albanian
const getStoredLanguage = (): Language => {
  const stored = localStorage.getItem('twirla_language');
  return (stored === 'en' || stored === 'sq') ? stored : 'sq';
};

// Store language preference
const setStoredLanguage = (lang: Language): void => {
  localStorage.setItem('twirla_language', lang);
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setStoredLanguage(lang);
  };

  // Translation function with parameter support
  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (value === undefined) {
      // Fallback to English if translation not found
      let fallbackValue: any = translations.en;
      for (const k of keys) {
        fallbackValue = fallbackValue?.[k];
      }
      value = fallbackValue || key;
    }
    
    // Replace parameters
    if (params && typeof value === 'string') {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }
    
    return value || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return context;
}

