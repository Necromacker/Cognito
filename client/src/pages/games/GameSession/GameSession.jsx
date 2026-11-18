import React, { useState, useEffect, useRef } from 'react';
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

  const startTimeRef = useRef(Date.now());
  const questionStartTimeRef = useRef(Date.now());

  const patientId = user?.patientProfileId || user?.id;

  useEffect(() => {
    if (patientId && gameType) {
      setLoading(true);

      api.post('/games/session', {
        patientId,
        gameType,
        difficulty: 1
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

  const currentQuestion = questions[currentIndex];

  const handleAnswer = async (isCorrect, answerGiven) => {
    const responseTimeMs = Date.now() - questionStartTimeRef.current;

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
      const msg = 'Wonderful! You remembered.';
      setFeedback({ isCorrect: true, message: msg });
      speak(msg);
    } else {
      const msg = `Nice try! The answer is: ${currentQuestion.correctAnswer || ''}`;
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
    if (currentQuestion?.hint) speak(currentQuestion.hint);
  };

  if (loading) return <div className="game-loading-strip">Preparing module...</div>;

  if (isCompleted) {
    const finalStars = Math.max(3, Math.min(5, correctCount + 1));
    return (
      <div className="game-complete-screen">
        <div className="game-complete-card card">
          <div className="badge badge--green" style={{ marginBottom: '8px' }}>SESSION COMPLETE</div>
          <h1 className="game-complete__title">WONDERFUL PLAY</h1>
          <p className="game-complete__message">Your mind is sharp and calm.</p>

          <div className="game-complete__stars">
            <StarRating stars={finalStars} maxStars={5} showStreak={true} streak={2} />
          </div>

          <div className="game-complete__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => navigate('/patient/games')}
            >
              PLAY ANOTHER ▶
            </button>
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => navigate('/patient')}
            >
              RETURN HOME
            </button>
          </div>
        </div>
        <HelpButton />
      </div>
    );
  }

  const renderGameComponent = () => {
    if (!currentQuestion) return <div>No items in this module yet.</div>;
    const gameProps = { question: currentQuestion, onAnswer: handleAnswer, showHint, speak };

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
        
        {/* Top Control Bar */}
        <div className="session-top-controls">
          <button
            type="button"
            className="session-ctrl-btn"
            onClick={() => navigate('/patient/games')}
          >
            EXIT
          </button>

          <div className="session-progress-strip">
            <span className="session-step-label">
              QUESTION {currentIndex + 1} OF {Math.max(1, questions.length)}
            </span>
            <ProgressBar current={currentIndex + 1} total={Math.max(1, questions.length)} />
          </div>

          <button
            type="button"
            className="session-ctrl-btn session-ctrl-btn--hint"
            onClick={handleRequestHint}
          >
            HINT
          </button>
        </div>

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
