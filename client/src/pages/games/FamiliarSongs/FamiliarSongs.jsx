import React, { useRef } from 'react';
import './FamiliarSongs.css';

/* Fallback song images when API doesn't supply album art */
const SONG_IMAGES = {
  default: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&fit=crop',
  classical: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&fit=crop',
  folk: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&fit=crop',
};

export default function FamiliarSongs({ question, onAnswer, showHint, speak, difficulty = 'easy' }) {
  const { title, artist, audioUrl, options, correctAnswer, hint, albumArt, genre } = question;
  const audioRef = useRef(null);

  const albumImg = albumArt || SONG_IMAGES[genre] || SONG_IMAGES.default;

  const playSong = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Fallback to TTS if audio fails
        if (speak) speak(`Playing a clip of a familiar song by ${artist || 'a classic artist'}`);
      });
    } else if (speak) {
      speak(`This is a familiar song by ${artist || 'a classic artist'}. Can you name it?`);
    }
  };

  return (
    <div className="songs-game">
      <div className="game-card-label">NOSTALGIC MUSIC</div>
      <h2 className="game-prompt">Which song is this?</h2>

      {/* Album art / song image */}
      <div className="songs-album-frame">
        <img src={albumImg} alt="Album art" className="songs-album-img" loading="lazy" />
        <p className="songs-artist-text">Sung by {artist || 'Classic Artist'}</p>
      </div>

      {audioUrl && <audio ref={audioRef} src={audioUrl} />}

      <button type="button" className="voice-retro-btn" onClick={playSong}>
        <span className="voice-retro-symbol">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </span>
        <span className="voice-retro-txt">PLAY SONG CLIP</span>
      </button>

      {/* Easy mode: show artist as extra hint */}
      {difficulty === 'easy' && artist && (
        <div className="object-first-letter-hint">
          Artist: <strong>{artist}</strong>
        </div>
      )}

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
