import React from 'react';
import './Orientation.css';

export default function Orientation({ question, onAnswer }) {
  const { prompt, options, correctAnswer } = question;

  return (
    <div className="orientation-game">
      <div className="game-card-label">ORIENTATION CHECK</div>
      <h2 className="game-prompt">{prompt}</h2>

      <div className="game-options-container">
        {options.map((opt, i) => (
          <button
            key={i}
            type="button"
            className="game-choice-btn"
            onClick={() => onAnswer(opt.label === correctAnswer, opt.label)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
