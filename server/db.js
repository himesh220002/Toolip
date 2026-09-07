const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.warn('⚠️ MONGODB_URI is missing in environment variables!');
      return false;
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`🍃 MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (err) {
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
    return false;
  }
};

module.exports = connectDB;
