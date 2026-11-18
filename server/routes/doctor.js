const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const { getDb } = require('../db/database');
const { authenticateToken, authorizeRoles, auditLog } = require('../middleware/auth');

// Get all consented patients for doctor
router.get('/patients', authenticateToken, authorizeRoles('doctor', 'admin'), (req, res) => {
  try {
    const db = getDb();
    let patients;

    if (req.user.role === 'admin') {
      patients = db.prepare(`
        SELECT p.*, c.name as caretaker_name, 1 as is_active
        FROM patients p
        JOIN users c ON p.caretaker_id = c.id
        ORDER BY p.name ASC
      `).all();
    } else {
      patients = db.prepare(`
        SELECT p.*, c.name as caretaker_name, cn.granted_at
        FROM patients p
        JOIN consents cn ON cn.patient_id = p.id
        JOIN users c ON p.caretaker_id = c.id
        WHERE cn.doctor_id = ? AND cn.is_active = 1
        ORDER BY p.name ASC
      `).all(req.user.id);
    }

    db.close();
    return res.json(patients);
  } catch (err) {
    console.error('Doctor patients error:', err);
    return res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Helper check for consent
function checkDoctorConsent(db, doctorId, patientId, role) {
  if (role === 'admin') return true;
  const c = db.prepare('SELECT id FROM consents WHERE doctor_id = ? AND patient_id = ? AND is_active = 1').get(doctorId, patientId);
  return !!c;
}

// Get patient clinical breakdown (Read-only for doctor)
router.get('/patient/:id/breakdown', authenticateToken, authorizeRoles('doctor', 'admin'), auditLog('VIEW_PATIENT_BREAKDOWN', 'patient'), (req, res) => {
  try {
    const patientId = req.params.id;
    const db = getDb();

    if (!checkDoctorConsent(db, req.user.id, patientId, req.user.role)) {
      db.close();
      return res.status(403).json({ error: 'Active clinical consent required to view patient data' });
    }

    // Patient info
    const patient = db.prepare('SELECT id, name, age, stage, language, likes, avoid, notes FROM patients WHERE id = ?').get(patientId);

    // Game-level breakdown
    const gameBreakdown = db.prepare(`
      SELECT
        s.game_type,
        COUNT(s.id) as session_count,
        SUM(s.total_questions) as total_questions,
        SUM(s.correct_answers) as correct_answers,
        AVG(s.duration_seconds) as avg_duration_sec,
        AVG(a.response_time_ms) as avg_response_time_ms
      FROM game_sessions s
      LEFT JOIN attempts a ON a.session_id = s.id
      WHERE s.patient_id = ?
      GROUP BY s.game_type
    `).all(patientId);

    // Format breakdown
    const formattedGames = gameBreakdown.map(g => ({
      gameType: g.game_type,
      sessionCount: g.session_count,
      accuracy: g.total_questions > 0 ? Math.round((g.correct_answers / g.total_questions) * 100) : 0,
      avgDurationSec: Math.round(g.avg_duration_sec || 0),
      avgResponseTimeSec: Math.round((g.avg_response_time_ms || 0) / 1000 * 10) / 10
    }));

    // Caretaker daily logs
    const recentLogs = db.prepare(`
      SELECT * FROM daily_logs WHERE patient_id = ? ORDER BY log_date DESC LIMIT 14
    `).all(patientId);

    // Doctor clinical notes
    const clinicalNotes = db.prepare(`
      SELECT n.*, d.name as doctor_name
      FROM notes n
      JOIN users d ON n.doctor_id = d.id
      WHERE n.patient_id = ?
      ORDER BY n.created_at DESC
    `).all(patientId);

    db.close();

    return res.json({
      patient,
      gameBreakdown: formattedGames,
      recentLogs,
      clinicalNotes
    });
  } catch (err) {
    console.error('Breakdown error:', err);
    return res.status(500).json({ error: 'Failed to fetch breakdown' });
  }
});

// Compare two date ranges
router.get('/patient/:id/compare', authenticateToken, authorizeRoles('doctor', 'admin'), auditLog('COMPARE_DATE_RANGES', 'patient'), (req, res) => {
  try {
    const patientId = req.params.id;
    const { start1, end1, start2, end2 } = req.query;

    if (!start1 || !end1 || !start2 || !end2) {
      return res.status(400).json({ error: 'All start and end dates for both ranges are required' });
    }

    const db = getDb();
    if (!checkDoctorConsent(db, req.user.id, patientId, req.user.role)) {
      db.close();
      return res.status(403).json({ error: 'Active clinical consent required' });
    }

    const getRangeStats = (start, end) => {
      return db.prepare(`
        SELECT
          COUNT(DISTINCT s.id) as sessions,
          COUNT(a.id) as attempts,
          SUM(a.is_correct) as correct,
          AVG(a.response_time_ms) as avg_response_time,
          SUM(a.hints_used) as total_hints
        FROM game_sessions s
        LEFT JOIN attempts a ON a.session_id = s.id
        WHERE s.patient_id = ? AND date(s.started_at) BETWEEN ? AND ?
      `).get(patientId, start, end);
    };

    const stats1 = getRangeStats(start1, end1);
    const stats2 = getRangeStats(start2, end2);

    const calcAccuracy = s => s.attempts > 0 ? Math.round((s.correct / s.attempts) * 100) : 0;

    db.close();

    return res.json({
      range1: {
        dates: `${start1} to ${end1}`,
        sessions: stats1.sessions || 0,
        accuracy: calcAccuracy(stats1),
        avgResponseTimeSec: Math.round((stats1.avg_response_time || 0) / 1000 * 10) / 10,
        hintsUsed: stats1.total_hints || 0
      },
      range2: {
        dates: `${start2} to ${end2}`,
        sessions: stats2.sessions || 0,
        accuracy: calcAccuracy(stats2),
        avgResponseTimeSec: Math.round((stats2.avg_response_time || 0) / 1000 * 10) / 10,
        hintsUsed: stats2.total_hints || 0
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to compare ranges' });
  }
});

// Add clinical notes & recommendations
router.post('/patient/:id/notes', authenticateToken, authorizeRoles('doctor', 'admin'), auditLog('ADD_CLINICAL_NOTE', 'patient'), (req, res) => {
  try {
    const patientId = req.params.id;
    const { content, recommendations } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Note content is required' });
    }

    const db = getDb();
    if (!checkDoctorConsent(db, req.user.id, patientId, req.user.role)) {
      db.close();
      return res.status(403).json({ error: 'Active clinical consent required' });
    }

    const result = db.prepare(`
      INSERT INTO notes (patient_id, doctor_id, content, recommendations)
      VALUES (?, ?, ?, ?)
    `).run(patientId, req.user.id, content, recommendations || '');

    db.close();
    return res.status(201).json({ id: result.lastInsertRowid, message: 'Clinical note added' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save note' });
  }
});

// Export PDF report
router.get('/patient/:id/export-pdf', authenticateToken, authorizeRoles('doctor', 'admin'), auditLog('EXPORT_PDF_REPORT', 'patient'), (req, res) => {
  try {
    const patientId = req.params.id;
    const db = getDb();

    if (!checkDoctorConsent(db, req.user.id, patientId, req.user.role)) {
      db.close();
      return res.status(403).json({ error: 'Active clinical consent required' });
    }

    const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId);
    const stats = db.prepare(`
      SELECT
        COUNT(DISTINCT s.id) as total_sessions,
        COUNT(a.id) as total_attempts,
        SUM(a.is_correct) as correct_attempts,
        AVG(a.response_time_ms) as avg_response_time,
        SUM(a.hints_used) as total_hints
      FROM game_sessions s
      LEFT JOIN attempts a ON a.session_id = s.id
      WHERE s.patient_id = ?
    `).get(patientId);

    const notes = db.prepare(`
      SELECT n.*, d.name as doctor_name
      FROM notes n
      JOIN users d ON n.doctor_id = d.id
      WHERE n.patient_id = ?
      ORDER BY n.created_at DESC LIMIT 5
    `).all(patientId);

    const recentLogs = db.prepare(`
      SELECT * FROM daily_logs WHERE patient_id = ? ORDER BY log_date DESC LIMIT 7
    `).all(patientId);

    db.close();

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Cognito_Clinical_Report_${patient.name.replace(/\s+/g, '_')}.pdf"`);

    doc.pipe(res);

    // Title header
    doc.fillColor('#ff2d78').fontSize(24).font('Helvetica-Bold').text('COGNITO CLINICAL REPORT', { align: 'center' });
    doc.moveDown(0.5);
    doc.fillColor('#666666').fontSize(10).font('Helvetica').text('Cognitive Engagement & Longitudinal Progress Report', { align: 'center' });
    doc.moveDown(0.2);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | Doctor: ${req.user.name}`, { align: 'center' });
    doc.moveDown(1.5);

    // Divider line
    doc.strokeColor('#ff2d78').lineWidth(2).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // Patient profile
    doc.fillColor('#1a1a2e').fontSize(14).font('Helvetica-Bold').text('PATIENT PROFILE');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    doc.text(`Name: ${patient.name}`);
    doc.text(`Age: ${patient.age || 'Not specified'}`);
    doc.text(`Dementia Stage: ${patient.stage ? patient.stage.toUpperCase() : 'EARLY'}`);
    doc.text(`Primary Language: ${patient.language ? patient.language.toUpperCase() : 'EN'}`);
    if (patient.likes) doc.text(`Likes: ${patient.likes}`);
    if (patient.avoid) doc.text(`Sensory Triggers / Avoid: ${patient.avoid}`);
    doc.moveDown(1);

    // Cognitive Metrics
    doc.fillColor('#1a1a2e').fontSize(14).font('Helvetica-Bold').text('COGNITIVE ENGAGEMENT METRICS');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica');
    const acc = stats.total_attempts > 0 ? Math.round((stats.correct_attempts / stats.total_attempts) * 100) : 0;
    doc.text(`Total Game Sessions: ${stats.total_sessions || 0}`);
    doc.text(`Total Question Attempts: ${stats.total_attempts || 0}`);
    doc.text(`Overall Accuracy: ${acc}%`);
    doc.text(`Average Response Time: ${Math.round((stats.avg_response_time || 0) / 1000 * 10) / 10} seconds`);
    doc.text(`Total Hints Requested: ${stats.total_hints || 0}`);
    doc.moveDown(1);

    // Caretaker observations
    if (recentLogs.length > 0) {
      doc.fillColor('#1a1a2e').fontSize(14).font('Helvetica-Bold').text('RECENT CARETAKER DAILY LOGS');
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      recentLogs.slice(0, 5).forEach(l => {
        doc.text(`[${l.log_date}] Mood: ${l.mood || 'N/A'} | Sleep: ${l.sleep_hours || 0} hrs (${l.sleep_quality || 'fair'}) | Meds: ${l.medication_taken ? 'Yes' : 'No'}`);
        if (l.notes) doc.text(`   Notes: ${l.notes}`);
        doc.moveDown(0.3);
      });
      doc.moveDown(0.8);
    }

    // Doctor notes
    if (notes.length > 0) {
      doc.fillColor('#1a1a2e').fontSize(14).font('Helvetica-Bold').text('CLINICAL RECOMMENDATIONS');
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica');
      notes.forEach(n => {
        doc.text(`Date: ${n.created_at} - Dr. ${n.doctor_name}`);
        doc.text(`Observations: ${n.content}`);
        if (n.recommendations) doc.text(`Plan: ${n.recommendations}`);
        doc.moveDown(0.5);
      });
    }

    // Safety Disclaimer
    doc.moveDown(2);
    doc.fillColor('#888888').fontSize(9).font('Helvetica-Oblique').text(
      'Disclaimer: This app supports cognitive engagement and tracking. It is not a diagnostic tool.',
      { align: 'center' }
    );

    doc.end();
  } catch (err) {
    console.error('PDF export error:', err);
    return res.status(500).json({ error: 'Failed to generate PDF report' });
  }
});

module.exports = router;

