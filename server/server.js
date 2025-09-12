const express = require('express')
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes')
const { connectDB } = require('./config/db.js');
const cookieParser = require('cookie-parser');
const cors = require('cors');

app.use(express.json())
app.use(cookieParser());
const corsOptions = {
  origin: ['http://localhost:5174', 'http://localhost:5173'], 
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

connectDB();
  app.listen(3000, () => {
    console.log('Server running on port 3000')
  })

app.use(authRoutes);
app.get('/check-auth', checkAuth, (req, res) => {
    res.status(200).json({ isAuthenticated: true });
});