// models/Booking.js — Mongoose schema matching the Angular Booking interface
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    // Custom booking ID like B001, B002 — stored as a string field
    bookingId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    propertyName: {
      type: String,
      required: [true, 'Property name is required'],
      trim: true,
    },
    adults: {
      type: Number,
      required: true,
      min: [1, 'At least 1 adult is required'],
    },
    children: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    checkInDate: {
      type: String,  // Stored as YYYY-MM-DD string to match Angular frontend
      required: true,
    },
    checkOutDate: {
      type: String,  // Stored as YYYY-MM-DD string to match Angular frontend
      required: true,
    },
    checkInTime: {
      type: String,  // e.g. "11:30 AM"
      default: '',
    },
    totalPayment: {
      type: Number,
      required: true,
      min: 0,
    },
    advanceAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    balancePayment: {
      type: Number,
      // Auto-calculated: totalPayment - advanceAmount
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
  }
);

// Auto-calculate balancePayment before every save
bookingSchema.pre('save', function (next) {
  this.balancePayment = this.totalPayment - this.advanceAmount;
  next();
});

// Also recalculate on update operations
bookingSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.totalPayment !== undefined || update.advanceAmount !== undefined) {
    const total = update.totalPayment ?? 0;
    const advance = update.advanceAmount ?? 0;
    update.balancePayment = total - advance;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
