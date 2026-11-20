import React from 'react';
import './WhoIsThis.css';

export default function WhoIsThis({ question, onAnswer, showHint, difficulty = 'easy' }) {
  const { photoUrl, options, correctAnswer, hint } = question;

  return (
    <div className="who-is-this-game">
      <div className="game-card-label">FACE RECALL</div>
      <h2 className="game-prompt">Who is this person?</h2>

      <div className="who-photo-frame">
        <img
          src={photoUrl}
          alt="Person"
          className="who-photo"
          style={difficulty === 'hard' ? { filter: 'blur(2px)' } : {}}
          loading="lazy"
        />
      </div>

      {/* Easy: show first letter */}
      {difficulty === 'easy' && correctAnswer && (
        <div style={{ textAlign: 'center', fontSize: 13, color: '#52615B', margin: '4px 0 8px' }}>
          Name starts with: <strong>{correctAnswer[0]}</strong>
        </div>
      )}

      {showHint && hint && (
        <div className="game-hint-tag">HINT: {hint}</div>
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
