const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { getDb } = require('../db/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Helper to verify caretaker owns patient
function verifyCaretaker(db, patientId, userId, userRole) {
  if (userRole === 'admin') return true;
  const p = db.prepare('SELECT caretaker_id FROM patients WHERE id = ?').get(patientId);
  return p && p.caretaker_id === userId;
}

// Upload file endpoint
router.post('/upload/:patientId', authenticateToken, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const relativePath = `/uploads/${req.params.patientId}/${req.file.filename}`;
    return res.json({
      url: relativePath,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (err) {
    return res.status(500).json({ error: 'Upload failed' });
  }
});

// ================= PEOPLE =================
router.get('/people/:patientId', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const query = req.user.role === 'patient'
      ? 'SELECT * FROM people WHERE patient_id = ? AND is_hidden = 0 ORDER BY name ASC'
      : 'SELECT * FROM people WHERE patient_id = ? ORDER BY name ASC';
    const items = db.prepare(query).all(req.params.patientId);
    db.close();
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch people' });
  }
});

router.post('/people/:patientId', authenticateToken, authorizeRoles('caretaker', 'admin'), (req, res) => {
  try {
    const { name, relationship, photo_url, voice_url, notes, is_hidden } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const db = getDb();
    if (!verifyCaretaker(db, req.params.patientId, req.user.id, req.user.role)) {
      db.close();
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const result = db.prepare(`
      INSERT INTO people (patient_id, name, relationship, photo_url, voice_url, notes, is_hidden)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(req.params.patientId, name, relationship, photo_url, voice_url, notes, is_hidden ? 1 : 0);

    db.close();
    return res.status(201).json({ id: result.lastInsertRowid, message: 'Person saved' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create person' });
  }
});

router.put('/people/:id', authenticateToken, authorizeRoles('caretaker', 'admin'), (req, res) => {
  try {
    const { name, relationship, photo_url, voice_url, notes, is_hidden } = req.body;
    const db = getDb();
    db.prepare(`
      UPDATE people
      SET name = ?, relationship = ?, photo_url = ?, voice_url = ?, notes = ?, is_hidden = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(name, relationship, photo_url, voice_url, notes, is_hidden ? 1 : 0, req.params.id);
    db.close();
    return res.json({ message: 'Person updated' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update person' });
  }
});

router.delete('/people/:id', authenticateToken, authorizeRoles('caretaker', 'admin'), (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM people WHERE id = ?').run(req.params.id);
    db.close();
    return res.json({ message: 'Person removed' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete' });
  }
});

// ================= PLACES =================
router.get('/places/:patientId', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const query = req.user.role === 'patient'
      ? 'SELECT * FROM places WHERE patient_id = ? AND is_hidden = 0'
      : 'SELECT * FROM places WHERE patient_id = ?';
    const items = db.prepare(query).all(req.params.patientId);
    db.close();
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch places' });
  }
});

router.post('/places/:patientId', authenticateToken, authorizeRoles('caretaker', 'admin'), (req, res) => {
  try {
    const { name, description, photo_url, is_hidden } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const db = getDb();
    const result = db.prepare(`
      INSERT INTO places (patient_id, name, description, photo_url, is_hidden)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.params.patientId, name, description, photo_url, is_hidden ? 1 : 0);
    db.close();
    return res.status(201).json({ id: result.lastInsertRowid, message: 'Place saved' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create place' });
  }
});

router.put('/places/:id', authenticateToken, authorizeRoles('caretaker', 'admin'), (req, res) => {
  try {
    const { name, description, photo_url, is_hidden } = req.body;
    const db = getDb();
    db.prepare(`
      UPDATE places SET name = ?, description = ?, photo_url = ?, is_hidden = ? WHERE id = ?
    `).run(name, description, photo_url, is_hidden ? 1 : 0, req.params.id);
    db.close();
    return res.json({ message: 'Place updated' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update place' });
  }
});

router.delete('/places/:id', authenticateToken, authorizeRoles('caretaker', 'admin'), (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM places WHERE id = ?').run(req.params.id);
    db.close();
    return res.json({ message: 'Place deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete' });
  }
});

// ================= SONGS =================
router.get('/songs/:patientId', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const query = req.user.role === 'patient'
      ? 'SELECT * FROM songs WHERE patient_id = ? AND is_hidden = 0'
      : 'SELECT * FROM songs WHERE patient_id = ?';
    const items = db.prepare(query).all(req.params.patientId);
    db.close();
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch songs' });
  }
});

router.post('/songs/:patientId', authenticateToken, authorizeRoles('caretaker', 'admin'), (req, res) => {
  try {
    const { title, artist, film, audio_url, is_hidden } = req.body;
    if (!title) return res.status(400).json({ error: 'Song title is required' });

    const db = getDb();
    const result = db.prepare(`
      INSERT INTO songs (patient_id, title, artist, film, audio_url, is_hidden)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.params.patientId, title, artist, film, audio_url, is_hidden ? 1 : 0);
    db.close();
    return res.status(201).json({ id: result.lastInsertRowid, message: 'Song saved' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create song' });
  }
});

router.put('/songs/:id', authenticateToken, authorizeRoles('caretaker', 'admin'), (req, res) => {
  try {
    const { title, artist, film, audio_url, is_hidden } = req.body;
    const db = getDb();
    db.prepare(`
      UPDATE songs SET title = ?, artist = ?, film = ?, audio_url = ?, is_hidden = ? WHERE id = ?
    `).run(title, artist, film, audio_url, is_hidden ? 1 : 0, req.params.id);
    db.close();
    return res.json({ message: 'Song updated' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update song' });
  }
});

router.delete('/songs/:id', authenticateToken, authorizeRoles('caretaker', 'admin'), (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM songs WHERE id = ?').run(req.params.id);
    db.close();
    return res.json({ message: 'Song deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete' });
  }
});

// ================= LIFE EVENTS =================
router.get('/life-events/:patientId', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const query = req.user.role === 'patient'
      ? 'SELECT * FROM life_events WHERE patient_id = ? AND is_hidden = 0 ORDER BY year ASC'
      : 'SELECT * FROM life_events WHERE patient_id = ? ORDER BY year ASC';
    const items = db.prepare(query).all(req.params.patientId);
    db.close();
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch life events' });
  }
});

router.post('/life-events/:patientId', authenticateToken, authorizeRoles('caretaker', 'admin'), (req, res) => {
  try {
    const { title, description, year, photo_url, is_hidden } = req.body;
    if (!title) return res.status(400).json({ error: 'Event title is required' });

    const db = getDb();
    const result = db.prepare(`
      INSERT INTO life_events (patient_id, title, description, year, photo_url, is_hidden)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(req.params.patientId, title, description, year ? parseInt(year) : null, photo_url, is_hidden ? 1 : 0);
    db.close();
    return res.status(201).json({ id: result.lastInsertRowid, message: 'Life event saved' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save life event' });
  }
});

router.put('/life-events/:id', authenticateToken, authorizeRoles('caretaker', 'admin'), (req, res) => {
  try {
    const { title, description, year, photo_url, is_hidden } = req.body;
    const db = getDb();
    db.prepare(`
      UPDATE life_events SET title = ?, description = ?, year = ?, photo_url = ?, is_hidden = ? WHERE id = ?
    `).run(title, description, year ? parseInt(year) : null, photo_url, is_hidden ? 1 : 0, req.params.id);
    db.close();
    return res.json({ message: 'Life event updated' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update life event' });
  }
});

router.delete('/life-events/:id', authenticateToken, authorizeRoles('caretaker', 'admin'), (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM life_events WHERE id = ?').run(req.params.id);
    db.close();
    return res.json({ message: 'Life event deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete' });
  }
});

// Toggle hidden status
router.patch('/toggle-hide/:entityType/:id', authenticateToken, authorizeRoles('caretaker', 'admin'), (req, res) => {
  try {
    const { entityType, id } = req.params;
    const allowed = ['people', 'places', 'songs', 'life_events'];
    if (!allowed.includes(entityType)) {
      return res.status(400).json({ error: 'Invalid entity' });
    }

    const db = getDb();
    const item = db.prepare(`SELECT is_hidden FROM ${entityType} WHERE id = ?`).get(id);
    if (!item) {
      db.close();
      return res.status(404).json({ error: 'Item not found' });
    }

    const newStatus = item.is_hidden ? 0 : 1;
    db.prepare(`UPDATE ${entityType} SET is_hidden = ? WHERE id = ?`).run(newStatus, id);
    db.close();

    return res.json({ is_hidden: newStatus, message: newStatus ? 'Item hidden from patient' : 'Item visible to patient' });
  } catch (err) {
    return res.status(500).json({ error: 'Toggle failed' });
  }
});

module.exports = router;

