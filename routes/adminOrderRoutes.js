const express = require("express");
const {
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
} = require("../controllers/orderController");
const AdminOrderRouter = express.Router();

// Get all orders
AdminOrderRouter.get("/orders", getAllOrders);

// Get order details by ID
AdminOrderRouter.get("/orders/:id", getOrderDetails);

// Update order status
AdminOrderRouter.put("/orders/status/:id", updateOrderStatus);

module.exports = AdminOrderRouter;
