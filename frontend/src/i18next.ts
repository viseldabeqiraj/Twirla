import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './i18n/translations/en.json';
import sq from './i18n/translations/sq.json';

const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('twirla_language') : null;
const lng = stored === 'en' || stored === 'sq' ? stored : 'sq';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en as Record<string, unknown> },
    sq: { translation: sq as Record<string, unknown> },
  },
  lng,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
