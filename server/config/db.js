const mongoose = require('mongoose');
const express = require('express')

const app = express();
const dbURI = 'mongodb+srv://murithikevin54:q5YThho4Pv6piIcn@cluster0.9dqph.mongodb.net/';

async function connectDB() {
  try{
    await mongoose.connect(dbURI);
    console.log('MongoDB Connected Successfully');
  }
  catch (err) {
    console.error('Database connection failed', err);
    process.exit(1);
  }}

module.exports = { connectDB };