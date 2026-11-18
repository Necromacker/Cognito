import React, { useState } from 'react';
import './DailyRoutine.css';

export default function DailyRoutine({ question, onAnswer }) {
  const { title, steps } = question;
  const [currentSteps, setCurrentSteps] = useState(steps || []);

  const moveUp = (idx) => {
    if (idx === 0) return;
    const next = [...currentSteps];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setCurrentSteps(next);
  };

  const handleDone = () => {
    const isCorrect = currentSteps.every((s, i) => s.id === i + 1);
    onAnswer(isCorrect, currentSteps.map(s => s.text).join(' -> '));
  };

  return (
    <div className="routine-game">
      <div className="game-card-label">STEP SEQUENCING</div>
      <h2 className="game-prompt">{title}</h2>

      <div className="routine-steps-list">
        {currentSteps.map((st, idx) => (
          <div key={st.id} className="routine-step-row card">
            <span className="routine-step-num">0{idx + 1}</span>
            <span className="routine-step-text">{st.text}</span>
            {idx > 0 && (
              <button
                type="button"
                className="btn btn--outline"
                style={{ fontSize: '10px', minHeight: '30px', padding: '2px 8px' }}
                onClick={() => moveUp(idx)}
              >
                UP ▲
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        className="btn btn--primary"
        style={{ marginTop: '12px' }}
        onClick={handleDone}
      >
        SUBMIT SEQUENCE ➔
      </button>
    </div>
  );
}
