import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useLanguage } from '../../../context/LanguageContext';
import { useTextToSpeech } from '../../../hooks/useTextToSpeech';
import ProgressBar from '../../../components/ProgressBar/ProgressBar';
import StarRating from '../../../components/StarRating/StarRating';
import HelpButton from '../../../components/HelpButton/HelpButton';
import api from '../../../api';

// Import individual game views
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
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { speak } = useTextToSpeech();

  const [sessionId, setSessionId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showBreakPrompt, setShowBreakPrompt] = useState(false);
  const [feedback, setFeedback] = useState(null); // { isCorrect, message }
  const [showHint, setShowHint] = useState(false);

  const startTimeRef = useRef(Date.now());
  const questionStartTimeRef = useRef(Date.now());

  const patientId = user?.patientProfileId || user?.id;

  // Initialize session and fetch questions
  useEffect(() => {
    if (patientId && gameType) {
      setLoading(true);

      // Start session in backend
      api.post('/games/session', {
        patientId,
        gameType,
        difficulty: 1
      }).then(res => {
        setSessionId(res.data.sessionId);
      }).catch(() => {});

      // Fetch questions
      api.get(`/games/questions/${gameType}/${patientId}`)
        .then(res => {
          const qList = res.data.questions || [];
          setQuestions(qList);
          if (qList.length > 0) {
            // Speak first question prompt
            const initialPrompt = qList[0].prompt || qList[0].title || 'Take your time and enjoy.';
            speak(initialPrompt);
          }
        })
        .catch(err => {
          console.error('Failed to load questions:', err);
        })
        .finally(() => {
          setLoading(false);
          questionStartTimeRef.current = Date.now();
        });
    }
  }, [patientId, gameType]);

  // Gentle break timer (after 7 minutes)
  useEffect(() => {
    const breakTimer = setTimeout(() => {
      setShowBreakPrompt(true);
    }, 7 * 60 * 1000);
    return () => clearTimeout(breakTimer);
  }, []);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = async (isCorrect, answerGiven) => {
    const responseTimeMs = Date.now() - questionStartTimeRef.current;

    // Record attempt to backend
    if (sessionId) {
      api.post('/games/attempt', {
        sessionId,
        questionData: currentQuestion,
        answerGiven: String(answerGiven),
        correctAnswer: String(currentQuestion.correctAnswer || ''),
        isCorrect,
        responseTimeMs,
        hintsUsed
      }).catch(() => {});
    }

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      const praise = t('gentle_correct');
      setFeedback({
        isCorrect: true,
        message: praise
      });
      speak(praise);
    } else {
      // Gentle encouragement rule: never say "wrong", reveal kindly
      const gentleMsg = `${t('gentle_try')} ${currentQuestion.correctAnswer || ''}`;
      setFeedback({
        isCorrect: false,
        message: gentleMsg
      });
      speak(gentleMsg);
    }

    // Advance after gentle delay
    setTimeout(() => {
      setFeedback(null);
      setShowHint(false);
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1);
        questionStartTimeRef.current = Date.now();
        // Read next question
        const nextQ = questions[currentIndex + 1];
        if (nextQ) {
          const nextPrompt = nextQ.prompt || nextQ.title || 'Look closely.';
          speak(nextPrompt);
        }
      } else {
        finishSession();
      }
    }, 2800);
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
    if (currentQuestion?.hint) {
      speak(currentQuestion.hint);
    }
  };

  if (loading) {
    return (
      <div className="game-loading-screen">
        <div className="game-loading__spinner"></div>
        <h2 className="game-loading__text">Preparing your gentle game...</h2>
      </div>
    );
  }

  // Completion Screen
  if (isCompleted) {
    const finalStars = Math.max(3, Math.min(5, correctCount + 1));
    return (
      <div className="game-complete-screen">
        <div className="game-complete-card">
          <div className="game-complete__icon">🎉</div>
          <h1 className="game-complete__title">Wonderful Play!</h1>
          <p className="game-complete__message">
            You did an outstanding job today. Your mind is shining bright!
          </p>

          <div className="game-complete__stars">
            <StarRating stars={finalStars} maxStars={5} showStreak={true} streak={2} />
          </div>

          <div className="game-complete__actions">
            <button
              type="button"
              className="game-btn game-btn--primary"
              onClick={() => navigate('/patient/games')}
            >
              Play Another Game ▶
            </button>
            <button
              type="button"
              className="game-btn game-btn--outline"
              onClick={() => navigate('/patient')}
            >
              {t('back_home')} 🏠
            </button>
          </div>
        </div>
        <HelpButton />
      </div>
    );
  }

  // Render the specific game component
  const renderGameComponent = () => {
    if (!currentQuestion) {
      return (
        <div className="game-empty-state">
          <p>No questions available for this game yet. Please ask your caretaker to add pictures!</p>
          <button className="game-btn game-btn--outline" onClick={() => navigate('/patient')}>
            Return Home
          </button>
        </div>
      );
    }

    const gameProps = {
      question: currentQuestion,
      onAnswer: handleAnswer,
      showHint,
      speak
    };

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
        
        {/* Top Bar: Back & Progress */}
        <div className="game-session__topbar">
          <button
            type="button"
            className="game-session__exit-btn"
            onClick={() => navigate('/patient/games')}
            aria-label="Exit game"
          >
            ✕ Exit
          </button>

          <div className="game-session__progress-wrap">
            <ProgressBar
              current={currentIndex + 1}
              total={Math.max(1, questions.length)}
              label={`Step ${currentIndex + 1} of ${Math.max(1, questions.length)}`}
            />
          </div>

          <button
            type="button"
            className="game-session__hint-btn"
            onClick={handleRequestHint}
            aria-label="Need a gentle hint"
          >
            💡 Hint
          </button>
        </div>

        {/* Gentle Break Prompt Modal */}
        {showBreakPrompt && (
          <div className="gentle-break-banner" role="alert">
            <span className="gentle-break__icon">☕</span>
            <div className="gentle-break__body">
              <strong>{t('take_break')}</strong>
              <p>{t('break_message')}</p>
            </div>
            <button
              type="button"
              className="gentle-break__close"
              onClick={() => setShowBreakPrompt(false)}
            >
              I am doing great, continue!
            </button>
          </div>
        )}

        {/* Active Game Component */}
        <div className="game-active-area">
          {renderGameComponent()}
        </div>

        {/* Feedback Alert Overlay (Gentle Encouragement - Never Red) */}
        {feedback && (
          <div className={`game-feedback-banner ${feedback.isCorrect ? 'game-feedback--correct' : 'game-feedback--gentle'}`}>
            <span className="game-feedback__icon">
              {feedback.isCorrect ? '🌟' : '💛'}
            </span>
            <span className="game-feedback__text">{feedback.message}</span>
          </div>
        )}

        {/* Always visible help button */}
        <HelpButton />

      </div>
    </div>
  );
}

