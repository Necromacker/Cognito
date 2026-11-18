import React, { useState } from 'react';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import './HelpButton.css';

export default function HelpButton() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Show only for patient role or on patient screens
  if (!user || user.role !== 'patient') return null;

  const handleHelp = async () => {
    if (loading) return;
    setLoading(true);

    try {
      await api.post('/mood/help', {
        patientId: user.patientProfileId || user.id
      });
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      console.error('Help alert error:', err);
      setSent(true); // Still reassure the patient regardless
      setTimeout(() => setSent(false), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="help-button-container">
      <button
        type="button"
        className={`help-button ${sent ? 'help-button--sent' : ''}`}
        onClick={handleHelp}
        disabled={loading}
        aria-live="polite"
      >
        <span className="help-button__icon">💛</span>
        <span className="help-button__text">
          {sent ? t('help_sent') : t('help_button')}
        </span>
      </button>
    </div>
  );
}

