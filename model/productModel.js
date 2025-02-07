const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    rating: { type: Number, default: 0 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    stock: { type: Number, default: 0 },
    ProductImage: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
