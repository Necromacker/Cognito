const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Require admin for all routes here
router.use(authenticateToken, authorizeRoles('admin'));

// Get all users
router.get('/users', (req, res) => {
  try {
    const db = getDb();
    const users = db.prepare(`
      SELECT id, email, role, name, language, is_verified, is_active, created_at
      FROM users
      ORDER BY created_at DESC
    `).all();
    db.close();
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Verify or unverify doctor
router.post('/users/:id/verify', (req, res) => {
  try {
    const { isVerified } = req.body;
    const db = getDb();
    db.prepare('UPDATE users SET is_verified = ? WHERE id = ? AND role = ?')
      .run(isVerified ? 1 : 0, req.params.id, 'doctor');
    db.close();
    return res.json({ message: `Doctor ${isVerified ? 'verified' : 'unverified'} successfully` });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update verification status' });
  }
});

// Toggle user active status
router.post('/users/:id/toggle-active', (req, res) => {
  try {
    const db = getDb();
    const user = db.prepare('SELECT is_active FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      db.close();
      return res.status(404).json({ error: 'User not found' });
    }
    const newStatus = user.is_active ? 0 : 1;
    db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(newStatus, req.params.id);
    db.close();
    return res.json({ is_active: newStatus, message: `User ${newStatus ? 'activated' : 'deactivated'}` });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to toggle active status' });
  }
});

// View audit logs
router.get('/audit-logs', (req, res) => {
  try {
    const { action, limit } = req.query;
    const db = getDb();
    let query = `
      SELECT a.*, u.name as user_name, u.email as user_email, u.role as user_role
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
    `;
    const params = [];
    if (action) {
      query += ' WHERE a.action = ?';
      params.push(action);
    }
    query += ' ORDER BY a.created_at DESC LIMIT ?';
    params.push(parseInt(limit) || 100);

    const logs = db.prepare(query).all(...params);
    db.close();
    return res.json(logs);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

module.exports = router;

