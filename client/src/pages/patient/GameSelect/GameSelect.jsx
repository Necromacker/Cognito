import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import HelpButton from '../../../components/HelpButton/HelpButton';
import GameCard from '../../../components/GameCard/GameCard';
import api from '../../../api';
import './GameSelect.css';

export default function GameSelect() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all'); // 'all', 'family', 'brain'

  const patientId = user?.patientProfileId || user?.id;

  const games = [
    // Personalised Games (Family & Content)
    { id: 'who-is-this', category: 'family', icon: '👤', title: 'Who Is This?', desc: 'See a photo of a family member and recall their name.' },
    { id: 'whose-voice', category: 'family', icon: '🎙️', title: 'Whose Voice Is This?', desc: 'Listen to a voice clip and match who is speaking.' },
    { id: 'name-to-face', category: 'family', icon: '🔍', title: 'Name to Face', desc: 'Read a loved one’s name and pick their picture.' },
    { id: 'relationship-match', category: 'family', icon: '❤️', title: 'Family Relationship', desc: 'Remember whether someone is your daughter, son, or friend.' },
    { id: 'place-recognition', category: 'family', icon: '🏡', title: 'Place Recognition', desc: 'Recognise beloved homes, vacation spots, and towns.' },
    { id: 'life-timeline', category: 'family', icon: '⏳', title: 'Life Timeline', desc: 'Arrange milestone family photos in chronological order.' },
    { id: 'familiar-songs', category: 'family', icon: '🎵', title: 'Familiar Songs', desc: 'Listen to a nostalgic melody and recall the song title.' },

    // General Brain & Comfort Games
    { id: 'memory-pairs', category: 'brain', icon: '🃏', title: 'Memory Pairs', desc: 'Gentle card-matching game with happy animal symbols.' },
    { id: 'object-naming', category: 'brain', icon: '☕', title: 'Object Naming', desc: 'Name familiar everyday objects like teacups and clocks.' },
    { id: 'simple-sorting', category: 'brain', icon: '🧺', title: 'Simple Sorting', desc: 'Sort items into natural buckets like fruits and vegetables.' },
    { id: 'color-shape', category: 'brain', icon: '🎨', title: 'Colour & Shape', desc: 'Match warm colours and friendly geometric shapes.' },
    { id: 'orientation', category: 'brain', icon: '☀️', title: 'Today’s Time & Season', desc: 'Gentle questions about the time of day and season.' },
    { id: 'simple-jigsaw', category: 'brain', icon: '🧩', title: 'Gentle Jigsaw', desc: 'A 4-piece soothing puzzle from your family pictures.' },
    { id: 'daily-routine', category: 'brain', icon: '🫖', title: 'Daily Routine', desc: 'Order peaceful steps like making chai or morning teeth brushing.' }
  ];

  const filteredGames = filter === 'all'
    ? games
    : games.filter(g => g.category === filter);

  return (
    <div className="game-select-page">
      <div className="game-select-container">
        
        {/* Header */}
        <div className="game-select-header">
          <button type="button" className="game-select-back" onClick={() => navigate('/patient')}>
            ⬅ {t('back_home')}
          </button>
          <h1 className="game-select-title">🎮 {t('play_games')}</h1>
          <p className="game-select-subtitle">
            Choose any activity you like today. There is no rush and no timers.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="game-select-filters">
          <button
            type="button"
            className={`filter-pill ${filter === 'all' ? 'filter-pill--active' : ''}`}
            onClick={() => setFilter('all')}
          >
            🌟 All Games ({games.length})
          </button>
          <button
            type="button"
            className={`filter-pill ${filter === 'family' ? 'filter-pill--active' : ''}`}
            onClick={() => setFilter('family')}
          >
            👨‍👩‍👧 Family & Memories (7)
          </button>
          <button
            type="button"
            className={`filter-pill ${filter === 'brain' ? 'filter-pill--active' : ''}`}
            onClick={() => setFilter('brain')}
          >
            🧩 Mind & Relaxation (7)
          </button>
        </div>

        {/* Games Grid */}
        <div className="games-catalog-grid">
          {filteredGames.map(game => (
            <GameCard
              key={game.id}
              icon={game.icon}
              title={game.title}
              description={game.desc}
              badge={game.category === 'family' ? 'Personalised' : 'Relaxing'}
              onClick={() => navigate(`/patient/game/${game.id}`)}
            />
          ))}
        </div>

        {/* Always visible help button */}
        <HelpButton />

      </div>
    </div>
  );
}

