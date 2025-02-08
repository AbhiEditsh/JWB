const express = require("express");
const wishlistController = require("../controllers/wishlistController");
const WishListRouter = express.Router();

WishListRouter.post("/add", wishlistController.addToWishlist);
WishListRouter.delete("/remove/:id", wishlistController.removeFromWishlist);
WishListRouter.get("/", wishlistController.getWishlist);

module.exports = WishListRouter;
 