import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './LanguageSwitcher.css';

export default function LanguageSwitcher() {
  const { language, switchLanguage } = useLanguage();

  return (
    <div className="lang-switcher" role="radiogroup" aria-label="Select language">
      <div className="lang-globe-icon">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
      </div>
      <button
        type="button"
        className={`lang-btn ${language === 'en' ? 'lang-btn--active' : ''}`}
        onClick={() => switchLanguage('en')}
        title="English"
      >
        EN
      </button>
      <button
        type="button"
        className={`lang-btn ${language === 'hi' ? 'lang-btn--active' : ''}`}
        onClick={() => switchLanguage('hi')}
        title="हिंदी (Hindi)"
      >
        HI
      </button>
      <button
        type="button"
        className={`lang-btn ${language === 'mr' ? 'lang-btn--active' : ''}`}
        onClick={() => switchLanguage('mr')}
        title="मराठी (Marathi)"
      >
        MR
      </button>
    </div>
  );
}
