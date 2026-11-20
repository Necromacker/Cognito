import React, { useMemo } from 'react';
import './ObjectNaming.css';

/* Fallback image bank for objects when API doesn't supply one */
const OBJECT_IMAGES = {
  'Teacup': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=300&fit=crop',
  'Clock': 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=300&fit=crop',
  'Umbrella': 'https://images.unsplash.com/photo-1534309466160-70b22cc6254d?w=300&fit=crop',
  'Flower': 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=300&fit=crop',
  'Book': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&fit=crop',
  'Chair': 'https://images.unsplash.com/photo-1503602642458-232111445657?w=300&fit=crop',
  'Lamp': 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=300&fit=crop',
  'Glasses': 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=300&fit=crop',
  'Key': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=300&fit=crop',
  'Spoon': 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=300&fit=crop',
};

export default function ObjectNaming({ question, onAnswer, difficulty = 'easy', showHint }) {
  const { name, options, correctAnswer, imageUrl, hint } = question;

  const img = imageUrl || OBJECT_IMAGES[correctAnswer] || OBJECT_IMAGES[name] || null;

  const blurStyle = useMemo(() => {
    if (difficulty === 'hard') return { filter: 'blur(6px)', transition: 'filter 0.3s' };
    if (difficulty === 'medium') return {};
    return {}; // easy shows image + first letter
  }, [difficulty]);

  const firstLetter = (correctAnswer || name || '')[0] || '';

  return (
    <div className="object-game">
      <div className="game-card-label">OBJECT NAMING</div>
      <h2 className="game-prompt">What item is this?</h2>

      {img ? (
        <div className="object-img-frame">
          <img
            src={img}
            alt="Object to identify"
            className="object-img"
            style={blurStyle}
            loading="lazy"
          />
        </div>
      ) : (
        <div className="object-retro-frame">
          <span className="object-retro-text">{name || 'TEACUP'}</span>
        </div>
      )}

      {/* Easy mode: show first letter hint automatically */}
      {difficulty === 'easy' && (
        <div className="object-first-letter-hint">
          Starts with: <strong>{firstLetter.toUpperCase()}</strong>
        </div>
      )}

      {showHint && hint && (
        <div className="game-hint-tag">HINT: {hint}</div>
      )}

      <div className="game-options-container">
        {options.map((opt, i) => (
          <button
            key={i}
            type="button"
            className="game-choice-btn"
            onClick={() => onAnswer(opt === correctAnswer, opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
