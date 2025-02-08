const express = require("express");
const {
  processRazorpayPayment,
  verifyPayment,
  handleRazorpayWebhook,
  cashOnDelivery,
} = require("../controllers/paymentController");

const UserPaymentRouter = express.Router();

UserPaymentRouter.post("/razorpay", processRazorpayPayment);
UserPaymentRouter.post("/razorpay/verify", verifyPayment);
UserPaymentRouter.post("/razorpay/webhook", handleRazorpayWebhook);
UserPaymentRouter.post("/cash-on-delivery", cashOnDelivery);

module.exports = UserPaymentRouter;
