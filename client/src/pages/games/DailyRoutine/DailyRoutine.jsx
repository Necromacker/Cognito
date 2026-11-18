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
      <h2 className="game-prompt">{title}</h2>
      <p className="routine-sub">Put the routine in the natural order:</p>

      <div className="routine-steps-list">
        {currentSteps.map((st, idx) => (
          <div key={st.id} className="routine-step-card">
            <span className="routine-num">{idx + 1}</span>
            <span className="routine-icon">{st.icon}</span>
            <span className="routine-text">{st.text}</span>
            {idx > 0 && (
              <button type="button" className="routine-move-btn" onClick={() => moveUp(idx)}>
                ▲ Move Earlier
              </button>
            )}
          </div>
        ))}
      </div>

      <button type="button" className="patient-choice-btn" onClick={handleDone}>
        Done with Routine ➔
      </button>
    </div>
  );
}
