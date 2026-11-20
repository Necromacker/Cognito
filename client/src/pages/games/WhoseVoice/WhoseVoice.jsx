import React, { useRef } from 'react';
import './WhoseVoice.css';

export default function WhoseVoice({ question, onAnswer, showHint, difficulty = 'easy' }) {
  const { voiceUrl, options, correctAnswer, hint } = question;
  const audioRef = useRef(null);

  const playVoice = () => {
    if (audioRef.current && voiceUrl) {
      audioRef.current.play().catch(() => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utter = new SpeechSynthesisUtterance(`Hello! It's lovely to hear from you. Can you guess whose voice this is?`);
          utter.rate = 0.82;
          utter.pitch = 1.05;
          window.speechSynthesis.speak(utter);
        }
      });
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(`Hello! It's lovely to hear from you. Can you guess whose voice this is?`);
      utter.rate = 0.82;
      utter.pitch = 1.05;
      window.speechSynthesis.speak(utter);
    }
  };

  return (
    <div className="whose-voice-game">
      <div className="game-card-label">AUDIO IDENTIFICATION</div>
      <h2 className="game-prompt">Whose voice is this?</h2>

      {voiceUrl && <audio ref={audioRef} src={voiceUrl} />}

      <button type="button" className="voice-retro-btn" onClick={playVoice}>
        <span className="voice-retro-symbol">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        </span>
        <span className="voice-retro-txt">PLAY AUDIO CLIP</span>
      </button>

      {/* Easy: show first letter hint */}
      {difficulty === 'easy' && correctAnswer && (
        <div style={{ textAlign: 'center', fontSize: 13, color: '#52615B', margin: '8px 0' }}>
          Name starts with: <strong>{correctAnswer[0]}</strong>
        </div>
      )}

      {showHint && hint && (
        <div className="game-hint-tag">HINT: {hint}</div>
      )}

      <div className="game-options-container">
        {options.map((name, idx) => (
          <button
            key={idx}
            type="button"
            className="game-choice-btn"
            onClick={() => onAnswer(name === correctAnswer, name)}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
