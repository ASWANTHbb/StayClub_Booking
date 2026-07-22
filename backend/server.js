// server.js — Express app entry point
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./db');
const bookingRoutes = require('./routes/bookings');
const expenseRoutes = require('./routes/expenses');

const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────────────────────
// Connect to MongoDB Atlas
// ─────────────────────────────────────────────────────────────
connectDB();

// ─────────────────────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────────────────────

// Allow Angular dev server (localhost:4200) to call this API
app.use(cors({
  origin: [
    'http://localhost:4200',
    'http://localhost:4201',
    'https://stayclub-booking-1.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse incoming JSON request bodies
app.use(express.json());

// ─────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────
app.use('/api/bookings', bookingRoutes);
app.use('/api/expenses', expenseRoutes);

// Health check endpoint — useful to confirm the server is alive
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'D2V Booking API is running',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// ─────────────────────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 D2V Booking API running at http://localhost:${PORT}`);
  console.log(`📋 Bookings endpoint: http://localhost:${PORT}/api/bookings`);
  console.log(`❤️  Health check:     http://localhost:${PORT}/api/health\n`);
});
