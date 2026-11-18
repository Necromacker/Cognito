import React from 'react';
import './PlaceRecognition.css';

export default function PlaceRecognition({ question, onAnswer, showHint }) {
  const { photoUrl, options, correctAnswer, hint } = question;

  return (
    <div className="place-game">
      <h2 className="game-prompt">Which special place is this?</h2>

      <div className="place-photo-wrap">
        <img src={photoUrl} alt="Place" className="place-photo" />
      </div>

      {showHint && hint && (
        <div className="game-hint-box" role="status">
          💡 {hint}
        </div>
      )}

      <div className="game-options-container">
        {options.map((placeName, idx) => (
          <button
            key={idx}
            type="button"
            className="patient-choice-btn"
            onClick={() => onAnswer(placeName === correctAnswer, placeName)}
          >
            {placeName}
          </button>
        ))}
      </div>
    </div>
  );
}

