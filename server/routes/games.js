const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// Start a game session
router.post('/session', authenticateToken, (req, res) => {
  try {
    const { patientId, gameType, difficulty, moodBefore } = req.body;
    if (!patientId || !gameType) {
      return res.status(400).json({ error: 'patientId and gameType are required' });
    }

    const db = getDb();
    const result = db.prepare(`
      INSERT INTO game_sessions (patient_id, game_type, difficulty, mood_before, started_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).run(patientId, gameType, difficulty || 1, moodBefore || null);

    db.close();
    return res.status(201).json({ sessionId: result.lastInsertRowid });
  } catch (err) {
    console.error('Session error:', err);
    return res.status(500).json({ error: 'Failed to start session' });
  }
});

// Update or complete game session
router.put('/session/:id', authenticateToken, (req, res) => {
  try {
    const { totalQuestions, correctAnswers, hintsUsed, durationSeconds, moodAfter, completed } = req.body;
    const db = getDb();

    db.prepare(`
      UPDATE game_sessions
      SET total_questions = ?,
          correct_answers = ?,
          hints_used = ?,
          duration_seconds = ?,
          mood_after = ?,
          completed = ?,
          ended_at = datetime('now')
      WHERE id = ?
    `).run(totalQuestions || 0, correctAnswers || 0, hintsUsed || 0, durationSeconds || 0, moodAfter || null, completed ? 1 : 0, req.params.id);

    db.close();
    return res.json({ message: 'Session updated' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update session' });
  }
});

// Record an attempt
router.post('/attempt', authenticateToken, (req, res) => {
  try {
    const { sessionId, questionData, answerGiven, correctAnswer, isCorrect, responseTimeMs, hintsUsed } = req.body;

    const db = getDb();
    const result = db.prepare(`
      INSERT INTO attempts (session_id, question_data, answer_given, correct_answer, is_correct, response_time_ms, hints_used)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      sessionId,
      typeof questionData === 'object' ? JSON.stringify(questionData) : String(questionData),
      answerGiven,
      correctAnswer,
      isCorrect ? 1 : 0,
      responseTimeMs || 0,
      hintsUsed || 0
    );

    db.close();
    return res.status(201).json({ attemptId: result.lastInsertRowid });
  } catch (err) {
    console.error('Attempt error:', err);
    return res.status(500).json({ error: 'Failed to record attempt' });
  }
});

