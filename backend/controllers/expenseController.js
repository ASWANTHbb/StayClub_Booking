// controllers/expenseController.js — Business logic for property expenses
const Expense = require('../models/Expense');

// ──────────────────────────────────────────────
// GET all expenses for a specific property
// ──────────────────────────────────────────────
exports.getExpensesByProperty = async (req, res) => {
  try {
    const { propertyName } = req.params;
    const expenses = await Expense.find({
      propertyName: { $regex: new RegExp(`^${propertyName}$`, 'i') }
    }).sort({ date: -1, createdAt: -1 });
    
    res.json(expenses.map(mapToFrontend));
  } catch (err) {
    console.error('GET /api/expenses/property/:propertyName error:', err.message);
    res.status(500).json({ message: 'Server error fetching expenses' });
  }
};

// ──────────────────────────────────────────────
// POST create new expense
// ──────────────────────────────────────────────
exports.createExpense = async (req, res) => {
  try {
    const newExpense = new Expense({
      propertyName: req.body.propertyName,
      amount:       req.body.amount,
      description:  req.body.description,
      date:         req.body.date,
    });

    const saved = await newExpense.save();
    res.status(201).json(mapToFrontend(saved));
  } catch (err) {
    console.error('POST /api/expenses error:', err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error creating expense' });
  }
};

// ──────────────────────────────────────────────
// PUT update expense
// ──────────────────────────────────────────────
exports.updateExpense = async (req, res) => {
  try {
    const updateData = {
      amount:      req.body.amount,
      description: req.body.description,
      date:        req.body.date,
    };

    const updated = await Expense.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: `Expense ${req.params.id} not found` });
    }

    res.json(mapToFrontend(updated));
  } catch (err) {
    console.error(`PUT /api/expenses/${req.params.id} error:`, err.message);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error updating expense' });
  }
};

// ──────────────────────────────────────────────
// DELETE expense
// ──────────────────────────────────────────────
exports.deleteExpense = async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: `Expense ${req.params.id} not found` });
    }
    res.json({ message: `Expense ${req.params.id} deleted successfully` });
  } catch (err) {
    console.error(`DELETE /api/expenses/${req.params.id} error:`, err.message);
    res.status(500).json({ message: 'Server error deleting expense' });
  }
};

// ──────────────────────────────────────────────
// Helper: map MongoDB document → Angular Expense shape
// ──────────────────────────────────────────────
function mapToFrontend(doc) {
  return {
    id:           doc._id,
    propertyName: doc.propertyName,
    amount:       doc.amount,
    description:  doc.description,
    date:         doc.date,
  };
}
