const {mongoose } = require("mongoose");
const Wishlist = require("../model/Wishlist");

exports.addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [{ productId }] });
    } else {
      const itemExists = wishlist.items.some(
        (item) => item.productId.toString() === productId
      );

      if (!itemExists) {
        wishlist.items.push({ productId });
      }
    }

    await wishlist.save();

    res.status(200).json({
      message: "Product added to wishlist",
      wishlist: {
        id: wishlist._id,
        userId: wishlist.userId,
        items: wishlist.items.map((item) => ({
          productId: item.productId.toString(),
        })),
        totalItems: wishlist.items.length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid userId or productId" });
    }

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await wishlist.save();

    res.status(200).json({
      message: "Product removed from wishlist",
      wishlist: {
        id: wishlist._id,
        userId: wishlist.userId,
        items: wishlist.items.map((item) => ({
          productId: item.productId.toString(),
        })),
        totalItems: wishlist.items.length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getWishlist = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const wishlist = await Wishlist.findOne({ userId }).populate("items.productId", "name price ProductImage",);

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist is empty", totalItems: 0 });
    }

    res.status(200).json({
      message: "Wishlist retrieved successfully",
      wishlist: {
        id: wishlist._id,
        userId: wishlist.userId,
        items: wishlist.items.map((item) => ({
          productId: item.productId._id,
          ProductImage: item.productId.ProductImage,
          name: item.productId.name,
          price: item.productId.price,
        })),
        totalItems: wishlist.items.length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

