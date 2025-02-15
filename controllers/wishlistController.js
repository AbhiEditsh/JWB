const Wishlist = require("../model/Wishlist");
const mongoose = require("mongoose");

// ✅ Add to Wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    // Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return res.status(400).json({ error: "Invalid userId or productId" });
    }

    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [{ productId, liked: true }] });
    } else {
      const existingItem = wishlist.items.find(
        (item) => item.productId.toString() === productId
      );

      if (existingItem) {
        existingItem.liked = true;
      } else {
        wishlist.items.push({ productId, liked: true });
      }
    }

    await wishlist.save();

    res.status(200).json({
      message: "Product added to wishlist",
      wishlist,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    console.log(productId, userId);

    const wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      console.log(`Wishlist not found for userId: ${userId}`);
      return res.status(404).json({ message: "Wishlist not found" });
    }

    const itemIndex = wishlist.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not found in wishlist" });
    }

    wishlist.items.splice(itemIndex, 1);

    if (wishlist.items.length === 0) {
      await wishlist.deleteOne();
      return res.status(200).json({ message: "Wishlist is now empty and has been deleted" });
    }

    await wishlist.save();

    console.log(`Wishlist after removing item: ${wishlist}`);

    return res.status(200).json({
      message: "Product removed from wishlist",
      wishlist,
    });
  } catch (error) {
    console.error(`Error removing from wishlist: ${error.message}`);
    return res.status(500).json({ error: error.message });
  }
};



exports.getWishlist = async (req, res) => {
  try {
    const { userId } = req.query;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const wishlist = await Wishlist.findOne({ userId }).populate(
      "items.productId",
      "name price oldPrice ProductImage Available"
    );

    if (!wishlist || wishlist.items.length === 0) {
      return res
        .status(404)
        .json({ message: "Wishlist is empty", totalItems: 0 });
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
          oldPrice: item.productId.oldPrice,
          Available: item.productId.Available,
          liked: item.liked,
        })),
        totalItems: wishlist.items.length,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
