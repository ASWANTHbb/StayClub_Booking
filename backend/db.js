// db.js — MongoDB Atlas connection using Mongoose
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log("Mongo URI:", process.env.MONGODB_URI);
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Atlas connected: ${conn.connection.host}`);
  } catch (error) {
   console.error(error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
