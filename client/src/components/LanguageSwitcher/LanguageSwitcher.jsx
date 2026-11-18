import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './LanguageSwitcher.css';

export default function LanguageSwitcher() {
  const { language, switchLanguage } = useLanguage();

  return (
    <div className="lang-switcher" role="radiogroup" aria-label="Select language">
      <button
        type="button"
        className={`lang-btn ${language === 'en' ? 'lang-btn--active' : ''}`}
        onClick={() => switchLanguage('en')}
        aria-checked={language === 'en'}
        role="radio"
      >
        EN
      </button>
      <button
        type="button"
        className={`lang-btn ${language === 'hi' ? 'lang-btn--active' : ''}`}
        onClick={() => switchLanguage('hi')}
        aria-checked={language === 'hi'}
        role="radio"
      >
        हिन्दी
      </button>
      <button
        type="button"
        className={`lang-btn ${language === 'mr' ? 'lang-btn--active' : ''}`}
        onClick={() => switchLanguage('mr')}
        aria-checked={language === 'mr'}
        role="radio"
      >
        मराठी
      </button>
    </div>
  );
}

