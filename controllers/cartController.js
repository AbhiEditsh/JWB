const Cart = require("../model/Cart");

// ADD TO CART
exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [{ productId, quantity }] });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity = quantity; 
      } else {
        cart.items.push({ productId, quantity });
      }
    }

    await cart.save();
    res.status(200).json({ message: "Cart updated successfully", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
           
// REMOVE A PRODUCT CART
exports.removeFromCart = async (req, res) => {
  try {
    const { userId } = req.body;
    const { id } = req.params;

    let cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter((item) => item.productId.toString() !== id);
    await cart.save();

    res.status(200).json({ message: "Product removed from cart", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET CART
exports.getCart = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) { 
      return res.status(404).json({ message: "Cart is empty", totalItems: 0 });
    }

    const totalItems = cart.items.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cart.items.reduce(
      (acc, item) => acc + item.productId.price * item.quantity,
      0
    );

    res.status(200).json({ cart, totalItems, totalPrice });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//CLEAR CART 
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(userId);
    

    const updatedCart = await Cart.findOneAndUpdate(
      { userId },
      { items: [], totalPrice: 0 },
      { new: true } 
    );

    if (!updatedCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({ message: "Cart cleared successfully", cart: updatedCart });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear cart", error });
  }
};
