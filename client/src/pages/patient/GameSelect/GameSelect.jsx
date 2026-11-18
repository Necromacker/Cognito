import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import HelpButton from '../../../components/HelpButton/HelpButton';
import './GameSelect.css';

export default function GameSelect() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const games = [
    // Personalised
    { id: 'who-is-this', category: 'family', tag: 'PHOTO', title: 'WHO IS THIS?', desc: 'Recall family member names from photos.' },
    { id: 'whose-voice', category: 'family', tag: 'AUDIO', title: 'WHOSE VOICE?', desc: 'Listen to voice clips and match the speaker.' },
    { id: 'name-to-face', category: 'family', tag: 'MATCH', title: 'NAME TO FACE', desc: 'Read a loved one’s name and choose their picture.' },
    { id: 'relationship-match', category: 'family', tag: 'FAMILY', title: 'RELATIONSHIP', desc: 'Identify whether someone is daughter, son, or friend.' },
    { id: 'place-recognition', category: 'family', tag: 'PLACE', title: 'RECOGNISE PLACES', desc: 'Recall familiar homes, holiday towns, and gardens.' },
    { id: 'life-timeline', category: 'family', tag: 'CHRONO', title: 'LIFE TIMELINE', desc: 'Order milestone memories by year.' },
    { id: 'familiar-songs', category: 'family', tag: 'MUSIC', title: 'FAMILIAR SONGS', desc: 'Listen to nostalgic melodies and recall the title.' },

    // General
    { id: 'memory-pairs', category: 'brain', tag: 'PAIRS', title: 'MEMORY PAIRS', desc: 'Card-matching game with friendly symbols.' },
    { id: 'object-naming', category: 'brain', tag: 'OBJECTS', title: 'OBJECT NAMING', desc: 'Name common items like teacups and clocks.' },
    { id: 'simple-sorting', category: 'brain', tag: 'SORT', title: 'SIMPLE SORTING', desc: 'Sort items into natural categories.' },
    { id: 'color-shape', category: 'brain', tag: 'SHAPES', title: 'COLOUR & SHAPE', desc: 'Match vibrant colours and clean geometric shapes.' },
    { id: 'orientation', category: 'brain', tag: 'TIME', title: 'TIME & SEASON', desc: 'Questions on time of day, day of week, and season.' },
    { id: 'simple-jigsaw', category: 'brain', tag: 'PUZZLE', title: 'GENTLE JIGSAW', desc: '4-piece jigsaw puzzle from family pictures.' },
    { id: 'daily-routine', category: 'brain', tag: 'ROUTINE', title: 'DAILY ROUTINE', desc: 'Sequence steps like making tea or morning wash.' }
  ];

  const filteredGames = filter === 'all'
    ? games
    : games.filter(g => g.category === filter);

  return (
    <div className="game-select-page">
      <div className="game-select-container">
        
        {/* Top Controls */}
        <div className="game-select-strip">
          <div className="game-select-filters">
            <button
              type="button"
              className={`filter-tab ${filter === 'all' ? 'filter-tab--active' : ''}`}
              onClick={() => setFilter('all')}
            >
              ALL ({games.length})
            </button>
            <button
              type="button"
              className={`filter-tab ${filter === 'family' ? 'filter-tab--active' : ''}`}
              onClick={() => setFilter('family')}
            >
              FAMILY & CONTENT (7)
            </button>
            <button
              type="button"
              className={`filter-tab ${filter === 'brain' ? 'filter-tab--active' : ''}`}
              onClick={() => setFilter('brain')}
            >
              MIND & COMFORT (7)
            </button>
          </div>
        </div>

        {/* Compact Retro Game Tiles Grid */}
        <div className="games-catalog-grid">
          {filteredGames.map(game => (
            <div
              key={game.id}
              className="game-retro-tile card"
              onClick={() => navigate(`/patient/game/${game.id}`)}
            >
              <div className="tile-top-bar">
                <span className="tile-tag">{game.tag}</span>
                <span className="tile-cat-badge">{game.category.toUpperCase()}</span>
              </div>
              <h3 className="tile-title">{game.title}</h3>
              <p className="tile-desc">{game.desc}</p>
              <button type="button" className="tile-play-btn">
                PLAY ▶
              </button>
            </div>
          ))}
        </div>

        <HelpButton />

      </div>
    </div>
  );
}
