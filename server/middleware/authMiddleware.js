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
        user: decodedToken.id,
        role: decodedToken.role || 'farmer'
      });
    } catch(err) {
      console.error('JWT verification error:', err.message);
      res.status(401).json({ 
        isAuthenticated: false,
        error: 'Invalid token' 
      });
    }
  };

module.exports.requireRole = (roles = []) => {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, 'kevin secret');
      if (allowed.length && !allowed.includes(decoded.role)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      req.user = { id: decoded.id, role: decoded.role };
      next();
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}