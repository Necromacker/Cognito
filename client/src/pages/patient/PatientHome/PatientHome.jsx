import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import MoodCheck from '../../../components/MoodCheck/MoodCheck';
import HelpButton from '../../../components/HelpButton/HelpButton';
import StarRating from '../../../components/StarRating/StarRating';
import api from '../../../api';
import './PatientHome.css';

export default function PatientHome() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [stats, setStats] = useState({ accuracy: 0, streak: 1, stars: 4 });

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

  return (
    <main className="patient-home-page">
      <div className="patient-home-container">
        
        {/* Compact Clean Header */}
        <header className="patient-home__hero card">
          <div className="patient-hero-top">
            <span className="badge badge--pink">PATIENT ACTIVE</span>
            <span className="badge badge--green">STAGE: {user?.stage?.toUpperCase() || 'EARLY'}</span>
          </div>

          <h1 className="patient-home__greeting">
            Welcome, <span className="patient-name-highlight">{user?.name || 'Ramesh'}</span>
          </h1>

          <div className="patient-stars-display">
            <StarRating stars={stats.stars} maxStars={5} showStreak={true} streak={stats.streak} />
          </div>
        </header>

        {/* Daily Mood Check */}
        <section>
          <MoodCheck patientId={patientId} />
        </section>

        {/* Core Actions Matching Pixel Picnic Boxy Card Aesthetic */}
        <section className="patient-actions-grid">
          <div
            className="patient-action-card card"
            onClick={() => navigate('/patient/games')}
            role="button"
            tabIndex={0}
          >
            <div className="patient-action__tag">MODULE 01</div>
            <h2 className="patient-action__title">GENTLE GAMES</h2>
            <p className="patient-action__desc">
              Pictures, sounds and calming memory activities.
            </p>
            <div className="patient-action__btn">PLAY ▶</div>
          </div>

          <div
            className="patient-action-card card"
            onClick={() => navigate('/patient/memories')}
            role="button"
            tabIndex={0}
          >
            <div className="patient-action__tag">MODULE 02</div>
            <h2 className="patient-action__title">MY MEMORIES</h2>
            <p className="patient-action__desc">
              Family photos, favourite places, and life milestones.
            </p>
            <div className="patient-action__btn">OPEN ▶</div>
          </div>
        </section>

        {/* Clean Help Button */}
        <HelpButton />

      </div>
    </main>
  );
}
