// Bouderka PWA - Configuration de l'application Express (sans app.listen)
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 300 : 1000,
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
app.use('/api/auth', require('./routes/auth.routes'));

// Business routes with role-based access control
app.use('/api/vehicules', require('./routes/vehicule.routes'));
app.use('/api/rdv', require('./routes/rdv.routes'));
app.use('/api/plages', require('./routes/plage.routes'));
app.use('/api/testdrive', require('./routes/testdrive.routes'));
app.use('/api/ventes', require('./routes/vente.routes'));
app.use('/api/entretien', require('./routes/entretien.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/clients', require('./routes/client.routes'));

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

module.exports = app;
