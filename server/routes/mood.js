const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// Record patient mood
router.post('/check', authenticateToken, (req, res) => {
  try {
    const { patientId, mood } = req.body;
    if (!patientId || !mood) {
      return res.status(400).json({ error: 'Patient ID and mood are required' });
    }

    if (!['happy', 'neutral', 'sad'].includes(mood)) {
      return res.status(400).json({ error: 'Mood must be happy, neutral, or sad' });
    }

    const db = getDb();
    const result = db.prepare(`
      INSERT INTO mood_checks (patient_id, mood)
      VALUES (?, ?)
    `).run(patientId, mood);

    // If mood is sad, also log a gentle alert for caretaker
    if (mood === 'sad') {
      const patient = db.prepare('SELECT name, caretaker_id FROM patients WHERE id = ?').get(patientId);
      if (patient) {
        db.prepare(`
          INSERT INTO alerts (patient_id, caretaker_id, type, message)
          VALUES (?, ?, 'mood', ?)
        `).run(patientId, patient.caretaker_id, `${patient.name} indicated feeling sad during today's mood check. Gentle engagement is recommended.`);
      }
    }

    db.close();
    return res.status(201).json({ id: result.lastInsertRowid, message: 'Mood recorded' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to record mood' });
  }
});

// Get latest mood for patient
router.get('/latest/:patientId', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const latest = db.prepare(`
      SELECT * FROM mood_checks WHERE patient_id = ? ORDER BY created_at DESC LIMIT 1
    `).get(req.params.patientId);
    db.close();
    return res.json(latest || null);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch mood' });
  }
});

// Patient Help button alert
router.post('/help', authenticateToken, (req, res) => {
  try {
    const { patientId, customMessage } = req.body;
    const db = getDb();

    const patient = db.prepare('SELECT name, caretaker_id FROM patients WHERE id = ?').get(patientId);
    if (!patient) {
      db.close();
      return res.status(404).json({ error: 'Patient not found' });
    }

    const message = customMessage || `${patient.name} pressed the "I need help" button. Please check in with them.`;
    const result = db.prepare(`
      INSERT INTO alerts (patient_id, caretaker_id, type, message)
      VALUES (?, ?, 'help', ?)
    `).run(patientId, patient.caretaker_id, message);

    db.close();
    return res.status(201).json({
      alertId: result.lastInsertRowid,
      message: 'Help request sent! Your caretaker has been notified with love.'
    });
  } catch (err) {
    console.error('Help alert error:', err);
    return res.status(500).json({ error: 'Failed to trigger help alert' });
  }
});

module.exports = router;

