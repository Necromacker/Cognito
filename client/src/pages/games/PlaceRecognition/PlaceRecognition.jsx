import React from 'react';
import './PlaceRecognition.css';

const PLACE_IMAGES = {
  'Temple': 'https://images.unsplash.com/photo-1564804955-f33e3aa4e8de?w=300&fit=crop',
  'Market': 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=300&fit=crop',
  'Park': 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=300&fit=crop',
  'Hospital': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=300&fit=crop',
  'School': 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=300&fit=crop',
  'Home': 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=300&fit=crop',
};

export default function PlaceRecognition({ question, onAnswer, showHint, difficulty = 'easy' }) {
  const { photoUrl, options, correctAnswer, hint, placeName } = question;

  const img = photoUrl || PLACE_IMAGES[correctAnswer] || PLACE_IMAGES[placeName] || null;

  return (
    <div className="place-game">
      <div className="game-card-label">LOCATION RECOGNITION</div>
      <h2 className="game-prompt">Which place is this?</h2>

      {img && (
        <div className="place-photo-frame">
          <img
            src={img}
            alt="Place"
            className="place-photo"
            style={difficulty === 'hard' ? { filter: 'blur(3px)' } : {}}
            loading="lazy"
          />
        </div>
      )}

      {/* Easy: show location type hint */}
      {difficulty === 'easy' && correctAnswer && (
        <div style={{ textAlign: 'center', fontSize: 13, color: '#52615B', margin: '4px 0 8px' }}>
          Starts with: <strong>{correctAnswer[0]}</strong>
        </div>
      )}

      {showHint && hint && (
        <div className="game-hint-tag">HINT: {hint}</div>
      )}

      <div className="game-options-container">
        {options.map((placeName, idx) => (
          <button
            key={idx}
            type="button"
            className="game-choice-btn"
            onClick={() => onAnswer(placeName === correctAnswer, placeName)}
          >
            {placeName}
          </button>
        ))}
      </div>
    </div>
  );
}
