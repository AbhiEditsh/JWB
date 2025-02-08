const Razorpay = require("razorpay");
const crypto = require("crypto");
const dotenv = require("dotenv");
const Order = require("../model/orderModel"); 

dotenv.config();
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).json({ message: "Payment processing failed", error: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id,  orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id  || !orderId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    order.paymentStatus = "Paid";
    order.paymentMethod = "Razorpay";
    order.paymentDate = new Date();
    order.status = "Processing";
    await order.save();

    res.status(200).json({ success: true, message: "Payment verified", order });
  } catch (error) {
    console.error("Payment verification failed:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
const cashOnDelivery = async (req, res) => {
  try {
    const { userId, amount, address } = req.body;

    if (!userId || !amount || !address) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    res.status(200).json({ success: true, message: "Order placed successfully via COD" });
  } catch (error) {
    console.error("COD Error:", error);
    res.status(500).json({ message: "COD processing failed", error: error.message });
  }
};
const handleRazorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET; // Use secret from env

    const signature = req.headers["x-razorpay-signature"];
    const body = JSON.stringify(req.body);

    // Generate expected signature
    const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");

    // Validate signature
    if (expectedSignature !== signature) {
      return res.status(400).json({ success: false, message: "Invalid webhook signature" });
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
    res.status(500).json({ success: false, message: "Webhook processing failed", error: error.message });
  }
};
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
