import React, { useState } from 'react';
import './MemoryPairs.css';

export default function MemoryPairs({ question, onAnswer }) {
  // Use clean retro geometric pixel symbols instead of emojis
  const defaultCards = [
    { id: 0, pairId: 0, symbol: '▲' },
    { id: 1, pairId: 0, symbol: '▲' },
    { id: 2, pairId: 1, symbol: '■' },
    { id: 3, pairId: 1, symbol: '■' },
    { id: 4, pairId: 2, symbol: '●' },
    { id: 5, pairId: 2, symbol: '●' }
  ];

  const [cards] = useState(defaultCards);
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
        if (nextMatched.length === 3) {
          setTimeout(() => onAnswer(true, 'Matched all pairs'), 800);
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  return (
    <div className="memory-pairs-game">
      <div className="game-card-label">SYMBOL MATCHING</div>
      <h2 className="game-prompt">Find matching pairs</h2>

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
              {isFlipped ? c.symbol : '?'}
            </button>
          );
        })}
      </div>
    </div>
  );
}
