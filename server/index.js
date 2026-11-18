const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { runMigrations } = require('./db/migrations');

// Run DB migrations automatically on server boot
runMigrations();

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configured for Vite dev server (port 5173) and local network
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Rate limiting for auth and API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 1000, // generous for dementia care sessions
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Serve uploads statically
const UPLOAD_DIR = path.join(__dirname, '..', 'data', 'uploads');
app.use('/uploads', express.static(UPLOAD_DIR));

// Register API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/content', require('./routes/content'));
app.use('/api/games', require('./routes/games'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/dailylog', require('./routes/dailylog'));
app.use('/api/doctor', require('./routes/doctor'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/mood', require('./routes/mood'));
app.use('/api/backup', require('./routes/backup'));
app.use('/api/consent', require('./routes/consent'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Cognito',
    version: '1.0.0',
    disclaimer: 'This app supports cognitive engagement and tracking. It is not a diagnostic tool.'
  });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`🧠 Cognito Server running on http://localhost:${PORT}`);
});

