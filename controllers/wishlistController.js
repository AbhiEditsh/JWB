  const Wishlist = require("../model/Wishlist");
  const mongoose = require("mongoose");


  //ADD TO WISHLIST
  exports.addToWishlist = async (req, res) => {
    try {
      const { userId, productId } = req.body;

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
//REMOVE FROM WISHLIST
  exports.removeFromWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        const wishlist = await Wishlist.findOne({ userId });
        if (!wishlist) {
            return res.status(404).json({ message: "Wishlist not found" });
        }
        const itemIndex = wishlist.items.findIndex(
            (item) => item.productId.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Product not found in wishlist" });
        }
        wishlist.items[itemIndex].liked = false;
        wishlist.items.splice(itemIndex, 1);

        if (wishlist.items.length === 0) {
            await Wishlist.deleteOne({ userId });
            return res.status(200).json({ message: "Wishlist is now empty and has been deleted" });
        }

        const totalItems = wishlist.items.reduce(
          (acc, item) => acc + (item.quantity || 1),
          0
        );
        await wishlist.save();
        

        return res.status(200).json({
            message: "Product removed from wishlist",
            wishlist,
            totalItems
        });
    } catch (error) {
        console.error(`Error removing from wishlist: ${error.message}`);
        return res.status(500).json({ error: error.message });
    }
};

//GET FROM WISHLIST
  exports.getWishlist = async (req, res) => {
    try {
      const { userId } = req.query;

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

      const totalItems = wishlist.items.reduce(
        (acc, item) => acc + (item.quantity || 1),
        0
      );

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
        },
        totalItems,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
