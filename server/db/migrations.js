const { getDb } = require('./database');

function runMigrations() {
  const db = getDb();

  db.exec(`
    -- Users table (all roles)
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('patient','caretaker','doctor','admin')),
      name TEXT NOT NULL,
      pin TEXT,
      avatar_url TEXT,
      language TEXT DEFAULT 'en',
      is_verified INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Patient profiles (linked to a user and a caretaker)
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      caretaker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      age INTEGER,
      stage TEXT CHECK(stage IN ('early','moderate','advanced')),
      language TEXT DEFAULT 'en',
      likes TEXT,
      avoid TEXT,
      notes TEXT,
      avatar_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_patients_caretaker ON patients(caretaker_id);
    CREATE INDEX IF NOT EXISTS idx_patients_user ON patients(user_id);

    -- People (family/friends the patient should remember)
    CREATE TABLE IF NOT EXISTS people (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      relationship TEXT,
      photo_url TEXT,
      voice_url TEXT,
      notes TEXT,
      is_hidden INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_people_patient ON people(patient_id);

    -- Places
    CREATE TABLE IF NOT EXISTS places (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      photo_url TEXT,
      is_hidden INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_places_patient ON places(patient_id);

    -- Songs
    CREATE TABLE IF NOT EXISTS songs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      artist TEXT,
      film TEXT,
      audio_url TEXT,
      is_hidden INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_songs_patient ON songs(patient_id);

    -- Life events
    CREATE TABLE IF NOT EXISTS life_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT,
      year INTEGER,
      photo_url TEXT,
      is_hidden INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_life_events_patient ON life_events(patient_id);

    -- Media files (general purpose)
    CREATE TABLE IF NOT EXISTS media_files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      file_path TEXT NOT NULL,
      file_type TEXT NOT NULL CHECK(file_type IN ('photo','voice','song','video','document')),
      original_name TEXT,
      mime_type TEXT,
      size_bytes INTEGER,
      tags TEXT,
      entity_type TEXT,
      entity_id INTEGER,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_media_patient ON media_files(patient_id);

    -- Game sessions
    CREATE TABLE IF NOT EXISTS game_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      game_type TEXT NOT NULL,
      difficulty INTEGER DEFAULT 1,
      total_questions INTEGER DEFAULT 0,
      correct_answers INTEGER DEFAULT 0,
      hints_used INTEGER DEFAULT 0,
      duration_seconds INTEGER DEFAULT 0,
      mood_before TEXT,
      mood_after TEXT,
      completed INTEGER DEFAULT 0,
      started_at TEXT DEFAULT (datetime('now')),
      ended_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_patient ON game_sessions(patient_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_date ON game_sessions(started_at);

    -- Individual attempts within a session
    CREATE TABLE IF NOT EXISTS attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
      question_data TEXT NOT NULL,
      answer_given TEXT,
      correct_answer TEXT,
      is_correct INTEGER DEFAULT 0,
      response_time_ms INTEGER,
      hints_used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_attempts_session ON attempts(session_id);

    -- Daily logs (caretaker entries)
    CREATE TABLE IF NOT EXISTS daily_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      caretaker_id INTEGER NOT NULL REFERENCES users(id),
      log_date TEXT NOT NULL,
      mood TEXT,
      sleep_hours REAL,
      sleep_quality TEXT,
      medication_taken INTEGER DEFAULT 0,
      meals TEXT,
      activities TEXT,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_logs_patient_date ON daily_logs(patient_id, log_date);

    -- Clinical notes (doctor)
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      doctor_id INTEGER NOT NULL REFERENCES users(id),
      content TEXT NOT NULL,
      recommendations TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_notes_patient ON notes(patient_id);

    -- Consents (caretaker grants doctor access)
    CREATE TABLE IF NOT EXISTS consents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      caretaker_id INTEGER NOT NULL REFERENCES users(id),
      doctor_id INTEGER NOT NULL REFERENCES users(id),
      is_active INTEGER DEFAULT 1,
      granted_at TEXT DEFAULT (datetime('now')),
      revoked_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_consents_patient ON consents(patient_id);
    CREATE INDEX IF NOT EXISTS idx_consents_doctor ON consents(doctor_id);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_consents_unique ON consents(patient_id, doctor_id);

    -- Reminders
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      caretaker_id INTEGER NOT NULL REFERENCES users(id),
      type TEXT NOT NULL CHECK(type IN ('medication','appointment','game','custom')),
      title TEXT NOT NULL,
      description TEXT,
      time TEXT NOT NULL,
      days TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_reminders_patient ON reminders(patient_id);

    -- Alerts (patient help requests, system alerts)
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      caretaker_id INTEGER REFERENCES users(id),
      type TEXT NOT NULL CHECK(type IN ('help','mood','system','game')),
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_alerts_caretaker ON alerts(caretaker_id);

    -- Audit logs
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      details TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_date ON audit_logs(created_at);

    -- Game settings per patient
    CREATE TABLE IF NOT EXISTS game_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      game_type TEXT NOT NULL,
      is_enabled INTEGER DEFAULT 1,
      difficulty INTEGER DEFAULT 1,
      session_length_minutes INTEGER DEFAULT 5,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(patient_id, game_type)
    );

    -- Mood checks
    CREATE TABLE IF NOT EXISTS mood_checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
      mood TEXT NOT NULL CHECK(mood IN ('happy','neutral','sad')),
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_mood_patient ON mood_checks(patient_id);
  `);

  console.log('✅ Database migrations complete');
  db.close();
}

module.exports = { runMigrations };

// Run directly
if (require.main === module) {
  runMigrations();
}

