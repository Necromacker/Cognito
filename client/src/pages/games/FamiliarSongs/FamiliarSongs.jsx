import React, { useRef } from 'react';
import './FamiliarSongs.css';

export default function FamiliarSongs({ question, onAnswer, showHint }) {
  const { title, artist, audioUrl, options, correctAnswer, hint } = question;
  const audioRef = useRef(null);

  const playSong = () => {
    if (audioRef.current) audioRef.current.play();
  };

  return (
    <div className="songs-game">
      <div className="game-card-label">NOSTALGIC MUSIC</div>
      <h2 className="game-prompt">Which song is this?</h2>
      <p className="songs-artist-text">Sung by {artist || 'Classic Artist'}</p>

      {audioUrl && <audio ref={audioRef} src={audioUrl} />}

      <button type="button" className="voice-retro-btn" onClick={playSong}>
        <span className="voice-retro-symbol">▶</span>
        <span className="voice-retro-txt">PLAY SONG CLIP</span>
      </button>

      {showHint && hint && (
        <div className="game-hint-tag">HINT: {hint}</div>
      )}

      <div className="game-options-container">
        {options.map((optTitle, idx) => (
          <button
            key={idx}
            type="button"
            className="game-choice-btn"
            onClick={() => onAnswer(optTitle === correctAnswer, optTitle)}
          >
            "{optTitle}"
          </button>
        ))}
      </div>
    </div>
  );
}
