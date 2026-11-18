const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getDb } = require('../db/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get all patients belonging to the current caretaker
router.get('/', authenticateToken, authorizeRoles('caretaker', 'admin'), (req, res) => {
  try {
    const db = getDb();
    let patients;
    if (req.user.role === 'admin') {
      patients = db.prepare(`
        SELECT p.*, u.email, u.pin, c.name as caretaker_name
        FROM patients p
        JOIN users u ON p.user_id = u.id
        JOIN users c ON p.caretaker_id = c.id
        ORDER BY p.name ASC
      `).all();
    } else {
      patients = db.prepare(`
        SELECT p.*, u.email, u.pin
        FROM patients p
        JOIN users u ON p.user_id = u.id
        WHERE p.caretaker_id = ?
        ORDER BY p.name ASC
      `).all(req.user.id);
    }
    db.close();
    return res.json(patients);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Get single patient detail
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const patientId = req.params.id;
    const patient = db.prepare(`
      SELECT p.*, u.email, u.pin
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(patientId);

    if (!patient) {
      db.close();
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Authorization check
    if (req.user.role === 'caretaker' && patient.caretaker_id !== req.user.id) {
      db.close();
      return res.status(403).json({ error: 'Unauthorized' });
    }
    if (req.user.role === 'doctor') {
      const consent = db.prepare('SELECT id FROM consents WHERE patient_id = ? AND doctor_id = ? AND is_active = 1').get(patientId, req.user.id);
      if (!consent) {
        db.close();
        return res.status(403).json({ error: 'No active clinical consent for this patient' });
      }
    }

    db.close();
    return res.json(patient);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// Create new patient (caretaker)
router.post('/', authenticateToken, authorizeRoles('caretaker'), async (req, res) => {
  try {
    const { name, age, stage, language, likes, avoid, notes, pin, avatar_url } = req.body;
    if (!name || !pin) {
      return res.status(400).json({ error: 'Patient name and 4-digit PIN are required' });
    }

    const db = getDb();
    const password_hash = await bcrypt.hash('patient_pin_auth', 10);
    const patientEmail = `patient_${Date.now()}@cognito.local`;

    // 1. Create patient user record
    const userResult = db.prepare(`
      INSERT INTO users (email, password_hash, role, name, pin, avatar_url, language, is_verified, is_active)
      VALUES (?, ?, 'patient', ?, ?, ?, ?, 1, 1)
    `).run(patientEmail, password_hash, name, String(pin).padStart(4, '0'), avatar_url || null, language || 'en');

    const patientUserId = userResult.lastInsertRowid;

    // 2. Create patient profile record
    const profileResult = db.prepare(`
      INSERT INTO patients (user_id, caretaker_id, name, age, stage, language, likes, avoid, notes, avatar_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(patientUserId, req.user.id, name, age ? parseInt(age) : null, stage || 'early', language || 'en', likes || '', avoid || '', notes || '', avatar_url || null);

    const newPatientId = profileResult.lastInsertRowid;

    // 3. Initialize default game settings for all 14 games
    const defaultGames = [
      'who-is-this', 'whose-voice', 'name-to-face', 'relationship-match',
      'place-recognition', 'life-timeline', 'familiar-songs',
      'memory-pairs', 'object-naming', 'simple-sorting', 'color-shape',
      'orientation', 'simple-jigsaw', 'daily-routine'
    ];

    const insertSetting = db.prepare(`
      INSERT INTO game_settings (patient_id, game_type, is_enabled, difficulty, session_length_minutes)
      VALUES (?, ?, 1, 1, 5)
    `);

    for (const g of defaultGames) {
      insertSetting.run(newPatientId, g);
    }

    db.close();
    return res.status(201).json({ id: newPatientId, message: 'Patient profile created successfully' });
  } catch (err) {
    console.error('Create patient error:', err);
    return res.status(500).json({ error: 'Failed to create patient profile' });
  }
});

// Update patient profile
router.put('/:id', authenticateToken, authorizeRoles('caretaker'), async (req, res) => {
  try {
    const patientId = req.params.id;
    const { name, age, stage, language, likes, avoid, notes, pin, avatar_url } = req.body;

    const db = getDb();
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);

    if (!patient || patient.caretaker_id !== req.user.id) {
      db.close();
      return res.status(403).json({ error: 'Unauthorized to edit this patient' });
    }

    db.prepare(`
      UPDATE patients
      SET name = ?, age = ?, stage = ?, language = ?, likes = ?, avoid = ?, notes = ?, avatar_url = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(name, age ? parseInt(age) : null, stage, language, likes, avoid, notes, avatar_url, patientId);

    if (pin) {
      db.prepare(`
        UPDATE users
        SET pin = ?, name = ?, language = ?, avatar_url = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(String(pin).padStart(4, '0'), name, language, avatar_url, patient.user_id);
    }

    db.close();
    return res.json({ message: 'Patient profile updated successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update patient' });
  }
});

// Delete patient profile (cascade delete patient and content)
router.delete('/:id', authenticateToken, authorizeRoles('caretaker', 'admin'), (req, res) => {
  try {
    const patientId = req.params.id;
    const db = getDb();
    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);

    if (!patient) {
      db.close();
      return res.status(404).json({ error: 'Patient not found' });
    }

    if (req.user.role === 'caretaker' && patient.caretaker_id !== req.user.id) {
      db.close();
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete user record which cascades to patients, content, etc.
    db.prepare('DELETE FROM users WHERE id = ?').run(patient.user_id);
    db.close();

    return res.json({ message: 'Patient and all associated records deleted cleanly' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete patient' });
  }
});

// Get game settings for patient
router.get('/:id/games', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const settings = db.prepare('SELECT * FROM game_settings WHERE patient_id = ?').all(req.params.id);
    db.close();
    return res.json(settings);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch game settings' });
  }
});

// Update game settings
router.put('/:id/games', authenticateToken, authorizeRoles('caretaker'), (req, res) => {
  try {
    const patientId = req.params.id;
    const { settings } = req.body; // array of { game_type, is_enabled, difficulty, session_length_minutes }

    const db = getDb();
    const updateStmt = db.prepare(`
      INSERT INTO game_settings (patient_id, game_type, is_enabled, difficulty, session_length_minutes, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(patient_id, game_type) DO UPDATE SET
        is_enabled = excluded.is_enabled,
        difficulty = excluded.difficulty,
        session_length_minutes = excluded.session_length_minutes,
        updated_at = datetime('now')
    `);

    const updateMany = db.transaction((list) => {
      for (const item of list) {
        updateStmt.run(patientId, item.game_type, item.is_enabled ? 1 : 0, item.difficulty || 1, item.session_length_minutes || 5);
      }
    });

    if (Array.isArray(settings)) {
      updateMany(settings);
    }

    db.close();
    return res.json({ message: 'Game settings updated' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update game settings' });
  }
});

module.exports = router;

