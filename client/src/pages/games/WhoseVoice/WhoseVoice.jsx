import React, { useRef } from 'react';
import './WhoseVoice.css';

export default function WhoseVoice({ question, onAnswer, showHint }) {
  const { voiceUrl, options, correctAnswer, hint } = question;
  const audioRef = useRef(null);

  const playVoice = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  return (
    <div className="whose-voice-game">
      <h2 className="game-prompt">Whose voice is this?</h2>
      <p className="whose-voice-sub">Tap the button to listen closely</p>

      {voiceUrl && <audio ref={audioRef} src={voiceUrl} />}

      <button type="button" className="voice-play-huge-btn" onClick={playVoice}>
        <span className="voice-play-icon">▶</span>
        <span className="voice-play-label">Play Voice</span>
      </button>

      {showHint && hint && (
        <div className="game-hint-box" role="status">
          💡 {hint}
        </div>
      )}

      <div className="game-options-container">
        {options.map((name, idx) => (
          <button
            key={idx}
            type="button"
            className="patient-choice-btn"
            onClick={() => onAnswer(name === correctAnswer, name)}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

