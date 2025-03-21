const express = require("express");
const {
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
} = require("../controllers/orderController");
const AdminOrderRouter = express.Router();

AdminOrderRouter.get("/orders", getAllOrders);
AdminOrderRouter.get("/orders/:id", getOrderDetails);
AdminOrderRouter.put("/orders/status/:id", updateOrderStatus);

module.exports = AdminOrderRouter;
