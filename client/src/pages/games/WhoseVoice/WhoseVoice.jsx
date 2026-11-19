import React, { useRef } from 'react';
import './WhoseVoice.css';

export default function WhoseVoice({ question, onAnswer, showHint }) {
  const { voiceUrl, options, correctAnswer, hint } = question;
  const audioRef = useRef(null);

  const playVoice = () => {
    if (audioRef.current && voiceUrl) {
      audioRef.current.play().catch(() => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utter = new SpeechSynthesisUtterance(`Hello Dad, it's me! Can you remember my voice?`);
          window.speechSynthesis.speak(utter);
        }
      });
    } else if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(`Hello! It's lovely to hear from you. Can you guess whose voice this is?`);
      window.speechSynthesis.speak(utter);
    }
  };

  return (
    <div className="whose-voice-game">
      <div className="game-card-label">AUDIO IDENTIFICATION</div>
      <h2 className="game-prompt">Whose voice is this?</h2>

      {voiceUrl && <audio ref={audioRef} src={voiceUrl} />}

      <button type="button" className="voice-retro-btn" onClick={playVoice}>
        <span className="voice-retro-symbol">▶</span>
        <span className="voice-retro-txt">PLAY AUDIO CLIP</span>
      </button>

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
