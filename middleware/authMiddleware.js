const jwt = require("jsonwebtoken");
const User = require("../model/userModel"); // Ensure the correct path

exports.authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.id) {
      return res.status(401).json({ message: "Invalid token. No user ID found." });
    }
    const user = await User.findById(decoded.id).select("-password");
    req.user = user; 
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

exports.authorizeAdmin = async (req, res, next) => {
  try {
    if (req.user.role === "admin") {
      next();
    } else {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }
  } catch (error) {
    console.error("Authorization error:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
