const Product = require("../model/productModel");
const Reviews = require("../model/reviewModel");
const { cloudinary } = require("../config/cloudinary");
const fs = require("fs");

exports.createProduct = async (req, res) => {
  const { name, category, description, price, oldPrice, rating, author, stock } =
    req.body;
  try {
    let productPictureUrl = "";
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "product_profiles",
      });
      productPictureUrl = uploadResult.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const newProduct = new Product({
      ProductImage: productPictureUrl,
      name,
      category,
      description,
      price,
      oldPrice,
      rating,
      author,
      stock,
    });

    const savedProduct = await newProduct.save();

    const reviews = await Reviews.find({ productId: savedProduct._id });
    if (reviews.length > 0) {
      const totalRating = reviews.reduce(
        (acc, review) => acc + review.rating,
        0
      );
      const averageRating = totalRating / reviews.length;
      savedProduct.rating = averageRating;
      await savedProduct.save();
    }

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, page = 1, limit = 10 } = req.body;
    let filter = {};

    if (category && category !== "all") {
      filter.category = category;
    }
    if (minPrice && maxPrice) {
      const min = parseFloat(minPrice);
      const max = parseFloat(maxPrice);
      if (!isNaN(min) && !isNaN(max)) {
        filter.price = { $gte: min, $lte: max };
      }
    }

    // Calculate pagination values
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalProducts = await Product.countDocuments(filter);
    const totalPage = Math.ceil(totalProducts / parseInt(limit));

    const products = await Product.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("author", "email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      products,
      totalPage,
      totalProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId).populate(
      "author",
      "email"
    );
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const reviews = await Reviews.find({ productId }).populate(
      "userId",
      "email"
    );
    res.status(200).json({ product, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.UpdateProductId = async (req, res) => {
  try {
    const productId = req.params.id;

    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "product_profiles",
      });
      const productPictureUrl = uploadResult.secure_url;

      if (existingProduct.ProductImage) {
        const oldImagePublicId = existingProduct.ProductImage.split("/")
          .pop()
          .split(".")[0];
        await cloudinary.uploader.destroy(
          `product_profiles/${oldImagePublicId}`
        );
      }
      req.body.ProductImage = productPictureUrl;
      fs.unlinkSync(req.file.path);
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { ...req.body },
      { new: true }
    );

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProductId = async (req, res) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return res.json(400).send({
        message: "Product not found...!",
      });
    }
    if (deletedProduct.ProductImage) {
      const oldImagePublicId = deletedProduct.ProductImage.split("/")
        .pop()
        .split(".")[0];
      await cloudinary.uploader.destroy(`product_profiles/${oldImagePublicId}`);
    }

    await Reviews.deleteMany({
      ProductId: productId,
    });
    res.status(200).json({
      message: "Product Deleted Successfully....!",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reletedProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      return res.status(400).json({ message: "Product id is required...!" });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found...!" });
    }

    const titleRegex = new RegExp(
      product.name
        .split(" ")
        .filter((word) => word.length > 1)
        .join("|"),
      "i"
    );
    const relatedProducts = await Product.find({
      _id: {
        $ne: productId,
      },
      $or: [{ name: titleRegex }, { category: product.category }],
    });

    res.status(200).json(relatedProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getProductsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    let filter = {};
    if (category.toLowerCase() !== "all") {
      filter.category = category;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      category,
      products,
      totalProducts: products.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};