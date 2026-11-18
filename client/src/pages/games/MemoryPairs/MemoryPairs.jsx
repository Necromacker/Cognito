import React, { useState, useEffect } from 'react';
import './MemoryPairs.css';

export default function MemoryPairs({ question, onAnswer }) {
  const [cards, setCards] = useState(question?.cards || []);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);

  const handleCardClick = (index) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].pairId)) {
      return;
    }
    const nextFlipped = [...flipped, index];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      const first = cards[nextFlipped[0]];
      const second = cards[nextFlipped[1]];
      if (first.pairId === second.pairId) {
        const nextMatched = [...matched, first.pairId];
        setMatched(nextMatched);
        setFlipped([]);
        if (nextMatched.length === (question.pairCount || 3)) {
          setTimeout(() => onAnswer(true, 'Matched all pairs'), 1000);
        }
      } else {
        setTimeout(() => setFlipped([]), 1200);
      }
    }
  };

  return (
    <div className="memory-pairs-game">
      <h2 className="game-prompt">Find the matching friendly pairs</h2>
      <p className="pairs-sub">Tap any two cards to reveal them:</p>

      <div className="pairs-grid">
        {cards.map((c, idx) => {
          const isFlipped = flipped.includes(idx) || matched.includes(c.pairId);
          return (
            <button
              key={idx}
              type="button"
              className={`pair-card ${isFlipped ? 'pair-card--flipped' : ''}`}
              onClick={() => handleCardClick(idx)}
            >
              {isFlipped ? c.symbol : '❓'}
            </button>
          );
        })}
      </div>
    </div>
  );
}
