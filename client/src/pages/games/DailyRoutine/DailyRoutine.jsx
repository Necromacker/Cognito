import React, { useState, useMemo } from 'react';
import './DailyRoutine.css';

export default function DailyRoutine({ question, onAnswer, difficulty = 'easy' }) {
  const { title, steps } = question;

  /* Slice steps based on difficulty */
  const visibleSteps = useMemo(() => {
    if (!steps) return [];
    if (difficulty === 'easy') return steps.slice(0, 3);
    if (difficulty === 'medium') return steps.slice(0, 5);
    return steps; // hard = all steps
  }, [steps, difficulty]);

  const [currentSteps, setCurrentSteps] = useState(visibleSteps);

  const moveUp = (idx) => {
    if (idx === 0) return;
    const next = [...currentSteps];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setCurrentSteps(next);
  };

  const moveDown = (idx) => {
    if (idx >= currentSteps.length - 1) return;
    const next = [...currentSteps];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setCurrentSteps(next);
  };

  const handleDone = () => {
    const isCorrect = currentSteps.every((s, i) => s.id === visibleSteps.sort((a, b) => a.id - b.id)[i]?.id);
    onAnswer(isCorrect, currentSteps.map(s => s.text).join(' -> '));
  };

  return (
    <div className="routine-game">
      <div className="game-card-label">STEP SEQUENCING</div>
      <h2 className="game-prompt">{title}</h2>
      <p style={{ fontSize: 13, color: '#52615B', margin: '0 0 12px' }}>
        Arrange {currentSteps.length} steps in the correct order
      </p>

      <div className="routine-steps-list">
        {currentSteps.map((st, idx) => (
          <div key={st.id} className="routine-step-row card">
            <span className="routine-step-num">0{idx + 1}</span>
            <span className="routine-step-text">{st.text}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {idx > 0 && (
                <button
                  type="button"
                  className="btn btn--outline"
                  style={{ fontSize: '10px', minHeight: '30px', padding: '2px 8px' }}
                  onClick={() => moveUp(idx)}
                >
                  UP
                </button>
              )}
              {idx < currentSteps.length - 1 && (difficulty === 'medium' || difficulty === 'hard') && (
                <button
                  type="button"
                  className="btn btn--outline"
                  style={{ fontSize: '10px', minHeight: '30px', padding: '2px 8px' }}
                  onClick={() => moveDown(idx)}
                >
                  DN
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="btn btn--primary"
        style={{ marginTop: '12px' }}
        onClick={handleDone}
      >
        SUBMIT SEQUENCE
      </button>
    </div>
  );
}
