require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const path         = require('path');
const rateLimit    = require('express-rate-limit');
const connectDB    = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');
const notFound     = require('./middlewares/notFound');

// ─── Connect Database ─────────────────────────────────────────────────────────
connectDB();

const app = express();

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin:      [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      200,
  message:  { success: false, message: 'Too many requests, please try again later.' },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max:      20,
  message:  { success: false, message: 'AI rate limit exceeded. Please wait a moment.' },
});

app.use('/api', limiter);

// ─── Body Parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── HTTP Request Logger (dev only) ─────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🌍 CultureQuest AI API is running',
    version: '1.0.0',
    env:     process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/authRoutes'));
app.use('/api/destinations', require('./routes/destinationRoutes'));
app.use('/api/hidden-gems',  require('./routes/hiddenGemRoutes'));
app.use('/api/experiences',  require('./routes/experienceRoutes'));
app.use('/api/events',       require('./routes/eventRoutes'));
app.use('/api/reviews',      require('./routes/reviewRoutes'));
app.use('/api/trips',        require('./routes/tripRoutes'));
app.use('/api/bookmarks',    require('./routes/bookmarkRoutes'));
app.use('/api/notifications',require('./routes/notificationRoutes'));
app.use('/api/ai',           aiLimiter, require('./routes/aiRoutes'));
app.use('/api/admin',        require('./routes/adminRoutes'));
app.use('/api/users',        require('./routes/userRoutes'));

// ─── 404 & Error Handlers ─────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err.message);
  process.exit(1);
});

module.exports = app;
