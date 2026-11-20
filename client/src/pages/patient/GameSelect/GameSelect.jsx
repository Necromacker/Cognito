import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import HelpButton from '../../../components/HelpButton/HelpButton';
import './GameSelect.css';

export default function GameSelect() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [difficulty, setDifficulty] = useState(() => localStorage.getItem('patient_difficulty') || 'easy');

  const handleDifficultyChange = (diff) => {
    setDifficulty(diff);
    localStorage.setItem('patient_difficulty', diff);
  };

  // Dedicated custom SVGs tailored for every game
  const renderGameSvg = (id) => {
    switch (id) {
      case 'who-is-this':
        return (
          <svg viewBox="0 0 120 90" className="game-tile-illustration" aria-hidden="true">
            <rect width="120" height="90" rx="12" fill="#EBF4EE" />
            <rect x="25" y="12" width="70" height="66" rx="8" fill="#FFFFFF" stroke="#234E43" strokeWidth="2.5" />
            <circle cx="60" cy="38" r="16" fill="#DCECE5" stroke="#234E43" strokeWidth="2" />
            <circle cx="55" cy="35" r="2" fill="#234E43" />
            <circle cx="65" cy="35" r="2" fill="#234E43" />
            <path d="M54 44 Q60 50 66 44" fill="none" stroke="#234E43" strokeWidth="2" strokeLinecap="round" />
            <path d="M40 70 Q60 56 80 70" fill="#234E43" />
            <circle cx="82" cy="22" r="8" fill="#E9B75B" />
            <path d="M79 22 L85 22 M82 19 L82 25" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      case 'whose-voice':
        return (
          <svg viewBox="0 0 120 90" className="game-tile-illustration" aria-hidden="true">
            <rect width="120" height="90" rx="12" fill="#F3EEFF" />
            <rect x="52" y="22" width="16" height="28" rx="8" fill="#6335B5" />
            <path d="M44 36 C44 47 76 47 76 36" fill="none" stroke="#6335B5" strokeWidth="3" strokeLinecap="round" />
            <line x1="60" y1="50" x2="60" y2="64" stroke="#6335B5" strokeWidth="3" strokeLinecap="round" />
            <line x1="48" y1="64" x2="72" y2="64" stroke="#6335B5" strokeWidth="3" strokeLinecap="round" />
            {/* Audio Waves */}
            <path d="M36 30 C30 36 30 44 36 50" fill="none" stroke="#9D7AE2" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M28 24 C18 34 18 56 28 66" fill="none" stroke="#C5B2F0" strokeWidth="2" strokeLinecap="round" />
            <path d="M84 30 C90 36 90 44 84 50" fill="none" stroke="#9D7AE2" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M92 24 C102 34 102 56 92 66" fill="none" stroke="#C5B2F0" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      case 'name-to-face':
        return (
          <svg viewBox="0 0 120 90" className="game-tile-illustration" aria-hidden="true">
            <rect width="120" height="90" rx="12" fill="#E7F3FA" />
            {/* Left Name Badge */}
            <rect x="14" y="24" width="38" height="42" rx="6" fill="#FFFFFF" stroke="#0A3871" strokeWidth="2" />
            <line x1="20" y1="34" x2="46" y2="34" stroke="#0A3871" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="20" y1="42" x2="40" y2="42" stroke="#6BA4DE" strokeWidth="2" strokeLinecap="round" />
            <line x1="20" y1="50" x2="36" y2="50" stroke="#6BA4DE" strokeWidth="2" strokeLinecap="round" />
            {/* Arrow */}
            <path d="M56 45 L64 45 M61 40 L66 45 L61 50" stroke="#0A3871" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Right Photo */}
            <rect x="68" y="24" width="38" height="42" rx="6" fill="#FFFFFF" stroke="#0A3871" strokeWidth="2" />
            <circle cx="87" cy="40" r="10" fill="#CDE3F7" />
            <path d="M76 60 Q87 50 98 60" fill="#0A3871" />
            <circle cx="98" cy="24" r="6" fill="#2E7D32" />
            <polyline points="95 24 97 26 101 22" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        );

      case 'relationship-match':
        return (
          <svg viewBox="0 0 120 90" className="game-tile-illustration" aria-hidden="true">
            <rect width="120" height="90" rx="12" fill="#FDF0EE" />
            {/* Parent & Child silhouettes linked by heart */}
            <circle cx="44" cy="34" r="11" fill="#B74444" />
            <path d="M30 62 Q44 50 58 62" fill="#B74444" />
            <circle cx="76" cy="38" r="9" fill="#E88282" />
            <path d="M64 62 Q76 52 88 62" fill="#E88282" />
            {/* Floating Love Heart */}
            <path d="M60 22 C60 18 55 15 51 18 C46 22 60 30 60 30 C60 30 74 22 69 18 C65 15 60 18 60 22 Z" fill="#E9B75B" stroke="#B74444" strokeWidth="1.5" />
          </svg>
        );

      case 'place-recognition':
        return (
          <svg viewBox="0 0 120 90" className="game-tile-illustration" aria-hidden="true">
            <rect width="120" height="90" rx="12" fill="#EAF5F0" />
            {/* Cozy cottage house */}
            <polygon points="60 16 28 40 92 40" fill="#234E43" />
            <rect x="36" y="40" width="48" height="34" fill="#FFFFFF" stroke="#234E43" strokeWidth="2" />
            <rect x="52" y="52" width="16" height="22" fill="#E9B75B" />
            <circle cx="56" cy="63" r="1.5" fill="#202C2A" />
            <rect x="40" y="46" width="9" height="9" fill="#DCECE5" stroke="#234E43" strokeWidth="1.5" />
            <rect x="71" y="46" width="9" height="9" fill="#DCECE5" stroke="#234E43" strokeWidth="1.5" />
            {/* Location Pin */}
            <path d="M88 20 C84 20 81 23 81 27 C81 33 88 38 88 38 C88 38 95 33 95 27 C95 23 92 20 88 20 Z" fill="#B74444" />
            <circle cx="88" cy="26" r="2.5" fill="#FFFFFF" />
          </svg>
        );

      case 'life-timeline':
        return (
          <svg viewBox="0 0 120 90" className="game-tile-illustration" aria-hidden="true">
            <rect width="120" height="90" rx="12" fill="#FFF6E9" />
            {/* Timeline Track */}
            <path d="M18 52 Q60 30 102 52" fill="none" stroke="#E9B75B" strokeWidth="4" strokeLinecap="round" />
            {/* Milestones */}
            <circle cx="28" cy="46" r="8" fill="#FFFFFF" stroke="#E9B75B" strokeWidth="3" />
            <text x="28" y="50" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#E9B75B">1</text>
            <circle cx="60" cy="38" r="10" fill="#E9B75B" stroke="#234E43" strokeWidth="2.5" />
            <text x="60" y="42" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#FFFFFF">2</text>
            <circle cx="92" cy="48" r="8" fill="#FFFFFF" stroke="#E9B75B" strokeWidth="3" />
            <text x="92" y="52" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#E9B75B">3</text>
            {/* Calendar Indicator */}
            <rect x="48" y="10" width="24" height="18" rx="4" fill="#FFFFFF" stroke="#234E43" strokeWidth="1.5" />
            <line x1="48" y1="15" x2="72" y2="15" stroke="#B74444" strokeWidth="2" />
          </svg>
        );

      case 'familiar-songs':
        return (
          <svg viewBox="0 0 120 90" className="game-tile-illustration" aria-hidden="true">
            <rect width="120" height="90" rx="12" fill="#F4EEFB" />
            {/* Vinyl Record */}
            <circle cx="50" cy="48" r="26" fill="#252044" />
            <circle cx="50" cy="48" r="18" fill="none" stroke="#483E6E" strokeWidth="1.5" />
            <circle cx="50" cy="48" r="11" fill="none" stroke="#483E6E" strokeWidth="1" />
            <circle cx="50" cy="48" r="6" fill="#6335B5" />
            <circle cx="50" cy="48" r="2" fill="#FFFFFF" />
            {/* Music Notes */}
            <path d="M84 22 L98 18 L98 34 M84 28 L98 24" fill="none" stroke="#6335B5" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="84" cy="36" r="4.5" fill="#6335B5" />
            <circle cx="98" cy="32" r="4.5" fill="#6335B5" />
            <path d="M74 46 L74 58" stroke="#E9B75B" strokeWidth="2" strokeLinecap="round" />
            <circle cx="71" cy="58" r="3.5" fill="#E9B75B" />
          </svg>
        );

      case 'memory-pairs':
        return (
          <svg viewBox="0 0 120 90" className="game-tile-illustration" aria-hidden="true">
            <rect width="120" height="90" rx="12" fill="#E7F7F4" />
            {/* Pair Card 1 */}
            <rect x="22" y="18" width="34" height="52" rx="6" fill="#FFFFFF" stroke="#00695C" strokeWidth="2.5" />
            <circle cx="39" cy="44" r="8" fill="#E9B75B" />
            {/* Pair Card 2 */}
            <rect x="64" y="18" width="34" height="52" rx="6" fill="#FFFFFF" stroke="#00695C" strokeWidth="2.5" />
            <circle cx="81" cy="44" r="8" fill="#E9B75B" />
            {/* Connecting Match Spark */}
            <path d="M52 28 L57 33 L62 28" fill="none" stroke="#00695C" strokeWidth="2" strokeLinecap="round" />
            <circle cx="58" cy="62" r="3" fill="#2E7D32" />
          </svg>
        );

      case 'object-naming':
        return (
          <svg viewBox="0 0 120 90" className="game-tile-illustration" aria-hidden="true">
            <rect width="120" height="90" rx="12" fill="#FFF7ED" />
            {/* Steaming Teacup */}
            <path d="M30 42 C30 62 60 62 60 42 Z" fill="#E9B75B" stroke="#234E43" strokeWidth="2" />
            <path d="M60 46 C67 46 67 56 60 56" fill="none" stroke="#234E43" strokeWidth="2" />
            <line x1="24" y1="64" x2="66" y2="64" stroke="#234E43" strokeWidth="2.5" strokeLinecap="round" />
            {/* Steam */}
            <path d="M38 34 Q41 28 38 22" fill="none" stroke="#CBB490" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M48 34 Q51 26 48 20" fill="none" stroke="#CBB490" strokeWidth="1.8" strokeLinecap="round" />
            {/* Magnifying Glass */}
            <circle cx="82" cy="40" r="14" fill="#FFFFFF" stroke="#234E43" strokeWidth="2.5" />
            <line x1="92" y1="50" x2="104" y2="64" stroke="#234E43" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        );

      case 'simple-sorting':
        return (
          <svg viewBox="0 0 120 90" className="game-tile-illustration" aria-hidden="true">
            <rect width="120" height="90" rx="12" fill="#EAF3EE" />
            {/* Basket Left (Green) */}
            <rect x="18" y="44" width="38" height="30" rx="5" fill="#FFFFFF" stroke="#234E43" strokeWidth="2.5" />
            <circle cx="37" cy="38" r="8" fill="#2E7D32" />
            {/* Basket Right (Orange) */}
            <rect x="64" y="44" width="38" height="30" rx="5" fill="#FFFFFF" stroke="#D97706" strokeWidth="2.5" />
            <rect x="75" y="30" width="16" height="16" rx="3" fill="#D97706" />
            {/* Falling Arrow */}
            <path d="M37 18 L37 26 M34 23 L37 27 L40 23" stroke="#234E43" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      case 'color-shape':
        return (
          <svg viewBox="0 0 120 90" className="game-tile-illustration" aria-hidden="true">
            <rect width="120" height="90" rx="12" fill="#FBF2EB" />
            {/* Circle */}
            <circle cx="34" cy="46" r="15" fill="#234E43" />
            {/* Triangle */}
            <polygon points="60 30 75 58 45 58" fill="#E9B75B" />
            {/* Square */}
            <rect x="76" y="32" width="26" height="26" rx="4" fill="#B74444" />
          </svg>
        );

      case 'orientation':
        return (
          <svg viewBox="0 0 120 90" className="game-tile-illustration" aria-hidden="true">
            <rect width="120" height="90" rx="12" fill="#EBF3FD" />
            {/* Clock Face */}
            <circle cx="48" cy="46" r="22" fill="#FFFFFF" stroke="#0A3871" strokeWidth="2.5" />
            <circle cx="48" cy="46" r="2" fill="#0A3871" />
            <line x1="48" y1="46" x2="48" y2="34" stroke="#0A3871" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="48" y1="46" x2="58" y2="46" stroke="#0A3871" strokeWidth="2" strokeLinecap="round" />
            {/* Sun & Season symbol */}
            <circle cx="86" cy="34" r="10" fill="#E9B75B" />
            <path d="M86 18 L86 21 M86 47 L86 50 M70 34 L73 34 M99 34 L102 34" stroke="#E9B75B" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M80 66 Q88 56 96 66" fill="none" stroke="#2E7D32" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      case 'simple-jigsaw':
        return (
          <svg viewBox="0 0 120 90" className="game-tile-illustration" aria-hidden="true">
            <rect width="120" height="90" rx="12" fill="#F4EDFD" />
            {/* 4 Jigsaw Pieces Fitting */}
            <path d="M34 26 H56 V40 C53 40 51 43 51 46 C51 49 53 52 56 52 V64 H34 Z" fill="#6335B5" stroke="#FFFFFF" strokeWidth="2" />
            <path d="M58 26 H84 V64 H58 V52 C61 52 63 49 63 46 C63 43 61 40 58 40 Z" fill="#9D7AE2" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="45" cy="45" r="3" fill="#FFFFFF" />
            <circle cx="71" cy="45" r="3" fill="#FFFFFF" />
          </svg>
        );

      case 'daily-routine':
        return (
          <svg viewBox="0 0 120 90" className="game-tile-illustration" aria-hidden="true">
            <rect width="120" height="90" rx="12" fill="#E9F7F1" />
            {/* Sequence 1-2-3 Badges */}
            <rect x="22" y="24" width="76" height="14" rx="4" fill="#FFFFFF" stroke="#234E43" strokeWidth="1.5" />
            <circle cx="29" cy="31" r="4" fill="#2E7D32" />
            <line x1="38" y1="31" x2="84" y2="31" stroke="#234E43" strokeWidth="2" strokeLinecap="round" />

            <rect x="22" y="44" width="76" height="14" rx="4" fill="#FFFFFF" stroke="#234E43" strokeWidth="1.5" />
            <circle cx="29" cy="51" r="4" fill="#E9B75B" />
            <line x1="38" y1="51" x2="74" y2="51" stroke="#234E43" strokeWidth="2" strokeLinecap="round" />

            <rect x="22" y="64" width="76" height="14" rx="4" fill="#FFFFFF" stroke="#234E43" strokeWidth="1.5" />
            <circle cx="29" cy="71" r="4" fill="#DCECE5" stroke="#234E43" strokeWidth="1.5" />
            <line x1="38" y1="71" x2="66" y2="71" stroke="#8C84A3" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 120 90" className="game-tile-illustration" aria-hidden="true">
            <rect width="120" height="90" rx="12" fill="#EDF5F1" />
            <circle cx="60" cy="45" r="18" fill="#234E43" />
            <polyline points="56 38 67 45 56 52" fill="#FFFFFF" />
          </svg>
        );
    }
  };

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

  const getDifficultyDescription = () => {
    switch (difficulty) {
      case 'easy':
        return 'Gentle Pace • 2 Large Options • Voice Hints Available';
      case 'medium':
        return 'Balanced Pace • 3 Options • Standard Recall';
      case 'hard':
        return 'Challenge Mode • 4 Options • Full Cognitive Workout';
      default:
        return 'Gentle Pace • 2 Large Options';
    }
  };

  return (
    <div className="game-select-page">
      <div className="game-select-container">
        
        {/* Patient Difficulty Selector Strip */}
        <div className="patient-difficulty-banner card">
          <div className="difficulty-banner-left">
            <div className="difficulty-banner-badge">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polygon points="12 6 12 12 16 14"/>
              </svg>
              <span>Difficulty Level</span>
            </div>
            <div className="difficulty-banner-title">Choose Your Comfort Pace</div>
            <p className="difficulty-banner-subtitle">{getDifficultyDescription()}</p>
          </div>

          <div className="difficulty-buttons-group" role="radiogroup" aria-label="Game difficulty selector">
            <button
              type="button"
              className={`diff-choice-btn diff-choice-btn--easy ${difficulty === 'easy' ? 'diff-choice-btn--active' : ''}`}
              onClick={() => handleDifficultyChange('easy')}
            >
              <span className="diff-dot diff-dot--green"></span>
              <div className="diff-btn-text">
                <span className="diff-btn-name">Gentle</span>
                <span className="diff-btn-hint">2 Choices</span>
              </div>
            </button>

            <button
              type="button"
              className={`diff-choice-btn diff-choice-btn--medium ${difficulty === 'medium' ? 'diff-choice-btn--active' : ''}`}
              onClick={() => handleDifficultyChange('medium')}
            >
              <span className="diff-dot diff-dot--yellow"></span>
              <div className="diff-btn-text">
                <span className="diff-btn-name">Balanced</span>
                <span className="diff-btn-hint">3 Choices</span>
              </div>
            </button>

            <button
              type="button"
              className={`diff-choice-btn diff-choice-btn--hard ${difficulty === 'hard' ? 'diff-choice-btn--active' : ''}`}
              onClick={() => handleDifficultyChange('hard')}
            >
              <span className="diff-dot diff-dot--coral"></span>
              <div className="diff-btn-text">
                <span className="diff-btn-name">Challenge</span>
                <span className="diff-btn-hint">4 Choices</span>
              </div>
            </button>
          </div>
        </div>

        {/* Top Filter Controls */}
        <div className="game-select-strip">
          <div className="game-select-filters">
            <button
              type="button"
              className={`filter-tab ${filter === 'all' ? 'filter-tab--active' : ''}`}
              onClick={() => setFilter('all')}
            >
              {t('game_filter_all')} ({games.length})
            </button>
            <button
              type="button"
              className={`filter-tab ${filter === 'family' ? 'filter-tab--active' : ''}`}
              onClick={() => setFilter('family')}
            >
              {t('game_filter_family')} (7)
            </button>
            <button
              type="button"
              className={`filter-tab ${filter === 'brain' ? 'filter-tab--active' : ''}`}
              onClick={() => setFilter('brain')}
            >
              {t('game_filter_brain')} (7)
            </button>
          </div>
        </div>

        {/* Visual Game Tiles Grid with Custom SVGs */}
        <div className="games-catalog-grid">
          {filteredGames.map(game => (
            <div
              key={game.id}
              className="game-retro-tile card"
              onClick={() => navigate(`/patient/game/${game.id}?diff=${difficulty}`)}
            >
              {/* Relevant SVG Illustration Header */}
              <div className="tile-svg-wrapper">
                {renderGameSvg(game.id)}
              </div>

              <div className="tile-top-bar">
                <span className="tile-tag">{game.tag}</span>
                <span className="tile-cat-badge">{game.category.toUpperCase()}</span>
              </div>

              <h3 className="tile-title">{game.title}</h3>
              <p className="tile-desc">{game.desc}</p>

              <div className="tile-footer-row">
                <button type="button" className="tile-play-btn">
                  {t('game_play_button')}
                </button>
                <span className="tile-diff-indicator">
                  {difficulty === 'easy' ? '2 Options' : (difficulty === 'medium' ? '3 Options' : '4 Options')}
                </span>
              </div>
            </div>
          ))}
        </div>

        <HelpButton />

      </div>
    </div>
  );
}
