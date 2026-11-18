import React from 'react';
import './RelationshipMatch.css';

export default function RelationshipMatch({ question, onAnswer, showHint }) {
  const { name, photoUrl, options, correctAnswer, hint } = question;

  return (
    <div className="relationship-game">
      <h2 className="game-prompt">How is <span className="highlight-name">{name}</span> related to you?</h2>

      <div className="relationship-photo-wrap">
        <img src={photoUrl} alt={name} className="relationship-photo" />
      </div>

      {showHint && hint && (
        <div className="game-hint-box" role="status">
          💡 {hint}
        </div>
      )}

      <div className="game-options-container">
        {options.map((rel, idx) => (
          <button
            key={idx}
            type="button"
            className="patient-choice-btn"
            onClick={() => onAnswer(rel === correctAnswer, rel)}
          >
            {rel}
          </button>
        ))}
      </div>
    </div>
  );
}

