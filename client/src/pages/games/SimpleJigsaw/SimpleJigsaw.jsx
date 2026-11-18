import React, { useState } from 'react';
import './SimpleJigsaw.css';

export default function SimpleJigsaw({ question, onAnswer }) {
  const { imageUrl } = question;
  const [pieces, setPieces] = useState([1, 0, 3, 2]);
  const [selected, setSelected] = useState(null);

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

  return (
    <div className="jigsaw-game">
      <div className="game-card-label">PIECE SWAP PUZZLE</div>
      <h2 className="game-prompt">Tap two pieces to swap positions</h2>

      <div className="jigsaw-board">
        {pieces.map((pieceVal, idx) => (
          <div
            key={idx}
            className={`jigsaw-piece ${selected === idx ? 'jigsaw-piece--selected' : ''}`}
            onClick={() => handlePieceClick(idx)}
            style={{
              backgroundImage: `url(${imageUrl})`,
              backgroundPosition: `${(pieceVal % 2) * 100}% ${Math.floor(pieceVal / 2) * 100}%`
            }}
          >
            <span className="jigsaw-piece-num">[{pieceVal + 1}]</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="btn btn--primary"
        style={{ marginTop: '16px' }}
        onClick={() => onAnswer(true, 'Completed puzzle')}
      >
        SUBMIT PUZZLE ➔
      </button>
    </div>
  );
}
