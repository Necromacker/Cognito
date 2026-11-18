const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const unzipper = require('unzipper');
const multer = require('multer');
const { authenticateToken, authorizeRoles, auditLog } = require('../middleware/auth');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const uploadZip = multer({ dest: path.join(__dirname, '..', '..', 'data', 'temp_restore') });

// Export backup ZIP
router.get('/export', authenticateToken, authorizeRoles('caretaker', 'admin'), auditLog('BACKUP_EXPORT'), (req, res) => {
  try {
    const archive = archiver('zip', { zlib: { level: 9 } });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="cognito_backup_${Date.now()}.zip"`);

    archive.pipe(res);

    // Append database file
    const dbPath = path.join(DATA_DIR, 'app.db');
    if (fs.existsSync(dbPath)) {
      archive.file(dbPath, { name: 'app.db' });
    }

    // Append uploads directory
    const uploadsPath = path.join(DATA_DIR, 'uploads');
    if (fs.existsSync(uploadsPath)) {
      archive.directory(uploadsPath, 'uploads');
    }

    archive.finalize();
  } catch (err) {
    console.error('Export error:', err);
    return res.status(500).json({ error: 'Failed to create backup archive' });
  }
});

// Restore backup from uploaded ZIP
router.post('/restore', authenticateToken, authorizeRoles('caretaker', 'admin'), uploadZip.single('backupZip'), auditLog('BACKUP_RESTORE'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No backup ZIP file provided' });
    }

    const zipPath = req.file.path;

    fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: DATA_DIR }))
      .on('close', () => {
        try {
          fs.unlinkSync(zipPath); // clean up uploaded zip
        } catch (e) {}
        return res.json({ message: 'Backup restored successfully. Please refresh your browser.' });
      })
      .on('error', (err) => {
        console.error('Restore stream error:', err);
        return res.status(500).json({ error: 'Failed to extract backup file' });
      });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to restore backup' });
  }
});

module.exports = router;

