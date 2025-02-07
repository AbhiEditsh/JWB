const Product = require("../model/productModel");
const Review = require("../model/reviewModel");

exports.ReviewCreate = async (req, res) => {
  try {
    const { comment, rating, userId, productId } = req.body;

    if (!comment || !rating || !userId || !productId) {
      return res.status(400).send({
        message: "Please fill in all fields",
      });
    }

    let review;
    const existingReview = await Review.findOne({ productId, userId });
    if (existingReview) {
      existingReview.comment = comment;
      existingReview.rating = rating;
      review = await existingReview.save();
    } else {
      const newReview = new Review({
        comment,
        rating,
        productId,
        userId,
      });
      review = await newReview.save();
    }

    const reviews = await Review.find({ productId });
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      const product = await Product.findById(productId);
      if (product) {
        product.rating = averageRating;
        await product.save({ validateBeforeSave: false });
      } else {
        return res.status(404).send({ message: "Product not found" });
      }
    }

    res.status(201).json({
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.ReviewShow = async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments({});
    res.status(200).json({
      message: "Total reviews",
      totalReviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.SingleReviews = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).send({
      message: "userId is required",
    });
  }
  try {
    const reviews = await Review.find({ userId }).sort({ createdAt: -1 });
    if (reviews.length === 0) {
      return res.status(404).send({ message: "No reviews found" });
    }
    res.status(200).send({
      message: "Reviews found",
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
