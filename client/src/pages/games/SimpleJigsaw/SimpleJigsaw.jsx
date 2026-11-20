import React, { useState, useMemo } from 'react';
import './SimpleJigsaw.css';

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&fit=crop',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&fit=crop',
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SimpleJigsaw({ question, onAnswer, difficulty = 'easy' }) {
  const { imageUrl } = question;
  const img = imageUrl || FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];

  const gridSize = difficulty === 'hard' ? 4 : difficulty === 'medium' ? 3 : 2;
  const totalPieces = gridSize * gridSize;

  const initialPieces = useMemo(() => {
    const solved = Array.from({ length: totalPieces }, (_, i) => i);
    let shuffled;
    do { shuffled = shuffleArray(solved); } while (shuffled.every((v, i) => v === i));
    return shuffled;
  }, [totalPieces]);

  const [pieces, setPieces] = useState(initialPieces);
  const [selected, setSelected] = useState(null);
  const [showRef, setShowRef] = useState(false);

  const handlePieceClick = (idx) => {
    if (selected === null) {
      setSelected(idx);
    } else {
      const nextPieces = [...pieces];
      [nextPieces[selected], nextPieces[idx]] = [nextPieces[idx], nextPieces[selected]];
      setPieces(nextPieces);
      setSelected(null);

      if (nextPieces.every((p, i) => p === i)) {
        setTimeout(() => onAnswer(true, 'Solved jigsaw puzzle'), 600);
      }
    }
  };

  const pct = (v) => (100 / (gridSize - 1)) * v;

  return (
    <div className="jigsaw-game">
      <div className="game-card-label">PIECE SWAP PUZZLE</div>
      <h2 className="game-prompt">
        Tap two pieces to swap — {gridSize}x{gridSize} grid
      </h2>

      {/* Reference thumbnail toggle */}
      <button type="button" className="btn btn--outline" style={{ marginBottom: 10, fontSize: 12 }} onClick={() => setShowRef(r => !r)}>
        {showRef ? 'Hide Reference' : 'Show Reference Image'}
      </button>
      {showRef && (
        <div style={{ marginBottom: 12, textAlign: 'center' }}>
          <img src={img} alt="Reference" style={{ width: 120, borderRadius: 8, border: '2px solid #D5DFD9' }} loading="lazy" />
        </div>
      )}

      <div className="jigsaw-board" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
        {pieces.map((pieceVal, idx) => (
          <div
            key={idx}
            className={`jigsaw-piece ${selected === idx ? 'jigsaw-piece--selected' : ''}`}
            onClick={() => handlePieceClick(idx)}
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: `${gridSize * 100}%`,
              backgroundPosition: `${pct(pieceVal % gridSize)}% ${pct(Math.floor(pieceVal / gridSize))}%`,
            }}
          >
            <span className="jigsaw-piece-num">[{pieceVal + 1}]</span>
          </div>
        ))}
      </div>
    </div>
  );
}