// Helper: Fisher-Yates shuffle
function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Generate questions for a game
router.get('/questions/:gameType/:patientId', authenticateToken, (req, res) => {
  try {
    const { gameType, patientId } = req.params;
    const db = getDb();

    // Check recent accuracy for adaptive difficulty
    const recentAttempts = db.prepare(`
      SELECT is_correct FROM attempts a
      JOIN game_sessions s ON a.session_id = s.id
      WHERE s.patient_id = ? AND s.game_type = ?
      ORDER BY a.created_at DESC LIMIT 5
    `).all(patientId, gameType);

    let optionCount = 3; // default
    if (recentAttempts.length >= 3) {
      const correctRatio = recentAttempts.filter(a => a.is_correct === 1).length / recentAttempts.length;
      if (correctRatio < 0.5) {
        optionCount = 2; // adaptively simplify to 2 choices if patient struggled
      }
    }

    let questions = [];

    switch (gameType) {
      case 'who-is-this': {
        const people = db.prepare('SELECT * FROM people WHERE patient_id = ? AND is_hidden = 0').all(patientId);
        if (people.length > 0) {
          questions = people.map(target => {
            const others = people.filter(p => p.id !== target.id);
            const distractors = shuffle(others).slice(0, optionCount - 1).map(p => p.name);
            const options = shuffle([target.name, ...distractors]);
            return {
              id: target.id,
              type: 'who-is-this',
              photoUrl: target.photo_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
              correctAnswer: target.name,
              relationship: target.relationship,
              hint: `This is your ${target.relationship || 'family member'}.`,
              options
            };
          });
        }
        break;
      }

      case 'whose-voice': {
        const withVoice = db.prepare('SELECT * FROM people WHERE patient_id = ? AND is_hidden = 0 AND voice_url IS NOT NULL').all(patientId);
        const allPeople = db.prepare('SELECT * FROM people WHERE patient_id = ? AND is_hidden = 0').all(patientId);
        const pool = withVoice.length > 0 ? withVoice : allPeople;

        questions = pool.map(target => {
          const others = allPeople.filter(p => p.id !== target.id);
          const distractors = shuffle(others).slice(0, optionCount - 1).map(p => p.name);
          const options = shuffle([target.name, ...distractors]);
          return {
            id: target.id,
            type: 'whose-voice',
            voiceUrl: target.voice_url || null,
            correctAnswer: target.name,
            relationship: target.relationship,
            hint: `Listen closely! It's your ${target.relationship || 'loved one'}.`,
            options
          };
        });
        break;
      }

      case 'name-to-face': {
        const people = db.prepare('SELECT * FROM people WHERE patient_id = ? AND is_hidden = 0').all(patientId);
        if (people.length > 0) {
          questions = people.map(target => {
            const others = people.filter(p => p.id !== target.id);
            const distractorPhotos = shuffle(others).slice(0, optionCount - 1).map(p => ({
              id: p.id,
              name: p.name,
              photoUrl: p.photo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
            }));
            const targetOption = {
              id: target.id,
              name: target.name,
              photoUrl: target.photo_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80'
            };
            const options = shuffle([targetOption, ...distractorPhotos]);
            return {
              id: target.id,
              type: 'name-to-face',
              targetName: target.name,
              relationship: target.relationship,
              correctAnswer: target.name,
              correctPhotoUrl: targetOption.photoUrl,
              hint: `Look for your ${target.relationship || 'loved one'}, ${target.name}.`,
              options
            };
          });
        }
        break;
      }

      case 'relationship-match': {
        const people = db.prepare('SELECT * FROM people WHERE patient_id = ? AND is_hidden = 0 AND relationship IS NOT NULL').all(patientId);
        const standardRel = ['Daughter', 'Son', 'Wife', 'Husband', 'Sister', 'Brother', 'Grandchild', 'Friend', 'Doctor'];
        if (people.length > 0) {
          questions = people.map(target => {
            const distractors = standardRel.filter(r => r.toLowerCase() !== (target.relationship || '').toLowerCase());
            const chosenDistractors = shuffle(distractors).slice(0, optionCount - 1);
            const options = shuffle([target.relationship, ...chosenDistractors]);
            return {
              id: target.id,
              type: 'relationship-match',
              name: target.name,
              photoUrl: target.photo_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
              correctAnswer: target.relationship,
              hint: `${target.name} is part of your family.`,
              options
            };
          });
        }
        break;
      }

      case 'place-recognition': {
        const places = db.prepare('SELECT * FROM places WHERE patient_id = ? AND is_hidden = 0').all(patientId);
        if (places.length > 0) {
          questions = places.map(target => {
            const others = places.filter(p => p.id !== target.id);
            const distractors = others.length >= optionCount - 1
              ? shuffle(others).slice(0, optionCount - 1).map(p => p.name)
              : ['Our Hometown', 'City Garden', 'Central Library'].slice(0, optionCount - 1);
            const options = shuffle([target.name, ...distractors]);
            return {
              id: target.id,
              type: 'place-recognition',
              photoUrl: target.photo_url || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
              description: target.description,
              correctAnswer: target.name,
              hint: `A place you visited: ${target.description || 'special memory'}`,
              options
            };
          });
        }
        break;
      }

      case 'life-timeline': {
        const events = db.prepare('SELECT * FROM life_events WHERE patient_id = ? AND is_hidden = 0 AND year IS NOT NULL ORDER BY year ASC').all(patientId);
        if (events.length >= 3) {
          const selected = shuffle(events).slice(0, 3);
          const sorted = [...selected].sort((a, b) => a.year - b.year);
          questions.push({
            id: 'timeline-1',
            type: 'life-timeline',
            events: shuffle(selected),
            correctOrder: sorted.map(e => e.id),
            hint: 'Arrange from earlier in life to more recent times.'
          });
        }
        break;
      }

      case 'familiar-songs': {
        const songs = db.prepare('SELECT * FROM songs WHERE patient_id = ? AND is_hidden = 0').all(patientId);
        const demoSongs = [
          { title: 'Yeh Shaam Mastani', artist: 'Kishore Kumar', film: 'Kati Patang', audio_url: 'https://actions.google.com/sounds/v1/ambiences/outdoor_evening.ogg' },
          { title: 'Ajeeb Dastan Hai Yeh', artist: 'Lata Mangeshkar', film: 'Dil Apna Aur Preet Parai', audio_url: 'https://actions.google.com/sounds/v1/ambiences/outdoor_evening.ogg' },
          { title: 'Lag Ja Gale', artist: 'Lata Mangeshkar', film: 'Woh Kaun Thi', audio_url: 'https://actions.google.com/sounds/v1/ambiences/outdoor_evening.ogg' }
        ];
        const pool = songs.length > 0 ? songs : demoSongs;
        questions = pool.map(target => {
          const others = pool.filter(s => s.title !== target.title);
          const distractors = others.map(s => s.title).slice(0, optionCount - 1);
          const options = shuffle([target.title, ...distractors]);
          return {
            id: target.id || target.title,
            type: 'familiar-songs',
            title: target.title,
            artist: target.artist,
            film: target.film,
            audioUrl: target.audio_url,
            correctAnswer: target.title,
            hint: `Sung by ${target.artist || 'a classic singer'}`,
            options
          };
        });
        break;
      }

      case 'memory-pairs': {
        // Pairs generator with friendly emoji symbols
        const symbolSets = [
          ['🌸', '🌺', '🌻'],
          ['🍎', '🍇', '🍌'],
          ['🐶', '🐱', '🐰'],
          ['🚗', '✈️', '⛵']
        ];
        const chosenSet = symbolSets[Math.floor(Math.random() * symbolSets.length)];
        const cards = [];
        chosenSet.forEach((sym, idx) => {
          cards.push({ id: idx * 2, pairId: idx, symbol: sym });
          cards.push({ id: idx * 2 + 1, pairId: idx, symbol: sym });
        });
        questions.push({
          id: 'pairs-session',
          type: 'memory-pairs',
          cards: shuffle(cards),
          pairCount: chosenSet.length,
          hint: 'Take your time and tap two cards to find a match.'
        });
        break;
      }

      case 'object-naming': {
        const objects = [
          { name: 'Teacup', emoji: '☕', hint: 'Used for hot chai or tea', options: ['Teacup', 'Spoon', 'Plate'] },
          { name: 'Spectacles', emoji: '👓', hint: 'Helps us read clearly', options: ['Spectacles', 'Watch', 'Pen'] },
          { name: 'Telephone', emoji: '☎️', hint: 'Used to talk to family', options: ['Telephone', 'Clock', 'Radio'] },
          { name: 'Watch', emoji: '⌚', hint: 'Tells what time it is', options: ['Watch', 'Ring', 'Mirror'] },
          { name: 'Umbrella', emoji: '☂️', hint: 'Keeps us dry in the rain', options: ['Umbrella', 'Coat', 'Hat'] }
        ];
        questions = shuffle(objects).slice(0, 4).map(o => ({
          ...o,
          type: 'object-naming',
          correctAnswer: o.name,
          options: shuffle(o.options.slice(0, optionCount))
        }));
        break;
      }

      case 'simple-sorting': {
        questions = [
          {
            id: 'sort-1',
            type: 'simple-sorting',
            categoryA: 'Fruits',
            categoryB: 'Vegetables',
            items: [
              { name: 'Apple', icon: '🍎', category: 'Fruits' },
              { name: 'Banana', icon: '🍌', category: 'Fruits' },
              { name: 'Carrot', icon: '🥕', category: 'Vegetables' },
              { name: 'Broccoli', icon: '🥦', category: 'Vegetables' }
            ],
            hint: 'Is this sweet fruit or wholesome vegetable?'
          },
          {
            id: 'sort-2',
            type: 'simple-sorting',
            categoryA: 'Warm Things',
            categoryB: 'Cold Things',
            items: [
              { name: 'Hot Tea', icon: '☕', category: 'Warm Things' },
              { name: 'Sunshine', icon: '☀️', category: 'Warm Things' },
              { name: 'Ice Cream', icon: '🍦', category: 'Cold Things' },
              { name: 'Snowflake', icon: '❄️', category: 'Cold Things' }
            ],
            hint: 'Does it feel hot or cold?'
          }
        ];
        break;
      }

      case 'color-shape': {
        questions = [
          {
            id: 'cs-1',
            type: 'color-shape',
            prompt: 'Which shape is Yellow?',
            targetColor: '#ffd700',
            correctAnswer: 'Yellow Star',
            hint: 'Look for the bright yellow shine.',
            options: [
              { name: 'Yellow Star', color: '#ffd700', shape: '⭐' },
              { name: 'Blue Circle', color: '#3498db', shape: '🔵' },
              { name: 'Green Square', color: '#2ecc71', shape: '🟩' }
            ].slice(0, optionCount)
          },
          {
            id: 'cs-2',
            type: 'color-shape',
            prompt: 'Which one is Green?',
            targetColor: '#2ecc71',
            correctAnswer: 'Green Circle',
            hint: 'Green like fresh grass.',
            options: [
              { name: 'Green Circle', color: '#2ecc71', shape: '🟢' },
              { name: 'Pink Heart', color: '#ff2d78', shape: '💖' },
              { name: 'Yellow Sun', color: '#ffd700', shape: '🟡' }
            ].slice(0, optionCount)
          }
        ];
        break;
      }

      case 'orientation': {
        const now = new Date();
        const hours = now.getHours();
        let timeOfDay = 'Morning';
        if (hours >= 12 && hours < 17) timeOfDay = 'Afternoon';
        else if (hours >= 17 && hours < 21) timeOfDay = 'Evening';
        else if (hours >= 21 || hours < 5) timeOfDay = 'Night';

        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = days[now.getDay()];

        questions = [
          {
            id: 'orient-time',
            type: 'orientation',
            prompt: 'What time of day is it right now?',
            correctAnswer: timeOfDay,
            hint: 'Look out the window or at the clock.',
            options: shuffle([
              { label: 'Morning', icon: '🌅' },
              { label: 'Afternoon', icon: '☀️' },
              { label: 'Evening', icon: '🌇' },
              { label: 'Night', icon: '🌙' }
            ]).filter(o => o.label === timeOfDay || Math.random() > 0.3).slice(0, optionCount)
          },
          {
            id: 'orient-day',
            type: 'orientation',
            prompt: 'What day of the week is today?',
            correctAnswer: currentDay,
            hint: `Today is ${currentDay}.`,
            options: shuffle([
              { label: currentDay, icon: '📅' },
              { label: days[(now.getDay() + 1) % 7], icon: '📅' },
              { label: days[(now.getDay() + 3) % 7], icon: '📅' }
            ]).slice(0, optionCount)
          }
        ];
        break;
      }

      case 'simple-jigsaw': {
        const people = db.prepare('SELECT * FROM people WHERE patient_id = ? AND photo_url IS NOT NULL').all(patientId);
        const photo = people.length > 0 && people[0].photo_url
          ? people[0].photo_url
          : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80';

        questions.push({
          id: 'jigsaw-1',
          type: 'simple-jigsaw',
          imageUrl: photo,
          gridSize: 2, // 2x2 = 4 gentle large pieces
          pieces: [0, 1, 2, 3],
          shuffledPieces: shuffle([0, 1, 2, 3]),
          hint: 'Tap two pieces to gently swap their positions until the picture is whole.'
        });
        break;
      }

      case 'daily-routine': {
        questions = [
          {
            id: 'routine-tea',
            type: 'daily-routine',
            title: 'Making a Warm Cup of Chai / Tea',
            steps: [
              { id: 1, text: 'Boil water and milk in the pot', icon: '🫖' },
              { id: 2, text: 'Add tea leaves and crushed cardamom', icon: '🍃' },
              { id: 3, text: 'Strain gently into your favourite cup', icon: '☕' }
            ],
            hint: 'First boil the water, then add tea leaves, then pour into your cup.'
          },
          {
            id: 'routine-teeth',
            type: 'daily-routine',
            title: 'Morning Toothbrush Routine',
            steps: [
              { id: 1, text: 'Put paste on the toothbrush', icon: '🪥' },
              { id: 2, text: 'Brush teeth gently in circles', icon: '✨' },
              { id: 3, text: 'Rinse mouth with clean water', icon: '💧' }
            ],
            hint: 'First add paste, then brush, then rinse.'
          }
        ];
        break;
      }

      default:
        break;
    }

    db.close();
    return res.json({ questions, optionCount });
  } catch (err) {
    console.error('Questions error:', err);
    return res.status(500).json({ error: 'Failed to generate questions' });
  }
});

module.exports = router;

