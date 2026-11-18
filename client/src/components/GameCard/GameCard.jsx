import React from 'react';
import './GameCard.css';

export default function GameCard({ icon, title, description, badge, onClick }) {
  return (
    <div className="game-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="game-card__header">
        <span className="game-card__icon">{icon}</span>
        {badge && <span className="game-card__badge">{badge}</span>}
      </div>
      <h3 className="game-card__title">{title}</h3>
      <p className="game-card__desc">{description}</p>
      <div className="game-card__action">
        <span className="game-card__play-btn">Play ▶</span>
      </div>
    </div>
  );
}

