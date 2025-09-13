// Config file for MongoDB connection using Mongoose
const mongoose = require('mongoose');
require('dotenv').config();

const dbURI = process.env.MONGODB_URI


const connectDB = async () => {
  if (!dbURI) {
    throw new Error('MONGODB_URI is not defined')
  }

  try {
    await mongoose.connect(dbURI)
    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection error:', err)
  }
}

module.exports = connectDB;