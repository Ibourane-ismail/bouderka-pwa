// Bouderka PWA - Express Server Entry Point
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 10 : 1000,
  message: { success: false, message: 'Trop de requêtes, réessayez plus tard.' }
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Authentication routes
app.use('/api/auth', require('./src/routes/auth.routes'));

// Business routes with role-based access control
app.use('/api/vehicules', require('./src/routes/vehicule.routes'));
app.use('/api/rdv', require('./src/routes/rdv.routes'));
app.use('/api/plages', require('./src/routes/plage.routes'));
app.use('/api/testdrive', require('./src/routes/testdrive.routes'));
app.use('/api/entretien', require('./src/routes/entretien.routes'));
app.use('/api/notifications', require('./src/routes/notification.routes'));
app.use('/api/clients', require('./src/routes/client.routes'));

// API routes placeholder
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;