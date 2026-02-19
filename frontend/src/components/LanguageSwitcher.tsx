import { useTranslation } from '../i18n/i18n';
import './LanguageSwitcher.css';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="language-switcher">
      <button
        className={`lang-button ${language === 'sq' ? 'active' : ''}`}
        onClick={() => setLanguage('sq')}
        aria-label="Shqip"
      >
        🇦🇱 SQ
      </button>
      <button
        className={`lang-button ${language === 'en' ? 'active' : ''}`}
        onClick={() => setLanguage('en')}
        aria-label="English"
      >
        🇬🇧 EN
      </button>
    </div>
  );
}

