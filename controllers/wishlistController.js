const Wishlist = require("../model/Wishlist");

// Add Product to Wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [productId] });
    } else {
      if (!wishlist.items.includes(productId)) {
        wishlist.items.push(productId);
      }
    }

    await wishlist.save();
    res.status(200).json({ message: "Product added to wishlist", wishlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove Product from Wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const { userId } = req.body;
    const { id } = req.params;

    const wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });

    wishlist.items = wishlist.items.filter(item => item.toString() !== id);
    await wishlist.save();

    res.status(200).json({ message: "Product removed from wishlist", wishlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get User Wishlist Details
exports.getWishlist = async (req, res) => {
  try {
    const { userId } = req.body;
    const wishlist = await Wishlist.findOne({ userId }).populate("items");

    if (!wishlist) return res.status(404).json({ message: "Wishlist is empty" });

    res.status(200).json({ wishlist });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
