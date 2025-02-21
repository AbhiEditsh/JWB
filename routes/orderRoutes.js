const express = require("express");
const { createOrder, getUserOrders, getOrderById, getOrdersByUserId } = require("../controllers/orderController");
const { authenticateToken, UserAuthenticateToken } = require("../middleware/authMiddleware");

const OrderRouter = express.Router();

OrderRouter.post("/create", authenticateToken, createOrder);
OrderRouter.get("/user-order", UserAuthenticateToken, getUserOrders);
OrderRouter.get("/:id", authenticateToken, getOrderById);
OrderRouter.get("/:userId", authenticateToken, getOrdersByUserId);


module.exports = OrderRouter;
