const express = require("express");
const cartController = require("../controllers/cartController");
const CartRouter = express.Router();

CartRouter.post("/add", cartController.addToCart);
CartRouter.delete("/remove/:id", cartController.removeFromCart);
CartRouter.get("/", cartController.getCart);

module.exports = CartRouter;
