import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useGSAP } from '../../../hooks/useGSAP';
import MoodCheck from '../../../components/MoodCheck/MoodCheck';
import HelpButton from '../../../components/HelpButton/HelpButton';
import StarRating from '../../../components/StarRating/StarRating';
import api from '../../../api';
import gsap from 'gsap';
import './PatientHome.css';

export default function PatientHome() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ accuracy: 0, streak: 1, stars: 4 });
  const [patientMood, setPatientMood] = useState(null);

  // Time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('greeting_morning');
    if (hour < 17) return t('greeting_afternoon');
    return t('greeting_evening');
  };

  const patientId = user?.patientProfileId || user?.id;

  useEffect(() => {
    if (patientId) {
      api.get(`/dashboard/stats/${patientId}`)
        .then(res => {
          const s = res.data;
          setStats({
            accuracy: s.accuracy || 85,
            streak: s.streak || 1,
            stars: Math.max(1, Math.min(5, Math.round((s.accuracy || 80) / 20)))
          });
        })
        .catch(() => {});
    }
  }, [patientId]);

  const containerRef = useGSAP(() => {
    gsap.from('.patient-home__hero', { opacity: 0, y: 25, duration: 0.7, ease: 'power2.out' });
    gsap.from('.patient-action-card', { opacity: 0, y: 20, duration: 0.6, stagger: 0.2, ease: 'power2.out', delay: 0.2 });
  }, []);

  return (
    <main ref={containerRef} className="patient-home-page" role="main">
      <div className="patient-home-container">
        
        {/* Friendly Greeting Header */}
        <header className="patient-home__hero">
          <div className="patient-avatar-box">
            <img
              src={user?.avatar_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'}
              alt={user?.name || 'Patient photo'}
              className="patient-avatar-img"
            />
          </div>
          <h1 className="patient-home__greeting">
            {getGreeting()}, <span className="patient-name-highlight">{user?.name || 'Friend'}</span>!
          </h1>
          <p className="patient-home__welcome-sub">
            It is a peaceful day. Let us enjoy some happy moments together.
          </p>
          <div className="patient-stars-display">
            <StarRating stars={stats.stars} maxStars={5} showStreak={true} streak={stats.streak} />
          </div>
        </header>

        {/* 1. Daily Mood Check (3 emoji buttons) */}
        <section aria-labelledby="daily-mood-heading">
          <h2 id="daily-mood-heading" className="sr-only">Daily Mood Check</h2>
          <MoodCheck
            patientId={patientId}
            onMoodSelected={(m) => setPatientMood(m)}
          />
        </section>

        {/* 2. Primary 2 Core Patient Actions (Max 3 items on screen) */}
        <section className="patient-actions-grid" aria-label="Main activities">
          {/* Action 1: Play Gentle Games */}
          <div
            className="patient-action-card patient-action-card--play"
            onClick={() => navigate('/patient/games')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate('/patient/games'); }}
          >
            <div className="patient-action__icon">🎮</div>
            <div className="patient-action__info">
              <h2 className="patient-action__title">{t('play_games')}</h2>
              <p className="patient-action__desc">
                {patientMood === 'sad'
                  ? 'Relaxing, gentle fun to brighten your spirit.'
                  : 'Fun pictures, music and gentle brain activities.'}
              </p>
            </div>
            <div className="patient-action__chevron">➔</div>
          </div>

          {/* Action 2: My Memories Gallery */}
          <div
            className="patient-action-card patient-action-card--memories"
            onClick={() => navigate('/patient/memories')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') navigate('/patient/memories'); }}
          >
            <div className="patient-action__icon">🖼️</div>
            <div className="patient-action__info">
              <h2 className="patient-action__title">{t('my_memories')}</h2>
              <p className="patient-action__desc">
                Look at cherished photos of your loving family and favourite places.
              </p>
            </div>
            <div className="patient-action__chevron">➔</div>
          </div>
        </section>

        {/* Always-visible Help Button */}
        <HelpButton />

      </div>
    </main>
  );
}

