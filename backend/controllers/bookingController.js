// controllers/bookingController.js

const Booking = require('../models/Booking');

// ===============================
// GET ALL BOOKINGS
// ===============================
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings.map(mapToFrontend));
  } catch (err) {
    console.error("GET /api/bookings error:", err);
    res.status(500).json({ message: "Server error fetching bookings" });
  }
};

// ===============================
// GET BOOKING BY ID
// ===============================
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      bookingId: req.params.id,
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.json(mapToFrontend(booking));
  } catch (err) {
    console.error("GET Booking error:", err);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ===============================
// CREATE BOOKING
// ===============================
exports.createBooking = async (req, res) => {
  try {

    // Find booking having highest bookingId
    const lastBooking = await Booking.findOne().sort({ bookingId: -1 });

    let bookingId = "B001";

    if (lastBooking && lastBooking.bookingId) {
      const lastNumber = parseInt(lastBooking.bookingId.replace("B", ""), 10);

      bookingId =
        "B" + String(lastNumber + 1).padStart(3, "0");
    }

    if (req.body.checkInDate && req.body.checkOutDate) {
      if (new Date(req.body.checkOutDate) <= new Date(req.body.checkInDate)) {
        return res.status(400).json({
          message: "Check-out date must be greater than check-in date"
        });
      }
    }

    const booking = new Booking({
      bookingId,

      customerName: req.body.customerName,

      propertyName: req.body.propertyName,

      adults: req.body.adults,

      children: req.body.children || 0,

      checkInDate: req.body.checkInDate,

      checkOutDate: req.body.checkOutDate,

      checkInTime: req.body.checkInTime || "",

      totalPayment: req.body.totalPayment,

      advanceAmount: req.body.advanceAmount,
    });

    const savedBooking = await booking.save();

    res.status(201).json(mapToFrontend(savedBooking));

  } catch (err) {

    console.error("POST /api/bookings error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Duplicate Booking ID. Please try again."
      });
    }

    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: err.message,
      });
    }

    res.status(500).json({
      message: "Server error creating booking",
    });
  }
};

// ===============================
// UPDATE BOOKING
// ===============================
exports.updateBooking = async (req, res) => {
  try {

    if (req.body.checkInDate && req.body.checkOutDate) {
      if (new Date(req.body.checkOutDate) <= new Date(req.body.checkInDate)) {
        return res.status(400).json({
          message: "Check-out date must be greater than check-in date"
        });
      }
    }

    const updatedBooking = await Booking.findOneAndUpdate(

      {
        bookingId: req.params.id,
      },

      {
        customerName: req.body.customerName,

        propertyName: req.body.propertyName,

        adults: req.body.adults,

        children: req.body.children || 0,

        checkInDate: req.body.checkInDate,

        checkOutDate: req.body.checkOutDate,

        checkInTime: req.body.checkInTime || "",

        totalPayment: req.body.totalPayment,

        advanceAmount: req.body.advanceAmount,
      },

      {
        new: true,
        runValidators: true,
      }

    );

    if (!updatedBooking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.json(mapToFrontend(updatedBooking));

  } catch (err) {

    console.error("PUT Booking error:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: err.message,
      });
    }

    res.status(500).json({
      message: "Server error updating booking",
    });
  }
};

// ===============================
// DELETE BOOKING
// ===============================
exports.deleteBooking = async (req, res) => {
  try {

    const deleted = await Booking.findOneAndDelete({
      bookingId: req.params.id,
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.json({
      message: "Booking deleted successfully",
    });

  } catch (err) {

    console.error("DELETE Booking error:", err);

    res.status(500).json({
      message: "Server error deleting booking",
    });
  }
};

// ===============================
// MAP DATA TO ANGULAR
// ===============================
function mapToFrontend(doc) {

  return {

    id: doc.bookingId,

    customerName: doc.customerName,

    propertyName: doc.propertyName,

    adults: doc.adults,

    children: doc.children,

    checkInDate: doc.checkInDate,

    checkOutDate: doc.checkOutDate,

    checkInTime: doc.checkInTime,

    totalPayment: doc.totalPayment,

    advanceAmount: doc.advanceAmount,

    balancePayment: doc.balancePayment,

  };

}