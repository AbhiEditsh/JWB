const express = require('express');
const UserRouter = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { getDashboardStats } = require('../controllers/dashboardController');

// Public Routes
UserRouter.get("/dashboard", getDashboardStats);
UserRouter.post('/register', userController.registerUser);
UserRouter.post('/login', userController.loginUser);
UserRouter.post('/refresh-token', userController.refreshToken);
UserRouter.post("/forgot-password", userController.forgotPassword);
UserRouter.post("/reset-password", userController.resetPassword);
// Protected Routes (User Access)
UserRouter.get('/profile', authMiddleware.authenticateToken, userController.getUserProfile);
UserRouter.put('/:id', authMiddleware.authenticateToken, userController.updateRole);
UserRouter.put("/update", authMiddleware.authenticateToken, upload.single("profilePicture"), userController.updateUser);
UserRouter.delete('/delete/:id', authMiddleware.authenticateToken, userController.deleteUser);
UserRouter.post('/logout', authMiddleware.authenticateToken, userController.logoutUser);

// Admin Routes (Restricted Access)
UserRouter.get('/all-users', authMiddleware.authenticateToken, authMiddleware.authorizeAdmin, userController.getAllUsers);

module.exports = UserRouter;
