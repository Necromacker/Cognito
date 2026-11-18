import React from 'react';
import './WhoIsThis.css';

export default function WhoIsThis({ question, onAnswer, showHint }) {
  const { photoUrl, options, correctAnswer, hint } = question;

  return (
    <div className="who-is-this-game">
      <h2 className="game-prompt">Who is this lovely person?</h2>

      <div className="who-is-this__photo-container">
        <img src={photoUrl} alt="Family member" className="who-is-this__photo" />
      </div>

      {showHint && hint && (
        <div className="game-hint-box" role="status">
          💡 {hint}
        </div>
      )}

      {/* Max 3 Options */}
      <div className="game-options-container">
        {options.map((name, idx) => (
          <button
            key={idx}
            type="button"
            className="patient-choice-btn"
            onClick={() => onAnswer(name === correctAnswer, name)}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

