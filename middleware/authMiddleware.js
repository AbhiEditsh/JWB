const jwt = require('jsonwebtoken');
const User = require('../model/userModel');

exports.authenticateToken = async (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Bearer Token
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

exports.authorizeAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user && user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
