import React from 'react';
import './NameToFace.css';

export default function NameToFace({ question, onAnswer, showHint }) {
  const { targetName, options, correctAnswer, hint } = question;

  return (
    <div className="name-to-face-game">
      <h2 className="game-prompt">Where is <span className="highlight-name">{targetName}</span>?</h2>
      <p className="game-sub">Tap on their picture below:</p>

      {showHint && hint && (
        <div className="game-hint-box" role="status">
          💡 {hint}
        </div>
      )}

      {/* Picture Options (Max 3) */}
      <div className="name-to-face__grid">
        {options.map((opt, idx) => (
          <button
            key={idx}
            type="button"
            className="face-option-btn"
            onClick={() => onAnswer(opt.name === correctAnswer, opt.name)}
          >
            <img src={opt.photoUrl} alt="Family member" className="face-option-img" />
          </button>
        ))}
      </div>
    </div>
  );
}

