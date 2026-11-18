import React, { useState } from 'react';
import './SimpleJigsaw.css';

export default function SimpleJigsaw({ question, onAnswer }) {
  const { imageUrl } = question;
  const [pieces, setPieces] = useState([1, 0, 3, 2]); // 2x2 pieces
  const [selected, setSelected] = useState(null);

  const handlePieceClick = (idx) => {
    if (selected === null) {
      setSelected(idx);
    } else {
      const nextPieces = [...pieces];
      [nextPieces[selected], nextPieces[idx]] = [nextPieces[idx], nextPieces[selected]];
      setPieces(nextPieces);
      setSelected(null);

      // Check if solved: 0, 1, 2, 3
      if (nextPieces.every((p, i) => p === i)) {
        setTimeout(() => onAnswer(true, 'Solved jigsaw puzzle'), 600);
      }
    }
  };

  return (
    <div className="jigsaw-game">
      <h2 className="game-prompt">Tap two puzzle pieces to gently swap them</h2>
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
            <span className="jigsaw-piece-num">Piece {pieceVal + 1}</span>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="patient-choice-btn"
        style={{ marginTop: '24px' }}
        onClick={() => onAnswer(true, 'Completed puzzle')}
      >
        Looks Whole & Complete ➔
      </button>
    </div>
  );
}
