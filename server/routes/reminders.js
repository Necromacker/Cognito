const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// Get reminders for a patient
router.get('/:patientId', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const reminders = db.prepare(`
      SELECT * FROM reminders WHERE patient_id = ? ORDER BY time ASC
    `).all(req.params.patientId);
    db.close();
    return res.json(reminders);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// Create reminder
router.post('/:patientId', authenticateToken, (req, res) => {
  try {
    const { patientId } = req.params;
    const { type, title, description, time, days, is_active } = req.body;

    if (!type || !title || !time) {
      return res.status(400).json({ error: 'Type, title, and time are required' });
    }

    const db = getDb();
    const result = db.prepare(`
      INSERT INTO reminders (patient_id, caretaker_id, type, title, description, time, days, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(patientId, req.user.id, type, title, description || '', time, days ? (Array.isArray(days) ? days.join(',') : days) : 'daily', is_active !== false ? 1 : 0);

    db.close();
    return res.status(201).json({ id: result.lastInsertRowid, message: 'Reminder created' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// Update reminder
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { type, title, description, time, days, is_active } = req.body;
    const db = getDb();
    db.prepare(`
      UPDATE reminders
      SET type = ?, title = ?, description = ?, time = ?, days = ?, is_active = ?
      WHERE id = ?
    `).run(type, title, description || '', time, days ? (Array.isArray(days) ? days.join(',') : days) : 'daily', is_active ? 1 : 0, req.params.id);

    db.close();
    return res.json({ message: 'Reminder updated' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update reminder' });
  }
});

// Delete reminder
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM reminders WHERE id = ?').run(req.params.id);
    db.close();
    return res.json({ message: 'Reminder removed' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete reminder' });
  }
});

module.exports = router;

