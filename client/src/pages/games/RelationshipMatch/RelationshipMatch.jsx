import React from 'react';
import './RelationshipMatch.css';

export default function RelationshipMatch({ question, onAnswer, showHint }) {
  const { name, photoUrl, options, correctAnswer, hint } = question;

  return (
    <div className="relationship-game">
      <div className="game-card-label">RELATIONSHIP MATCH</div>
      <h2 className="game-prompt">Who is <span className="highlight-tag">{name}</span> to you?</h2>

      <div className="who-photo-frame">
        <img src={photoUrl} alt={name} className="who-photo" />
      </div>

      {showHint && hint && (
        <div className="game-hint-tag">HINT: {hint}</div>
      )}

      <div className="game-options-container">
        {options.map((rel, idx) => (
          <button
            key={idx}
            type="button"
            className="game-choice-btn"
            onClick={() => onAnswer(rel === correctAnswer, rel)}
          >
            {rel}
          </button>
        ))}
      </div>
    </div>
  );
}
