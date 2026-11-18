import React from 'react';
import './ColorShape.css';

export default function ColorShape({ question, onAnswer }) {
  const { prompt, options, correctAnswer } = question;
  return (
    <div className="color-shape-game">
      <h2 className="game-prompt">{prompt}</h2>
      <div className="color-shape-options">
        {options.map((opt, i) => (
          <button
            key={i}
            type="button"
            className="color-shape-btn"
            style={{ borderColor: opt.color }}
            onClick={() => onAnswer(opt.name === correctAnswer, opt.name)}
          >
            <span className="color-shape-icon">{opt.shape}</span>
            <span className="color-shape-name">{opt.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
