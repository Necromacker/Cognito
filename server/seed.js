const bcrypt = require('bcryptjs');
const { getDb } = require('./db/database');
const { runMigrations } = require('./db/migrations');

async function seed() {
  console.log('🌱 Starting Cognito database seed...');
  runMigrations();

  const db = getDb();

  // Clear existing demo tables
  db.exec(`
    DELETE FROM audit_logs;
    DELETE FROM alerts;
    DELETE FROM reminders;
    DELETE FROM consents;
    DELETE FROM notes;
    DELETE FROM daily_logs;
    DELETE FROM attempts;
    DELETE FROM game_sessions;
    DELETE FROM game_settings;
    DELETE FROM life_events;
    DELETE FROM songs;
    DELETE FROM places;
    DELETE FROM people;
    DELETE FROM patients;
    DELETE FROM users;
  `);

  const passwordHash = await bcrypt.hash('demo1234', 10);

  // 1. Create Users
  // Caretaker: Priya Sharma
  const caretakerResult = db.prepare(`
    INSERT INTO users (email, password_hash, role, name, language, is_verified, is_active)
    VALUES (?, ?, 'caretaker', 'Priya Sharma', 'en', 1, 1)
  `).run('caretaker@demo.com', passwordHash);
  const caretakerId = caretakerResult.lastInsertRowid;

  // Patient: Ramesh Sharma (PIN 1234)
  const patientUserResult = db.prepare(`
    INSERT INTO users (email, password_hash, role, name, pin, avatar_url, language, is_verified, is_active)
    VALUES (?, ?, 'patient', 'Ramesh Sharma', '1234', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80', 'en', 1, 1)
  `).run('patient@demo.com', passwordHash);
  const patientUserId = patientUserResult.lastInsertRowid;

  // Doctor: Dr. Anjali Desai (Verified)
  const doctorResult = db.prepare(`
    INSERT INTO users (email, password_hash, role, name, language, is_verified, is_active)
    VALUES (?, ?, 'doctor', 'Dr. Anjali Desai', 'en', 1, 1)
  `).run('doctor@demo.com', passwordHash);
  const doctorId = doctorResult.lastInsertRowid;

  // Admin
  db.prepare(`
    INSERT INTO users (email, password_hash, role, name, language, is_verified, is_active)
    VALUES (?, ?, 'admin', 'System Admin', 'en', 1, 1)
  `).run('admin@demo.com', passwordHash);

  // 2. Create Patient Profile
  const patientProfileResult = db.prepare(`
    INSERT INTO patients (user_id, caretaker_id, name, age, stage, language, likes, avoid, notes, avatar_url)
    VALUES (?, ?, 'Ramesh Sharma', 74, 'early', 'en', 'Classic Hindi music, morning gardening, hot masala chai, grandson cricket stories', 'Sudden loud alarms, flashing screens, crowded rooms', 'Prefers gentle praise. Enjoys remembering old college days in Pune.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80')
  `).run(patientUserId, caretakerId);
  const patientId = patientProfileResult.lastInsertRowid;

  // 3. Create Sample Family & Friends (People)
  const people = [
    {
      name: 'Priya',
      relationship: 'Daughter',
      photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      voice_url: 'https://actions.google.com/sounds/v1/ambiences/outdoor_evening.ogg',
      notes: 'Your caring eldest daughter who lives nearby.'
    },
    {
      name: 'Sunita',
      relationship: 'Wife',
      photo_url: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=400&q=80',
      voice_url: 'https://actions.google.com/sounds/v1/ambiences/outdoor_evening.ogg',
      notes: 'Your beloved wife of 48 years.'
    },
    {
      name: 'Aarav',
      relationship: 'Grandson',
      photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
      voice_url: null,
      notes: 'Your grandson who plays cricket and loves your stories.'
    },
    {
      name: 'Vikram',
      relationship: 'Son',
      photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      voice_url: null,
      notes: 'Your son who is an engineer in Bengaluru.'
    },
    {
      name: 'Mohan',
      relationship: 'Best Friend',
      photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      voice_url: null,
      notes: 'College roommate and lifelong chess partner.'
    }
  ];

  const insertPerson = db.prepare(`
    INSERT INTO people (patient_id, name, relationship, photo_url, voice_url, notes, is_hidden)
    VALUES (?, ?, ?, ?, ?, ?, 0)
  `);
  people.forEach(p => insertPerson.run(patientId, p.name, p.relationship, p.photo_url, p.voice_url, p.notes));

  // 4. Create Sample Places
  const places = [
    {
      name: 'Pune Ancestral Home',
      description: 'The green courtyard house with mango trees where you grew up.',
      photo_url: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Mahabaleshwar Hill Station',
      description: 'Where the family took strawberry vacations every summer.',
      photo_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'
    },
    {
      name: 'Marine Drive Promenade',
      description: 'Evening walks with Sunita by the Arabian Sea.',
      photo_url: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80'
    }
  ];

  const insertPlace = db.prepare(`
    INSERT INTO places (patient_id, name, description, photo_url, is_hidden)
    VALUES (?, ?, ?, ?, 0)
  `);
  places.forEach(p => insertPlace.run(patientId, p.name, p.description, p.photo_url));

  // 5. Create Sample Classic Songs
  const songs = [
    {
      title: 'Yeh Shaam Mastani',
      artist: 'Kishore Kumar',
      film: 'Kati Patang',
      audio_url: 'https://actions.google.com/sounds/v1/ambiences/outdoor_evening.ogg'
    },
    {
      title: 'Ajeeb Dastan Hai Yeh',
      artist: 'Lata Mangeshkar',
      film: 'Dil Apna Aur Preet Parai',
      audio_url: 'https://actions.google.com/sounds/v1/ambiences/outdoor_evening.ogg'
    },
    {
      title: 'Lag Ja Gale',
      artist: 'Lata Mangeshkar',
      film: 'Woh Kaun Thi',
      audio_url: 'https://actions.google.com/sounds/v1/ambiences/outdoor_evening.ogg'
    }
  ];

  const insertSong = db.prepare(`
    INSERT INTO songs (patient_id, title, artist, film, audio_url, is_hidden)
    VALUES (?, ?, ?, ?, ?, 0)
  `);
  songs.forEach(s => insertSong.run(patientId, s.title, s.artist, s.film, s.audio_url));

  // 6. Create Life Events Timeline
  const lifeEvents = [
    {
      title: 'Graduated Engineering College in Pune',
      description: 'Received degree in Civil Engineering with honours.',
      year: 1974,
      photo_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: 'Wedding Day with Sunita',
      description: 'Beautiful traditional ceremony surrounded by family and marigolds.',
      year: 1978,
      photo_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: 'Welcoming Daughter Priya',
      description: 'Priya was born on a lovely monsoon morning.',
      year: 1982,
      photo_url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: 'Grandson Aarav Was Born',
      description: 'Becoming a grandfather brought endless joy and laughter.',
      year: 2012,
      photo_url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=600&q=80'
    }
  ];

  const insertEvent = db.prepare(`
    INSERT INTO life_events (patient_id, title, description, year, photo_url, is_hidden)
    VALUES (?, ?, ?, ?, ?, 0)
  `);
  lifeEvents.forEach(e => insertEvent.run(patientId, e.title, e.description, e.year, e.photo_url));

  // 7. Initialize Game Settings for all 14 games
  const gamesList = [
    'who-is-this', 'whose-voice', 'name-to-face', 'relationship-match',
    'place-recognition', 'life-timeline', 'familiar-songs',
    'memory-pairs', 'object-naming', 'simple-sorting', 'color-shape',
    'orientation', 'simple-jigsaw', 'daily-routine'
  ];

  const insertGameSetting = db.prepare(`
    INSERT INTO game_settings (patient_id, game_type, is_enabled, difficulty, session_length_minutes)
    VALUES (?, ?, 1, 1, 5)
  `);
  gamesList.forEach(g => insertGameSetting.run(patientId, g));

  // 8. Grant Consent from Priya to Dr. Anjali
  db.prepare(`
    INSERT INTO consents (patient_id, caretaker_id, doctor_id, is_active, granted_at)
    VALUES (?, ?, ?, 1, datetime('now'))
  `).run(patientId, caretakerId, doctorId);

  // 9. Sample Daily Logs
  const insertLog = db.prepare(`
    INSERT INTO daily_logs (patient_id, caretaker_id, log_date, mood, sleep_hours, sleep_quality, medication_taken, meals, activities, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  insertLog.run(patientId, caretakerId, today, 'happy', 7.5, 'good', 1, 'Poha and fruit for breakfast, dal rice for lunch', 'Watered the garden with Priya, listened to old melodies', 'Smiling and very communicative today.');
  insertLog.run(patientId, caretakerId, yesterday, 'neutral', 6.0, 'fair', 1, 'Idli breakfast, vegetable khichdi dinner', 'Walked in the veranda', 'Took a relaxing afternoon nap.');

  // 10. Sample Reminders
  const insertReminder = db.prepare(`
    INSERT INTO reminders (patient_id, caretaker_id, type, title, description, time, days, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 'daily', 1)
  `);
  insertReminder.run(patientId, caretakerId, 'medication', 'Morning Heart & Memory Medicine', 'Take 1 tablet after warm breakfast', '09:00');
  insertReminder.run(patientId, caretakerId, 'game', 'Cognito Morning Brain Play', 'Play 5 gentle minutes of Who is this?', '11:00');
  insertReminder.run(patientId, caretakerId, 'appointment', 'Dr. Anjali Desai Check-in', 'Virtual teleconsultation review', '16:00');

  // 11. Initial Doctor Note
  db.prepare(`
    INSERT INTO notes (patient_id, doctor_id, content, recommendations)
    VALUES (?, ?, 'Patient exhibits good verbal recall when prompted with family portraits. Mood remains calm and positive in morning hours.', 'Recommend 10 minutes of daily photo games. Keep sessions short and relaxing.')
  `).run(patientId, doctorId);

  // 12. Sample Game Sessions and Attempts for Analytics
  const sessionResult = db.prepare(`
    INSERT INTO game_sessions (patient_id, game_type, difficulty, total_questions, correct_answers, hints_used, duration_seconds, mood_before, mood_after, completed, started_at, ended_at)
    VALUES (?, 'who-is-this', 1, 3, 3, 0, 120, 'happy', 'happy', 1, datetime('now', '-1 hours'), datetime('now', '-58 minutes'))
  `).run(patientId);

  const sessionId = sessionResult.lastInsertRowid;
  db.prepare(`
    INSERT INTO attempts (session_id, question_data, answer_given, correct_answer, is_correct, response_time_ms, hints_used)
    VALUES (?, 'Who is this?', 'Priya', 'Priya', 1, 3400, 0)
  `).run(sessionId);
  db.prepare(`
    INSERT INTO attempts (session_id, question_data, answer_given, correct_answer, is_correct, response_time_ms, hints_used)
    VALUES (?, 'Who is this?', 'Sunita', 'Sunita', 1, 4100, 0)
  `).run(sessionId);
  db.prepare(`
    INSERT INTO attempts (session_id, question_data, answer_given, correct_answer, is_correct, response_time_ms, hints_used)
    VALUES (?, 'Who is this?', 'Aarav', 'Aarav', 1, 2900, 0)
  `).run(sessionId);

  db.close();
  console.log('✅ Cognito database successfully seeded with demo logins and clinical data!');
}

if (require.main === module) {
  seed();
}

module.exports = { seed };

