import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useTextToSpeech } from '../../../hooks/useTextToSpeech';
import ProgressBar from '../../../components/ProgressBar/ProgressBar';
import StarRating from '../../../components/StarRating/StarRating';
import HelpButton from '../../../components/HelpButton/HelpButton';
import api from '../../../api';

// Game views
import WhoIsThis from '../WhoIsThis/WhoIsThis';
import WhoseVoice from '../WhoseVoice/WhoseVoice';
import NameToFace from '../NameToFace/NameToFace';
import RelationshipMatch from '../RelationshipMatch/RelationshipMatch';
import PlaceRecognition from '../PlaceRecognition/PlaceRecognition';
import LifeTimeline from '../LifeTimeline/LifeTimeline';
import FamiliarSongs from '../FamiliarSongs/FamiliarSongs';
import MemoryPairs from '../MemoryPairs/MemoryPairs';
import ObjectNaming from '../ObjectNaming/ObjectNaming';
import SimpleSorting from '../SimpleSorting/SimpleSorting';
import ColorShape from '../ColorShape/ColorShape';
import Orientation from '../Orientation/Orientation';
import SimpleJigsaw from '../SimpleJigsaw/SimpleJigsaw';
import DailyRoutine from '../DailyRoutine/DailyRoutine';

import './GameSession.css';

