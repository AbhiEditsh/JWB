const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");

router.post("/add", wishlistController.addToWishlist);
router.delete("/remove/:id", wishlistController.removeFromWishlist);
router.get("/", wishlistController.getWishlist);

module.exports = router;
