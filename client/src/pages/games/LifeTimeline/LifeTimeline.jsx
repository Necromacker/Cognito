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
      <h2 className="game-prompt">Arrange these life events from earlier to recent</h2>
      <p className="timeline-sub">Tap the arrows to gently re-order:</p>

      {showHint && hint && (
        <div className="game-hint-box" role="status">
          💡 {hint}
        </div>
      )}

      <div className="timeline-cards-list">
        {orderedEvents.map((item, idx) => (
          <div key={item.id} className="timeline-event-card">
            <span className="timeline-step-badge">{idx + 1}</span>
            <div className="timeline-event__img-wrap">
              <img src={item.photo_url} alt={item.title} className="timeline-event__img" />
            </div>
            <div className="timeline-event__text">
              <h3 className="timeline-event__title">{item.title}</h3>
              <p className="timeline-event__desc">{item.description}</p>
            </div>
            {idx > 0 && (
              <button
                type="button"
                className="timeline-move-btn"
                onClick={() => moveUp(idx)}
                aria-label="Move earlier"
              >
                ▲ Move Earlier
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        className="timeline-confirm-btn"
        onClick={handleConfirm}
      >
        That Looks Wonderful! ➔
      </button>
    </div>
  );
}

