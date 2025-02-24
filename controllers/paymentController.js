const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../model/orderModel");
require("dotenv").config();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});
//use api
//USER PAYMENT PROCESS
const processRazorpayPayment = async (req, res) => {
  try {
    const { amount, currency = "INR" } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    const options = {
      amount: amount * 100,
      currency,
      receipt: `order_rcptid_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Razorpay Error:", error);
    res
      .status(500)
      .json({ message: "Payment processing failed", error: error.message });
  }
};
//USER PAYMENT VERIFY
const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature === razorpay_signature) {
      order.paymentStatus = "Paid";
      order.status = "Processing";
      await order.save();

      res
        .status(200)
        .json({ success: true, message: "Payment verified successfully" });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }
  } catch (error) {
    console.error("Payment verification failed:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
//USER PAYMENT CASH ON DELIVERY
const cashOnDelivery = async (req, res) => {
  try {
    const { userId, amount, address } = req.body;

    if (!userId || !amount || !address) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    res
      .status(200)
      .json({ success: true, message: "Order placed successfully via COD" });
  } catch (error) {
    console.error("COD Error:", error);
    res
      .status(500)
      .json({ message: "COD processing failed", error: error.message });
  }
};
//WEB HOOK API
const handleRazorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET; // Use secret from env

    const signature = req.headers["x-razorpay-signature"];
    const body = JSON.stringify(req.body);

    // Generate expected signature
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    // Validate signature
    if (expectedSignature !== signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid webhook signature" });
    }

    const event = req.body.event;
    const paymentId = req.body.payload.payment.entity.id;

    if (event === "payment.captured") {
      const orderId = req.body.payload.payment.entity.order_id;

      const order = await Order.findOne({ orderId });
      if (order) {
        order.paymentStatus = "Paid";
        order.status = "Processing";
        order.paymentDate = new Date();
        await order.save();
      }
    }

    res.status(200).json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.error("Webhook Error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Webhook processing failed",
        error: error.message,
      });
  }
};
//admin api
//GET ALL PAYMENT ADMIN
const getAllPayments = async (req, res) => {
  try {
    const payments = await Order.find().sort({ createdAt: -1 });

    if (!payments.length) {
      return res.status(404).json({ message: "No payments found" });
    }

    res.status(200).json({ success: true, payments });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
//GET PAYMENT BY ID ADMIN
const getPaymentById = async (req, res) => {
  try {
    const payment = await Order.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json({ success: true, payment });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  processRazorpayPayment,
  verifyPayment,
  cashOnDelivery,
  handleRazorpayWebhook,
  getAllPayments,
  getPaymentById,
};
