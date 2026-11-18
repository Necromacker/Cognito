import React from 'react';
import './WhoIsThis.css';

export default function WhoIsThis({ question, onAnswer, showHint }) {
  const { photoUrl, options, correctAnswer, hint } = question;

  return (
    <div className="who-is-this-game">
      <div className="game-card-label">FACE RECALL</div>
      <h2 className="game-prompt">Who is this person?</h2>

      <div className="who-photo-frame">
        <img src={photoUrl} alt="Person" className="who-photo" />
      </div>

      {showHint && hint && (
        <div className="game-hint-tag">
          HINT: {hint}
        </div>
      )}

      <div className="game-options-container">
        {options.map((name, idx) => (
          <button
            key={idx}
            type="button"
            className="game-choice-btn"
            onClick={() => onAnswer(name === correctAnswer, name)}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
