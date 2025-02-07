const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
