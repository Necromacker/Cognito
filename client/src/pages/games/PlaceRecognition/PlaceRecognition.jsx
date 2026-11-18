import React from 'react';
import './PlaceRecognition.css';

export default function PlaceRecognition({ question, onAnswer, showHint }) {
  const { photoUrl, options, correctAnswer, hint } = question;

  return (
    <div className="place-game">
      <div className="game-card-label">LOCATION RECOGNITION</div>
      <h2 className="game-prompt">Which place is this?</h2>

      <div className="place-photo-frame">
        <img src={photoUrl} alt="Place" className="place-photo" />
      </div>

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
