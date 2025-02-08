const express = require("express");
const { createOrder, getUserOrders, getOrderById } = require("../controllers/orderController");
const { authenticateToken } = require("../middleware/authMiddleware");

const OrderRouter = express.Router();

OrderRouter.post("/create", authenticateToken, createOrder);
OrderRouter.get("/user", authenticateToken, getUserOrders);
OrderRouter.get("/:id", authenticateToken, getOrderById);


module.exports = OrderRouter;
