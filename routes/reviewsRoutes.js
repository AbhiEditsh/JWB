const express = require("express");
const reviewController = require("../controllers/reviewController");
const { authenticateToken } = require("../middleware/authMiddleware");

const ReviewRouter = express.Router();

ReviewRouter.post("/create", reviewController.ReviewCreate);
ReviewRouter.get("/product/:productId", reviewController.ReviewShowByProductId);
ReviewRouter.get(
  "/product/user/reviews",
  reviewController.getReviewsByUserAndProduct
);
ReviewRouter.get('/user',authenticateToken,reviewController.getReviewsByUser);

module.exports = ReviewRouter;
