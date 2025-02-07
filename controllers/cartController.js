const Cart = require("../model/Cart");

// Add Product to Cart
exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [{ productId, quantity }] });
    } else {
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }                           
    }

    await cart.save();
    res.status(200).json({ message: "Product added to cart", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove Product from Cart
exports.removeFromCart = async (req, res) => {
  try {
    const { userId } = req.body;
    const { id } = req.params;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(item => item.productId.toString() !== id);
    await cart.save();

    res.status(200).json({ message: "Product removed from cart", cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get User Cart Details
exports.getCart = async (req, res) => {
  try {
    const { userId } = req.body;
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) return res.status(404).json({ message: "Cart is empty" });

    res.status(200).json({ cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
