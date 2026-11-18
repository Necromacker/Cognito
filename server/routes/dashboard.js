const express = require('express');
const router = express.Router();
const { getDb } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// Get overall stats for a patient
router.get('/stats/:patientId', authenticateToken, (req, res) => {
  try {
    const patientId = req.params.patientId;
    const db = getDb();

    // Total attempts & accuracy
    const attemptsSummary = db.prepare(`
      SELECT
        COUNT(a.id) as total_attempts,
        SUM(a.is_correct) as correct_attempts,
        AVG(a.response_time_ms) as avg_response_time,
        SUM(a.hints_used) as total_hints
      FROM attempts a
      JOIN game_sessions s ON a.session_id = s.id
      WHERE s.patient_id = ?
    `).get(patientId);

    // Calculate streak (consecutive days with completed sessions)
    const activeDates = db.prepare(`
      SELECT DISTINCT substr(started_at, 1, 10) as session_date
      FROM game_sessions
      WHERE patient_id = ? AND completed = 1
      ORDER BY session_date DESC
    `).all(patientId);

    let streak = 0;
    if (activeDates.length > 0) {
      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

      // Check if patient played today or yesterday to preserve active streak
      if (activeDates[0].session_date === today || activeDates[0].session_date === yesterday) {
        streak = 1;
        let currDate = new Date(activeDates[0].session_date);
        for (let i = 1; i < activeDates.length; i++) {
          const prevDay = new Date(currDate);
          prevDay.setDate(prevDay.getDate() - 1);
          const prevStr = prevDay.toISOString().slice(0, 10);
          if (activeDates[i].session_date === prevStr) {
            streak++;
            currDate = prevDay;
          } else {
            break;
          }
        }
      }
    }

    const total = attemptsSummary.total_attempts || 0;
    const correct = attemptsSummary.correct_attempts || 0;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    const avgResponseTimeSec = Math.round((attemptsSummary.avg_response_time || 0) / 1000 * 10) / 10;

    // Recent sessions
    const recentSessions = db.prepare(`
      SELECT id, game_type, difficulty, total_questions, correct_answers, hints_used, duration_seconds, started_at
      FROM game_sessions
      WHERE patient_id = ?
      ORDER BY started_at DESC LIMIT 5
    `).all(patientId);

    db.close();

    return res.json({
      totalAttempts: total,
      accuracy,
      avgResponseTimeSec,
      totalHints: attemptsSummary.total_hints || 0,
      streak,
      recentSessions
    });
  } catch (err) {
    console.error('Stats error:', err);
    return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get chart data (accuracy & sessions over last 7 or 14 days)
router.get('/chart/:patientId', authenticateToken, (req, res) => {
  try {
    const patientId = req.params.patientId;
    const days = parseInt(req.query.days) || 7;
    const db = getDb();

    const chartData = db.prepare(`
      SELECT
        substr(s.started_at, 1, 10) as date,
        COUNT(a.id) as attempts,
        SUM(a.is_correct) as correct,
        AVG(a.response_time_ms) as avg_response_time
      FROM game_sessions s
      JOIN attempts a ON a.session_id = s.id
      WHERE s.patient_id = ? AND s.started_at >= date('now', '-' || ? || ' days')
      GROUP BY substr(s.started_at, 1, 10)
      ORDER BY date ASC
    `).all(patientId, days);

    const formatted = chartData.map(row => ({
      date: row.date,
      accuracy: row.attempts > 0 ? Math.round((row.correct / row.attempts) * 100) : 0,
      attempts: row.attempts,
      avgResponseTime: Math.round(row.avg_response_time / 1000)
    }));

    db.close();
    return res.json(formatted);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

// Get alerts for caretaker
router.get('/alerts', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    let alerts;
    if (req.user.role === 'admin') {
      alerts = db.prepare(`
        SELECT a.*, p.name as patient_name
        FROM alerts a
        JOIN patients p ON a.patient_id = p.id
        ORDER BY a.created_at DESC LIMIT 50
      `).all();
    } else {
      alerts = db.prepare(`
        SELECT a.*, p.name as patient_name
        FROM alerts a
        JOIN patients p ON a.patient_id = p.id
        WHERE p.caretaker_id = ?
        ORDER BY a.created_at DESC LIMIT 50
      `).all(req.user.id);
    }
    db.close();
    return res.json(alerts);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Mark alert as read
router.post('/alerts/:id/read', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    db.prepare('UPDATE alerts SET is_read = 1 WHERE id = ?').run(req.params.id);
    db.close();
    return res.json({ message: 'Alert acknowledged' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update alert' });
  }
});

module.exports = router;

