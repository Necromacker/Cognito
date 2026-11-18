const jwt = require('jsonwebtoken');
const { getDb } = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'cognito_super_secret_jwt_key_2026';
const COOKIE_NAME = 'cognito_token';

function authenticateToken(req, res, next) {
  let token = req.cookies ? req.cookies[COOKIE_NAME] : null;

  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const db = getDb();
    const user = db.prepare('SELECT id, email, role, name, pin, avatar_url, language, is_verified, is_active FROM users WHERE id = ?').get(decoded.id);
    db.close();

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'User account not found or inactive' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }
    next();
  };
}

function auditLog(action, entityType = null) {
  return (req, res, next) => {
    // Run after response is finished
    res.on('finish', () => {
      try {
        if (req.user) {
          const db = getDb();
          const entityId = req.params.patientId || req.params.id || null;
          const ip = req.ip || req.connection.remoteAddress;
          db.prepare(`
            INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
            VALUES (?, ?, ?, ?, ?, ?)
          `).run(req.user.id, action, entityType, entityId ? parseInt(entityId) : null, `${req.method} ${req.originalUrl}`, ip);
          db.close();
        }
      } catch (e) {
        console.error('Audit log error:', e);
      }
    });
    next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles,
  auditLog,
  JWT_SECRET,
  COOKIE_NAME
};

