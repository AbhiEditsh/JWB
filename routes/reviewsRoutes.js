const express = require("express");
const reviewController = require("../controllers/reviewController");

const ReviewRouter = express.Router();

ReviewRouter.post("/create", reviewController.ReviewCreate);
ReviewRouter.get("/show", reviewController.ReviewShow);
ReviewRouter.get("/user", reviewController.getReviewsByUserAndProduct);

module.exports = ReviewRouter;