export default function GameSession() {
  const { gameType } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { speak } = useTextToSpeech();

  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [difficulty, setDifficulty] = useState('easy'); // 'easy', 'medium', 'hard'

  const startTimeRef = useRef(Date.now());
  const questionStartTimeRef = useRef(Date.now());

  const patientId = user?.patientProfileId || user?.id;

  useEffect(() => {
    if (patientId && gameType) {
      setLoading(true);

      api.post('/games/session', {
        patientId,
        gameType,
        difficulty: difficulty === 'easy' ? 1 : (difficulty === 'medium' ? 2 : 3)
      }).then(res => setSessionId(res.data.sessionId)).catch(() => {});

      api.get(`/games/questions/${gameType}/${patientId}`)
        .then(res => {
          const qList = res.data.questions || [];
          setQuestions(qList);
          if (qList.length > 0) {
            const prompt = qList[0].prompt || qList[0].title || 'Take your time.';
            speak(prompt);
          }
        })
        .catch(console.error)
        .finally(() => {
          setLoading(false);
          questionStartTimeRef.current = Date.now();
        });
    }
  }, [patientId, gameType]);

  // Adapt options based on chosen difficulty (Easy = 2 options, Medium = 3 options, Hard = 4 options)
  const adaptedQuestion = useMemo(() => {
    if (!questions[currentIndex]) return null;
    const base = questions[currentIndex];
    if (!base.options || base.options.length <= 2) return base;

    let opts = [...base.options];
    if (difficulty === 'easy') {
      const wrong = opts.filter(o => o !== base.correctAnswer);
      opts = [base.correctAnswer, wrong[0]].sort(() => 0.5 - Math.random());
    } else if (difficulty === 'medium' && opts.length > 3) {
      const wrong = opts.filter(o => o !== base.correctAnswer);
      opts = [base.correctAnswer, wrong[0], wrong[1]].sort(() => 0.5 - Math.random());
    }
    return { ...base, options: opts };
  }, [questions, currentIndex, difficulty]);

  const handleAnswer = async (isCorrect, answerGiven) => {
    const responseTimeMs = Date.now() - questionStartTimeRef.current;

    if (sessionId) {
      api.post('/games/attempt', {
        sessionId,
        questionData: adaptedQuestion,
        answerGiven: String(answerGiven),
        correctAnswer: String(adaptedQuestion?.correctAnswer || ''),
        isCorrect,
        responseTimeMs,
        hintsUsed
      }).catch(() => {});
    }

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      const msg = 'Wonderful! You remembered.';
      setFeedback({ isCorrect: true, message: msg });
      speak(msg);
    } else {
      const msg = `Nice try! The answer is: ${adaptedQuestion?.correctAnswer || ''}`;
      setFeedback({ isCorrect: false, message: msg });
      speak(msg);
    }

    setTimeout(() => {
      setFeedback(null);
      setShowHint(false);
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1);
        questionStartTimeRef.current = Date.now();
        const nextQ = questions[currentIndex + 1];
        if (nextQ) {
          const nextPrompt = nextQ.prompt || nextQ.title || 'Look closely.';
          speak(nextPrompt);
        }
      } else {
        finishSession();
      }
    }, 2400);
  };

  const finishSession = () => {
    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    setIsCompleted(true);

    if (sessionId) {
      api.put(`/games/session/${sessionId}`, {
        totalQuestions: questions.length,
        correctAnswers: correctCount + 1,
        hintsUsed,
        durationSeconds,
        completed: 1
      }).catch(() => {});
    }
  };

  const handleRequestHint = () => {
    setHintsUsed(prev => prev + 1);
    setShowHint(true);
    if (adaptedQuestion?.hint) {
      speak(`Here is a gentle hint: ${adaptedQuestion.hint}`);
    }
  };

  if (loading) return <div className="game-loading-strip">Preparing calming session...</div>;

  if (isCompleted) {
    const finalStars = Math.max(3, Math.min(5, correctCount + 1));
    return (
      <div className="game-complete-screen">
        <div className="game-complete-card card">
          <div className="badge badge--green" style={{ marginBottom: '8px' }}>SESSION COMPLETE</div>
          <h1 className="game-complete__title">WONDERFUL WORK</h1>
          <p className="game-complete__message">You completed all activities gently and calmly.</p>

          <div className="game-complete__stars">
            <StarRating stars={finalStars} maxStars={5} showStreak={true} streak={2} />
          </div>

          <div className="game-complete__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => navigate('/patient/games')}
            >
              Play Another Game ▶
            </button>
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => navigate('/patient')}
            >
              Return Home
            </button>
          </div>
        </div>
        <HelpButton />
      </div>
    );
  }

  const renderGameComponent = () => {
    if (!adaptedQuestion) return <div>No items in this module yet.</div>;
    const gameProps = { question: adaptedQuestion, onAnswer: handleAnswer, showHint, speak };

    switch (gameType) {
      case 'who-is-this': return <WhoIsThis {...gameProps} />;
      case 'whose-voice': return <WhoseVoice {...gameProps} />;
      case 'name-to-face': return <NameToFace {...gameProps} />;
      case 'relationship-match': return <RelationshipMatch {...gameProps} />;
      case 'place-recognition': return <PlaceRecognition {...gameProps} />;
      case 'life-timeline': return <LifeTimeline {...gameProps} />;
      case 'familiar-songs': return <FamiliarSongs {...gameProps} />;
      case 'memory-pairs': return <MemoryPairs {...gameProps} />;
      case 'object-naming': return <ObjectNaming {...gameProps} />;
      case 'simple-sorting': return <SimpleSorting {...gameProps} />;
      case 'color-shape': return <ColorShape {...gameProps} />;
      case 'orientation': return <Orientation {...gameProps} />;
      case 'simple-jigsaw': return <SimpleJigsaw {...gameProps} />;
      case 'daily-routine': return <DailyRoutine {...gameProps} />;
      default: return <WhoIsThis {...gameProps} />;
    }
  };

  return (
    <div className="game-session-page">
      <div className="game-session-container">
        
        {/* Top Control Bar with Difficulty & Hint */}
        <div className="session-top-controls">
          <button
            type="button"
            className="session-ctrl-btn"
            onClick={() => navigate('/patient/games')}
          >
            ← Exit
          </button>

          {/* Difficulty Selector */}
          <div className="difficulty-pill-group">
            <button
              type="button"
              className={`diff-btn ${difficulty === 'easy' ? 'diff-btn--active' : ''}`}
              onClick={() => setDifficulty('easy')}
              title="Easy: 2 choices, gentle hints"
            >
              Easy
            </button>
            <button
              type="button"
              className={`diff-btn ${difficulty === 'medium' ? 'diff-btn--active' : ''}`}
              onClick={() => setDifficulty('medium')}
              title="Medium: 3 choices"
            >
              Medium
            </button>
            <button
              type="button"
              className={`diff-btn ${difficulty === 'hard' ? 'diff-btn--active' : ''}`}
              onClick={() => setDifficulty('hard')}
              title="Hard: 4 choices"
            >
              Hard
            </button>
          </div>

          <div className="session-progress-strip">
            <span className="session-step-label">
              Activity {currentIndex + 1} of {Math.max(1, questions.length)}
            </span>
            <ProgressBar current={currentIndex + 1} total={Math.max(1, questions.length)} />
          </div>

          {/* Prominent Hint Button */}
          <button
            type="button"
            className={`session-ctrl-btn session-ctrl-btn--hint ${showHint ? 'session-ctrl-btn--hint-active' : ''}`}
            onClick={handleRequestHint}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a6 6 0 0 0-6 6c0 2.8 2 4.5 3 6v2h6v-2c1-1.5 3-3.2 3-6a6 6 0 0 0-6-6z"/>
              <line x1="9" y1="18" x2="15" y2="18"/>
              <line x1="10" y1="21" x2="14" y2="21"/>
            </svg>
            <span>{showHint ? 'Hint Active' : 'Need a Hint?'}</span>
          </button>
        </div>

        {/* Floating Hint Callout Card */}
        {showHint && adaptedQuestion?.hint && (
          <div className="active-hint-callout">
            <div className="hint-icon">💡</div>
            <div className="hint-content">
              <span className="hint-label">Gentle Clue:</span>
              <p className="hint-text">{adaptedQuestion.hint}</p>
            </div>
          </div>
        )}

        {/* Active Game */}
        <div className="session-active-card card">
          {renderGameComponent()}
        </div>

        {/* Clean Feedback */}
        {feedback && (
          <div className={`session-feedback-strip ${feedback.isCorrect ? 'session-feedback--correct' : 'session-feedback--gentle'}`}>
            {feedback.message}
          </div>
        )}

        <HelpButton />

      </div>
    </div>
  );
}
