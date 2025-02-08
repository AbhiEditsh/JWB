const express = require("express");
const { getAllPayments, getPaymentById } = require("../controllers/paymentController");
const { authorizeAdmin, authenticateToken } = require("../middleware/authMiddleware");

const AdminPaymentRouter = express.Router();

AdminPaymentRouter.get("/payments", authenticateToken, authorizeAdmin, getAllPayments);
AdminPaymentRouter.get("/payments/:id", authenticateToken, authorizeAdmin, getPaymentById);

module.exports = AdminPaymentRouter;
