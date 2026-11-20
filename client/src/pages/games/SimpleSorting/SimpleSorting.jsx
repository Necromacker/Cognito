import React, { useState, useMemo } from 'react';
import './SimpleSorting.css';

export default function SimpleSorting({ question, onAnswer, difficulty = 'easy' }) {
  const { categoryA, categoryB, categoryC, categoryD, items } = question;
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);

  /* Difficulty controls how many categories are shown */
  const categories = useMemo(() => {
    const cats = [categoryA, categoryB];
    if ((difficulty === 'medium' || difficulty === 'hard') && categoryC) cats.push(categoryC);
    if (difficulty === 'hard' && categoryD) cats.push(categoryD);
    return cats.filter(Boolean);
  }, [difficulty, categoryA, categoryB, categoryC, categoryD]);

  const currentItem = items?.[currentIdx];

  const handleChoose = (category) => {
    const isCorrect = currentItem?.category === category;
    if (isCorrect) setScore(s => s + 1);

    if (currentIdx + 1 < (items?.length || 0)) {
      setCurrentIdx(prev => prev + 1);
    } else {
      onAnswer(isCorrect, category);
    }
  };

  if (!currentItem) return <div>No items to sort.</div>;

  return (
    <div className="sorting-game">
      <div className="game-card-label">CATEGORIZATION</div>
      <h2 className="game-prompt">Where does this belong?</h2>

      <div className="sorting-target-card">
        <span className="sorting-item-tag">ITEM</span>
        <span className="sorting-item-name">{currentItem.name}</span>
        {currentItem.imageUrl && (
          <img src={currentItem.imageUrl} alt={currentItem.name} style={{ width: 80, borderRadius: 8, marginTop: 8 }} loading="lazy" />
        )}
      </div>

      <div className="sorting-progress-text" style={{ fontSize: 12, color: '#52615B', marginBottom: 8 }}>
        Item {currentIdx + 1} of {items.length}
      </div>

      <div className="sorting-buckets">
        {categories.map((cat, i) => (
          <button key={i} type="button" className="sorting-bucket-btn" onClick={() => handleChoose(cat)}>
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
