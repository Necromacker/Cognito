import React from 'react';
import './Orientation.css';

export default function Orientation({ question, onAnswer, difficulty = 'easy' }) {
  const { prompt, options, correctAnswer } = question;

  return (
    <div className="orientation-game">
      <div className="game-card-label">ORIENTATION CHECK</div>
      <h2 className="game-prompt">{prompt}</h2>

      {/* Easy: show a contextual clue */}
      {difficulty === 'easy' && (
        <div style={{ textAlign: 'center', fontSize: 13, color: '#52615B', margin: '0 0 10px' }}>
          Take your time — think about today
        </div>
      )}

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
