import React from 'react';
import './StarRating.css';

export default function StarRating({ stars = 3, maxStars = 5, showStreak = true, streak = 1 }) {
  return (
    <div className="star-rating-box">
      <div className="star-rating-row">
        {Array.from({ length: maxStars }).map((_, i) => (
          <span
            key={i}
            className={`star-pixel ${i < stars ? 'star-pixel--filled' : 'star-pixel--empty'}`}
          >
            ★
          </span>
        ))}
      </div>
      {showStreak && streak > 0 && (
        <span className="streak-tag">
          {streak} DAY STREAK
        </span>
      )}
    </div>
  );
}
