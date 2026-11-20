import React, { useMemo } from 'react';
import './ColorShape.css';

/* SVG shape renderers for harder difficulties */
const SHAPE_SVGS = {
  circle: (color) => <svg width="40" height="40"><circle cx="20" cy="20" r="18" fill={color}/></svg>,
  square: (color) => <svg width="40" height="40"><rect x="2" y="2" width="36" height="36" fill={color} rx="3"/></svg>,
  triangle: (color) => <svg width="40" height="40"><polygon points="20,2 38,38 2,38" fill={color}/></svg>,
  diamond: (color) => <svg width="40" height="40"><polygon points="20,2 38,20 20,38 2,20" fill={color}/></svg>,
  star: (color) => <svg width="40" height="40"><polygon points="20,2 25,15 38,15 28,24 32,38 20,30 8,38 12,24 2,15 15,15" fill={color}/></svg>,
  hexagon: (color) => <svg width="40" height="40"><polygon points="20,2 36,10 36,30 20,38 4,30 4,10" fill={color}/></svg>,
};

export default function ColorShape({ question, onAnswer, difficulty = 'easy' }) {
  const { prompt, options, correctAnswer } = question;

  /* On hard mode, show shape SVGs. On easy, show big color swatches only */
  const showShapeSvg = difficulty === 'hard' || difficulty === 'medium';

  return (
    <div className="color-shape-game">
      <div className="game-card-label">PATTERN MATCH</div>
      <h2 className="game-prompt">{prompt}</h2>

      <div className="color-shape-options">
        {options.map((opt, i) => {
          const shapeFn = SHAPE_SVGS[opt.shape];
          return (
            <button
              key={i}
              type="button"
              className="color-shape-retro-btn"
              onClick={() => onAnswer(opt.name === correctAnswer, opt.name)}
            >
              {showShapeSvg && shapeFn ? (
                <span className="color-shape-svg">{shapeFn(opt.color || '#ff2d78')}</span>
              ) : (
                <span
                  className="color-shape-swatch"
                  style={{ backgroundColor: opt.color || '#ff2d78' }}
                ></span>
              )}
              <span className="color-shape-name">{opt.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
