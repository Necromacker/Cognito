import React, { useState, useMemo } from 'react';
import './MemoryPairs.css';

const ALL_SYMBOLS = ['▲', '■', '●', '◆', '★', '♦', '⬟', '◯'];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MemoryPairs({ question, onAnswer, difficulty = 'easy' }) {
  const pairCount = difficulty === 'hard' ? 8 : difficulty === 'medium' ? 5 : 3;
  const gridCols = difficulty === 'hard' ? 4 : difficulty === 'medium' ? 5 : 3;

  const initialCards = useMemo(() => {
    const symbols = ALL_SYMBOLS.slice(0, pairCount);
    const cards = [];
    symbols.forEach((sym, pairId) => {
      cards.push({ id: pairId * 2, pairId, symbol: sym });
      cards.push({ id: pairId * 2 + 1, pairId, symbol: sym });
    });
    return shuffle(cards);
  }, [pairCount]);

  const [cards] = useState(initialCards);
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
        if (nextMatched.length === pairCount) {
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
      <h2 className="game-prompt">Find matching pairs — {pairCount} pairs</h2>

      <div className="pairs-grid" style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)` }}>
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
