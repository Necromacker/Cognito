import React, { useState, useMemo } from 'react';
import './LifeTimeline.css';

export default function LifeTimeline({ question, onAnswer, showHint, difficulty = 'easy' }) {
  const { events, hint } = question;

  /* Limit events by difficulty */
  const visibleEvents = useMemo(() => {
    if (!events) return [];
    if (difficulty === 'easy') return events.slice(0, 3);
    if (difficulty === 'medium') return events.slice(0, 5);
    return events; // hard = all
  }, [events, difficulty]);

  const [orderedEvents, setOrderedEvents] = useState(visibleEvents);

  const moveUp = (index) => {
    if (index === 0) return;
    const nextList = [...orderedEvents];
    [nextList[index - 1], nextList[index]] = [nextList[index], nextList[index - 1]];
    setOrderedEvents(nextList);
  };

  const moveDown = (index) => {
    if (index >= orderedEvents.length - 1) return;
    const nextList = [...orderedEvents];
    [nextList[index], nextList[index + 1]] = [nextList[index + 1], nextList[index]];
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
      <p style={{ fontSize: 13, color: '#52615B', margin: '0 0 8px' }}>
        {orderedEvents.length} events to arrange
      </p>

      {showHint && hint && (
        <div className="game-hint-tag">HINT: {hint}</div>
      )}

      <div className="timeline-cards-list">
        {orderedEvents.map((item, idx) => (
          <div key={item.id} className="timeline-row card">
            <span className="timeline-step-badge">{idx + 1}</span>
            <div className="timeline-img-box">
              <img src={item.photo_url} alt={item.title} className="timeline-img" loading="lazy" />
            </div>
            <div className="timeline-info">
              <span className="timeline-title">{item.title}</span>
              <span className="timeline-desc">{item.description}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {idx > 0 && (
                <button
                  type="button"
                  className="btn btn--outline"
                  style={{ fontSize: '10px', minHeight: '28px', padding: '2px 8px' }}
                  onClick={() => moveUp(idx)}
                >
                  UP
                </button>
              )}
              {idx < orderedEvents.length - 1 && (
                <button
                  type="button"
                  className="btn btn--outline"
                  style={{ fontSize: '10px', minHeight: '28px', padding: '2px 8px' }}
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
        onClick={handleConfirm}
      >
        SUBMIT TIMELINE
      </button>
    </div>
  );
}
