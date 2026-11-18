const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { DATA_DIR } = require('../db/database');

const UPLOAD_ROOT = process.env.UPLOAD_DIR || path.join(DATA_DIR, 'uploads');

if (!fs.existsSync(UPLOAD_ROOT)) {
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const patientId = req.params.patientId || req.body.patientId || 'common';
    // Prevent directory traversal
    const safePatientId = String(patientId).replace(/[^a-zA-Z0-9_-]/g, '');
    const targetDir = path.join(UPLOAD_ROOT, safePatientId);
    
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    cb(null, targetDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMime = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/m4a',
    'video/mp4', 'video/webm'
  ];
  if (allowedMime.includes(file.mimetype) || file.mimetype.startsWith('image/') || file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file format. Please upload an image or audio file.'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter
});

module.exports = {
  upload,
  UPLOAD_ROOT
};

