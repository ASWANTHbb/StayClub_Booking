// routes/bookings.js — REST API routes for bookings
const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// ──────────────────────────────────────────────
// GET /api/bookings
// Returns all bookings, sorted by checkInDate descending
// ──────────────────────────────────────────────
router.get('/', bookingController.getAllBookings);

// ──────────────────────────────────────────────
// GET /api/bookings/:id
// Returns a single booking by bookingId (e.g. B001)
// ──────────────────────────────────────────────
router.get('/:id', bookingController.getBookingById);

// ──────────────────────────────────────────────
// POST /api/bookings
// Creates a new booking
// Body: { customerName, propertyName, adults, children,
//         checkInDate, checkOutDate, checkInTime,
//         totalPayment, advanceAmount }
// ──────────────────────────────────────────────
router.post('/', bookingController.createBooking);

// ──────────────────────────────────────────────
// PUT /api/bookings/:id
// Updates an existing booking by bookingId
// ──────────────────────────────────────────────
router.put('/:id', bookingController.updateBooking);

// ──────────────────────────────────────────────
// DELETE /api/bookings/:id
// Deletes a booking by bookingId
// ──────────────────────────────────────────────
router.delete('/:id', bookingController.deleteBooking);

module.exports = router;
