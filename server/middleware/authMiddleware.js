const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports.checkAuth = (req, res) => {
    const token = req.cookies.jwt;
    
    if (!token) {
      return res.status(401).json({ isAuthenticated: false });
    };
  
    try {
      const decodedToken = jwt.verify(token, 'kevin secret');
      res.status(200).json({ 
        isAuthenticated: true, 
        user: decodedToken.id 
      });
    } catch(err) {
      console.error('JWT verification error:', err.message);
      res.status(401).json({ 
        isAuthenticated: false,
        error: 'Invalid token' 
      });
    }
  };