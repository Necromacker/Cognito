import React, { useState } from 'react';
import './SimpleSorting.css';

export default function SimpleSorting({ question, onAnswer }) {
  const { categoryA, categoryB, items } = question;
  const [currentIdx, setCurrentIdx] = useState(0);

  const currentItem = items[currentIdx];

  const handleChoose = (category) => {
    const isCorrect = currentItem.category === category;
    if (currentIdx + 1 < items.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      onAnswer(isCorrect, category);
    }
  };

  return (
    <div className="sorting-game">
      <h2 className="game-prompt">Where does this belong?</h2>
      <div className="sorting-target-card">
        <span className="sorting-item-icon">{currentItem.icon}</span>
        <span className="sorting-item-name">{currentItem.name}</span>
      </div>
      <div className="sorting-buckets">
        <button type="button" className="sorting-bucket-btn" onClick={() => handleChoose(categoryA)}>
          {categoryA}
        </button>
        <button type="button" className="sorting-bucket-btn" onClick={() => handleChoose(categoryB)}>
          {categoryB}
        </button>
      </div>
    </div>
  );
}
