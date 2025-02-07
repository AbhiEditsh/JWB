const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
      }
    ],
    amount: { type: Number, required: true },
    address: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"], default: "Pending" },
    paymentMethod: { type: String, enum: ["COD", "Razorpay"], required: true },
    paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
    paymentDate: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
