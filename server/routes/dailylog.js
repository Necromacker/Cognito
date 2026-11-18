const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Get logs for patient
router.get('/:patientId', authenticateToken, (req, res) => {
  try {
    const { patientId } = req.params;
    const { startDate, endDate } = req.query;
    const db = getDb();

    let query = 'SELECT * FROM daily_logs WHERE patient_id = ?';
    const params = [patientId];

    if (startDate && endDate) {
      query += ' AND log_date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    query += ' ORDER BY log_date DESC LIMIT 60';

    const logs = db.prepare(query).all(...params);
    db.close();
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch daily logs' });
  }
});

// Create or update daily log
router.post('/:patientId', authenticateToken, authorizeRoles('caretaker', 'admin'), (req, res) => {
  try {
    const { patientId } = req.params;
    const { log_date, mood, sleep_hours, sleep_quality, medication_taken, meals, activities, notes } = req.body;

    if (!log_date) {
      return res.status(400).json({ error: 'Log date is required' });
    }

    const db = getDb();
    // Check if log already exists for this date
    const existing = db.prepare('SELECT id FROM daily_logs WHERE patient_id = ? AND log_date = ?').get(patientId, log_date);

    if (existing) {
      db.prepare(`
        UPDATE daily_logs
        SET mood = ?, sleep_hours = ?, sleep_quality = ?, medication_taken = ?, meals = ?, activities = ?, notes = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(mood, sleep_hours ? parseFloat(sleep_hours) : null, sleep_quality, medication_taken ? 1 : 0, meals, activities, notes, existing.id);
      db.close();
      return res.json({ id: existing.id, message: 'Daily log updated' });
    } else {
      const result = db.prepare(`
        INSERT INTO daily_logs (patient_id, caretaker_id, log_date, mood, sleep_hours, sleep_quality, medication_taken, meals, activities, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(patientId, req.user.id, log_date, mood, sleep_hours ? parseFloat(sleep_hours) : null, sleep_quality, medication_taken ? 1 : 0, meals, activities, notes);
      db.close();
      return res.status(201).json({ id: result.lastInsertRowid, message: 'Daily log saved' });
    }
  } catch (err) {
    console.error('Daily log save error:', err);
    return res.status(500).json({ error: 'Failed to save daily log' });
  }
});

// Delete daily log
router.delete('/:id', authenticateToken, authorizeRoles('caretaker', 'admin'), (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM daily_logs WHERE id = ?').run(req.params.id);
    db.close();
    return res.json({ message: 'Daily log deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete log' });
  }
});

module.exports = router;

