import React from 'react';
import './NameToFace.css';

export default function NameToFace({ question, onAnswer, showHint, difficulty = 'easy' }) {
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
            <img
              src={opt.photoUrl}
              alt="Photo option"
              className="face-option-img"
              style={difficulty === 'hard' ? { filter: 'grayscale(0.5)' } : {}}
              loading="lazy"
            />
            {/* Easy: show name below photo */}
            {difficulty === 'easy' && (
              <span style={{ fontSize: 11, color: '#52615B', marginTop: 4 }}>{opt.name?.[0]}...</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
