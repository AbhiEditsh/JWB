const express = require("express");
const cartController = require("../controllers/cartController");
const { UserAuthenticateToken } = require("../middleware/authMiddleware");
const CartRouter = express.Router();

CartRouter.post("/add", cartController.addToCart);
CartRouter.delete("/remove/:id", cartController.removeFromCart);
CartRouter.get("/", cartController.getCart);
CartRouter.delete("/clear", UserAuthenticateToken,cartController.clearCart);
module.exports = CartRouter;
