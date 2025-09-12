const mongoose = require('mongoose');
const express = require('express')

require('dotenv').config();
const app = express();
const MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {
  try{
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected Successfully');
  }
  catch (err) {
    console.error('Database connection failed', err);
    process.exit(1);
  }}

module.exports = { connectDB };