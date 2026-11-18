const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../db/database');
const { authenticateToken, JWT_SECRET, COOKIE_NAME } = require('../middleware/auth');

// Register caretaker or doctor
router.post('/register', async (req, res) => {
  try {
    const { email, password, role, name, language } = req.body;

    if (!email || !password || !role || !name) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    if (!['caretaker', 'doctor'].includes(role)) {
      return res.status(400).json({ error: 'Role must be either caretaker or doctor' });
    }

    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      db.close();
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const is_verified = role === 'doctor' ? 0 : 1; // Doctors require admin verification

    const result = db.prepare(`
      INSERT INTO users (email, password_hash, role, name, language, is_verified, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(email, password_hash, role, name, language || 'en', is_verified);

    const user = {
      id: result.lastInsertRowid,
      email,
      role,
      name,
      language: language || 'en',
      is_verified
    };

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    db.close();
    return res.status(201).json({ user, message: 'Account registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// Standard email/password login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      db.close();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      db.close();
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.is_active) {
      db.close();
      return res.status(403).json({ error: 'Account has been deactivated' });
    }

    // Check doctor verification
    if (user.role === 'doctor' && !user.is_verified) {
      db.close();
      return res.status(403).json({ error: 'Doctor account is pending administrator verification' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const safeUser = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      language: user.language,
      avatar_url: user.avatar_url,
      is_verified: user.is_verified
    };

    db.close();
    return res.json({ user: safeUser, token });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// Patient PIN login
router.post('/pin-login', async (req, res) => {
  try {
    const { pin, patientId } = req.body;
    if (!pin) {
      return res.status(400).json({ error: '4-digit PIN is required' });
    }

    const db = getDb();
    let user;
    if (patientId) {
      user = db.prepare(`
        SELECT u.*, p.id as patient_profile_id, p.name as patient_name, p.stage, p.caretaker_id
        FROM users u
        JOIN patients p ON p.user_id = u.id
        WHERE p.id = ? AND u.pin = ? AND u.role = 'patient'
      `).get(patientId, pin);
    } else {
      user = db.prepare(`
        SELECT u.*, p.id as patient_profile_id, p.name as patient_name, p.stage, p.caretaker_id
        FROM users u
        LEFT JOIN patients p ON p.user_id = u.id
        WHERE u.pin = ? AND u.role = 'patient'
      `).get(pin);
    }

    if (!user) {
      db.close();
      return res.status(401).json({ error: 'Incorrect PIN. Please ask your caretaker for help.' });
    }

    const token = jwt.sign({ id: user.id, role: 'patient', patientProfileId: user.patient_profile_id }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const safeUser = {
      id: user.id,
      patientProfileId: user.patient_profile_id,
      caretakerId: user.caretaker_id,
      role: 'patient',
      name: user.name,
      language: user.language,
      stage: user.stage,
      avatar_url: user.avatar_url
    };

    db.close();
    return res.json({ user: safeUser, token });
  } catch (err) {
    console.error('PIN Login error:', err);
    return res.status(500).json({ error: 'PIN login failed' });
  }
});

// List patients for shared device quick tile selection
router.get('/patient-tiles', (req, res) => {
  try {
    const db = getDb();
    const patients = db.prepare(`
      SELECT p.id, p.name, p.avatar_url, p.stage
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE u.is_active = 1
      ORDER BY p.name ASC
    `).all();
    db.close();
    return res.json(patients);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load patient tiles' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME);
  return res.json({ message: 'Logged out successfully' });
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    let patientProfile = null;
    if (req.user.role === 'patient') {
      patientProfile = db.prepare('SELECT * FROM patients WHERE user_id = ?').get(req.user.id);
    }
    db.close();

    return res.json({
      user: {
        ...req.user,
        patientProfileId: patientProfile ? patientProfile.id : null,
        caretakerId: patientProfile ? patientProfile.caretaker_id : null
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

module.exports = router;

