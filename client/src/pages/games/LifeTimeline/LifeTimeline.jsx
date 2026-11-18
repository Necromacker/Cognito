import React, { useState } from 'react';
import './LifeTimeline.css';

export default function LifeTimeline({ question, onAnswer, showHint }) {
  const { events, hint } = question;
  const [orderedEvents, setOrderedEvents] = useState(events || []);

  const moveUp = (index) => {
    if (index === 0) return;
    const nextList = [...orderedEvents];
    [nextList[index - 1], nextList[index]] = [nextList[index], nextList[index - 1]];
    setOrderedEvents(nextList);
  };

  const handleConfirm = () => {
    const isSorted = orderedEvents.every((e, idx, arr) => {
      if (idx === 0) return true;
      return e.year >= arr[idx - 1].year;
    });
    onAnswer(isSorted, orderedEvents.map(e => e.title).join(' -> '));
  };

  return (
    <div className="timeline-game">
      <div className="game-card-label">CHRONOLOGICAL ORDER</div>
      <h2 className="game-prompt">Order from earlier to recent</h2>

      {showHint && hint && (
        <div className="game-hint-tag">HINT: {hint}</div>
      )}

      <div className="timeline-cards-list">
        {orderedEvents.map((item, idx) => (
          <div key={item.id} className="timeline-row card">
            <span className="timeline-step-badge">{idx + 1}</span>
            <div className="timeline-img-box">
              <img src={item.photo_url} alt={item.title} className="timeline-img" />
            </div>
            <div className="timeline-info">
              <span className="timeline-title">{item.title}</span>
              <span className="timeline-desc">{item.description}</span>
            </div>
            {idx > 0 && (
              <button
                type="button"
                className="btn btn--outline"
                style={{ fontSize: '10px', minHeight: '30px', padding: '4px 8px' }}
                onClick={() => moveUp(idx)}
              >
                MOVE UP ▲
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        className="btn btn--primary"
        style={{ marginTop: '12px' }}
        onClick={handleConfirm}
      >
        SUBMIT TIMELINE ➔
      </button>
    </div>
  );
}
