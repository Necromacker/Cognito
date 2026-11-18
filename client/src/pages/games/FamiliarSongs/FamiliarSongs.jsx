import React, { useRef } from 'react';
import './FamiliarSongs.css';

export default function FamiliarSongs({ question, onAnswer, showHint }) {
  const { title, artist, audioUrl, options, correctAnswer, hint } = question;
  const audioRef = useRef(null);

  const playSong = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  return (
    <div className="songs-game">
      <h2 className="game-prompt">Which nostalgic song is this?</h2>
      <p className="songs-sub">Sung with affection by {artist || 'a golden era singer'}</p>

      {audioUrl && <audio ref={audioRef} src={audioUrl} />}

      <button type="button" className="song-play-btn" onClick={playSong}>
        <span className="song-play-icon">🎵</span>
        <span className="song-play-text">Play Song Clip</span>
      </button>

      {showHint && hint && (
        <div className="game-hint-box" role="status">
          💡 {hint}
        </div>
      )}

      <div className="game-options-container">
        {options.map((optTitle, idx) => (
          <button
            key={idx}
            type="button"
            className="patient-choice-btn"
            onClick={() => onAnswer(optTitle === correctAnswer, optTitle)}
          >
            "{optTitle}"
          </button>
        ))}
      </div>
    </div>
  );
}

