import React from 'react';
import './ObjectNaming.css';

export default function ObjectNaming({ question, onAnswer }) {
  const { name, options, correctAnswer } = question;

  // Render clean retro item box without emoji
  return (
    <div className="object-game">
      <div className="game-card-label">OBJECT NAMING</div>
      <h2 className="game-prompt">What item is this?</h2>
      
      <div className="object-retro-frame">
        <span className="object-retro-text">{name || 'TEACUP'}</span>
      </div>

      <div className="game-options-container">
        {options.map((opt, i) => (
          <button
            key={i}
            type="button"
            className="game-choice-btn"
            onClick={() => onAnswer(opt === correctAnswer, opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
