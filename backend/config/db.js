// Connects the app to MongoDB using Mongoose.

const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusloop';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
}

module.exports = connectDB;
