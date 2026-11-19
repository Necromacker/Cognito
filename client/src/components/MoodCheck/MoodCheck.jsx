import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../api';
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
    <div className="mood-check-card card" role="region" aria-label="Daily mood check">
      <div className="mood-check__top">
        <span className="label-caps">{t('daily_check_label')}</span>
        <span className="mood-check__title">{t('mood_check_question')}</span>
      </div>
      
      <div className="mood-check__options">
        <button
          type="button"
          className={`mood-btn ${selectedMood === 'happy' ? 'mood-btn--selected' : ''}`}
          onClick={() => handleSelect('happy')}
        >
          <span className="mood-btn__indicator mood-btn__indicator--green"></span>
          <span className="mood-btn__label">{t('mood_good_cheerful')}</span>
        </button>

        <button
          type="button"
          className={`mood-btn ${selectedMood === 'neutral' ? 'mood-btn--selected' : ''}`}
          onClick={() => handleSelect('neutral')}
        >
          <span className="mood-btn__indicator mood-btn__indicator--yellow"></span>
          <span className="mood-btn__label">{t('mood_peaceful_calm')}</span>
        </button>

        <button
          type="button"
          className={`mood-btn ${selectedMood === 'sad' ? 'mood-btn--selected' : ''}`}
          onClick={() => handleSelect('sad')}
        >
          <span className="mood-btn__indicator mood-btn__indicator--pink"></span>
          <span className="mood-btn__label">{t('mood_tired_low')}</span>
        </button>
      </div>

      {savedMessage && (
        <div className="mood-check__feedback" role="status">
          {t('mood_recorded_feedback')}
        </div>
      )}
    </div>
  );
}
