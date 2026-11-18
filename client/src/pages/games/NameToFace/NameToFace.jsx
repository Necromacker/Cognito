import React from 'react';
import './NameToFace.css';

export default function NameToFace({ question, onAnswer, showHint }) {
  const { targetName, options, correctAnswer, hint } = question;

  return (
    <div className="name-to-face-game">
      <div className="game-card-label">NAME IDENTIFICATION</div>
      <h2 className="game-prompt">Where is <span className="highlight-tag">{targetName}</span>?</h2>

      {showHint && hint && (
        <div className="game-hint-tag">HINT: {hint}</div>
      )}

      <div className="name-to-face__grid">
        {options.map((opt, idx) => (
          <button
            key={idx}
            type="button"
            className="face-option-btn"
            onClick={() => onAnswer(opt.name === correctAnswer, opt.name)}
          >
            <img src={opt.photoUrl} alt="Photo option" className="face-option-img" />
          </button>
        ))}
      </div>
    </div>
  );
}
