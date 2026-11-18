import React, { useState } from 'react';
import api from '../../api';
import { useLanguage } from '../../context/LanguageContext';
import './MoodCheck.css';

export default function MoodCheck({ patientId, onMoodSelected }) {
  const { t } = useLanguage();
  const [selectedMood, setSelectedMood] = useState(null);
  const [savedMessage, setSavedMessage] = useState(false);

  const handleSelect = async (mood) => {
    setSelectedMood(mood);
    setSavedMessage(true);

    try {
      if (patientId) {
        await api.post('/mood/check', { patientId, mood });
      }
      if (onMoodSelected) {
        onMoodSelected(mood);
      }
    } catch (err) {
      console.error('Mood check save error:', err);
    }

    setTimeout(() => {
      setSavedMessage(false);
    }, 3000);
  };

  return (
    <div className="mood-check-card" role="region" aria-label="Daily mood check">
      <h2 className="mood-check__title">{t('mood_question')}</h2>
      
      <div className="mood-check__options">
        <button
          type="button"
          className={`mood-btn ${selectedMood === 'happy' ? 'mood-btn--selected' : ''}`}
          onClick={() => handleSelect('happy')}
          aria-label={t('mood_happy')}
        >
          <span className="mood-btn__emoji" role="img" aria-hidden="true">😊</span>
          <span className="mood-btn__label">{t('mood_happy')}</span>
        </button>

        <button
          type="button"
          className={`mood-btn ${selectedMood === 'neutral' ? 'mood-btn--selected' : ''}`}
          onClick={() => handleSelect('neutral')}
          aria-label={t('mood_neutral')}
        >
          <span className="mood-btn__emoji" role="img" aria-hidden="true">😐</span>
          <span className="mood-btn__label">{t('mood_neutral')}</span>
        </button>

        <button
          type="button"
          className={`mood-btn ${selectedMood === 'sad' ? 'mood-btn--selected' : ''}`}
          onClick={() => handleSelect('sad')}
          aria-label={t('mood_sad')}
        >
          <span className="mood-btn__emoji" role="img" aria-hidden="true">😢</span>
          <span className="mood-btn__label">{t('mood_sad')}</span>
        </button>
      </div>

      {savedMessage && (
        <div className="mood-check__feedback" role="status">
          ✨ Thank you for sharing how you feel. We are here with you!
        </div>
      )}
    </div>
  );
}

