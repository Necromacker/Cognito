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
    const { log_date, mood, sleep_hours, sleep_quality, medication_taken, meals, activities, notes, water_glasses, meds_detail } = req.body;

    if (!log_date) {
      return res.status(400).json({ error: 'Log date is required' });
    }

    const db = getDb();
    // Check if log already exists for this date
    const existing = db.prepare('SELECT id FROM daily_logs WHERE patient_id = ? AND log_date = ?').get(patientId, log_date);

    const medsStr = typeof meds_detail === 'object' ? JSON.stringify(meds_detail) : (meds_detail || '{}');

    if (existing) {
      db.prepare(`
        UPDATE daily_logs
        SET mood = COALESCE(?, mood),
            sleep_hours = COALESCE(?, sleep_hours),
            sleep_quality = COALESCE(?, sleep_quality),
            medication_taken = COALESCE(?, medication_taken),
            meals = COALESCE(?, meals),
            activities = COALESCE(?, activities),
            notes = COALESCE(?, notes),
            water_glasses = COALESCE(?, water_glasses),
            meds_detail = COALESCE(?, meds_detail),
            updated_at = datetime('now')
        WHERE id = ?
      `).run(
        mood !== undefined ? mood : null,
        sleep_hours ? parseFloat(sleep_hours) : null,
        sleep_quality !== undefined ? sleep_quality : null,
        medication_taken !== undefined ? (medication_taken ? 1 : 0) : null,
        meals !== undefined ? meals : null,
        activities !== undefined ? activities : null,
        notes !== undefined ? notes : null,
        water_glasses !== undefined ? parseInt(water_glasses) : null,
        meds_detail !== undefined ? medsStr : null,
        existing.id
      );
      db.close();
      return res.json({ id: existing.id, message: 'Daily log updated' });
    } else {
      const result = db.prepare(`
        INSERT INTO daily_logs (patient_id, caretaker_id, log_date, mood, sleep_hours, sleep_quality, medication_taken, meals, activities, notes, water_glasses, meds_detail)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        patientId,
        req.user.id,
        log_date,
        mood || 'neutral',
        sleep_hours ? parseFloat(sleep_hours) : null,
        sleep_quality || 'good',
        medication_taken ? 1 : 0,
        meals || '',
        activities || '',
        notes || '',
        water_glasses ? parseInt(water_glasses) : 0,
        medsStr
      );
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

