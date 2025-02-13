const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    Available: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    gender: { type: String, required: true },
    oldPrice: { type: Number },
    rating: { type: Number, default: 0 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sku: { type: String, required: true },
    ProductImage: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
