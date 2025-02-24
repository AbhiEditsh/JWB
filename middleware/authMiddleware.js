const jwt = require("jsonwebtoken");
const User = require("../model/userModel");

//ADMIN MIDDLEWARE
exports.authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided", success: false });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Token expired or invalid", success: false });
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: "User not found", success: false });
      }

      req.user = { userId: user._id };
      next();
    });
  } catch (error) {
    console.error("Error in authenticateToken middleware:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};
//ADMIN AUTHORIZATION
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


  //USER MIDDLEWARE
exports.UserAuthenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token provided", success: false });
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: "Token expired or invalid", success: false });
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: "User not found", success: false });
      }

      req.user = { _id: user._id, ...user._doc };

      
      next();
    });
  } catch (error) {
    console.error("Error in authenticateToken middleware:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};
