// models/Expense.js — Mongoose schema for Property Expenses
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    propertyName: {
      type: String,
      required: [true, 'Property name is required'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: [true, 'Date is required'],
      default: () => new Date().toISOString().split('T')[0],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model('Expense', expenseSchema);
