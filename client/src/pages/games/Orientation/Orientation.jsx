import React from 'react';
import './Orientation.css';

export default function Orientation({ question, onAnswer }) {
  const { prompt, options, correctAnswer } = question;
  return (
    <div className="orientation-game">
      <h2 className="game-prompt">{prompt}</h2>
      <div className="game-options-container">
        {options.map((opt, i) => (
          <button
            key={i}
            type="button"
            className="patient-choice-btn orientation-choice-btn"
            onClick={() => onAnswer(opt.label === correctAnswer, opt.label)}
          >
            <span className="orientation-icon">{opt.icon}</span>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
