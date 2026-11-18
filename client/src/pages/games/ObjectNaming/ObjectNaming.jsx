import React from 'react';
import './ObjectNaming.css';

export default function ObjectNaming({ question, onAnswer }) {
  const { emoji, options, correctAnswer } = question;
  return (
    <div className="object-game">
      <h2 className="game-prompt">What is this everyday item?</h2>
      <div className="object-emoji-box">{emoji}</div>
      <div className="game-options-container">
        {options.map((opt, i) => (
          <button key={i} type="button" className="patient-choice-btn" onClick={() => onAnswer(opt === correctAnswer, opt)}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
