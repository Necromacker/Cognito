const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken, authorizeRoles, auditLog } = require('../middleware/auth');

// Get active and past consents for a patient
router.get('/:patientId', authenticateToken, authorizeRoles('caretaker', 'admin'), (req, res) => {
  try {
    const db = getDb();
    const consents = db.prepare(`
      SELECT c.*, d.name as doctor_name, d.email as doctor_email, d.is_verified as doctor_verified
      FROM consents c
      JOIN users d ON c.doctor_id = d.id
      WHERE c.patient_id = ?
      ORDER BY c.granted_at DESC
    `).all(req.params.patientId);
    db.close();
    return res.json(consents);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch consents' });
  }
});

// Grant doctor consent
router.post('/grant', authenticateToken, authorizeRoles('caretaker', 'admin'), auditLog('GRANT_DOCTOR_CONSENT'), (req, res) => {
  try {
    const { patientId, doctorEmail } = req.body;
    if (!patientId || !doctorEmail) {
      return res.status(400).json({ error: 'patientId and doctorEmail are required' });
    }

    const db = getDb();
    const doctor = db.prepare('SELECT id, is_verified, is_active FROM users WHERE email = ? AND role = ?').get(doctorEmail, 'doctor');

    if (!doctor) {
      db.close();
      return res.status(404).json({ error: 'No doctor found with that email address' });
    }

    if (!doctor.is_verified) {
      db.close();
      return res.status(400).json({ error: 'This doctor is awaiting administrator verification' });
    }

    // Upsert consent
    const existing = db.prepare('SELECT id FROM consents WHERE patient_id = ? AND doctor_id = ?').get(patientId, doctor.id);
    if (existing) {
      db.prepare(`
        UPDATE consents
        SET is_active = 1, granted_at = datetime('now'), revoked_at = NULL
        WHERE id = ?
      `).run(existing.id);
    } else {
      db.prepare(`
        INSERT INTO consents (patient_id, caretaker_id, doctor_id, is_active, granted_at)
        VALUES (?, ?, ?, 1, datetime('now'))
      `).run(patientId, req.user.id, doctor.id);
    }

    db.close();
    return res.json({ message: 'Consent granted to doctor successfully' });
  } catch (err) {
    console.error('Consent error:', err);
    return res.status(500).json({ error: 'Failed to grant consent' });
  }
});

// Revoke doctor consent
router.post('/revoke/:consentId', authenticateToken, authorizeRoles('caretaker', 'admin'), auditLog('REVOKE_DOCTOR_CONSENT'), (req, res) => {
  try {
    const db = getDb();
    db.prepare(`
      UPDATE consents
      SET is_active = 0, revoked_at = datetime('now')
      WHERE id = ?
    `).run(req.params.consentId);
    db.close();
    return res.json({ message: 'Clinical consent revoked successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to revoke consent' });
  }
});

module.exports = router;

