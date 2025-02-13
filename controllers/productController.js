const Product = require("../model/productModel");
const Reviews = require("../model/reviewModel");
const { cloudinary } = require("../config/cloudinary");
const fs = require("fs");
const Category = require("../model/CategoryModel");

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      Available,
      description,
      price,
      oldPrice,
      rating,
      author,
      gender,
      sku,
    } = req.body;

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
      Available,
      description,
      price,
      oldPrice,
      rating,
      author,
      gender,
      sku,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// **Get All Products (User)**
exports.getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, page = 1, limit = 10 } = req.query;
    let filter = {};

    if (category && category !== "all") {
      filter.category = category;
    }
    if (minPrice && maxPrice) {
      filter.price = { $gte: parseFloat(minPrice), $lte: parseFloat(maxPrice) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalProducts = await Product.countDocuments(filter);
    const totalPage = Math.ceil(totalProducts / parseInt(limit));

    const products = await Product.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .populate("author", "email")
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ products, totalPage, totalProducts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// **Get Product By ID (User)**
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("author", "email")
      .populate("category", "name");
    if (!product) return res.status(404).json({ message: "Product not found" });

    const reviews = await Reviews.find({ productId: product._id }).populate(
      "userId",
      "email"
    );
    res.status(200).json({ product, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// **Update Product (Admin)**
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const existingProduct = await Product.findById(productId);
    if (!existingProduct)
      return res.status(404).json({ message: "Product not found" });

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "product_profiles",
      });
      req.body.ProductImage = uploadResult.secure_url;
      fs.unlinkSync(req.file.path);

      if (existingProduct.ProductImage) {
        const oldImagePublicId = existingProduct.ProductImage.split("/")
          .pop()
          .split(".")[0];
        await cloudinary.uploader.destroy(
          `product_profiles/${oldImagePublicId}`
        );
      }
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

// **Delete Product (Admin)**
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct)
      return res.status(404).json({ message: "Product not found" });

    if (deletedProduct.ProductImage) {
      const oldImagePublicId = deletedProduct.ProductImage.split("/")
        .pop()
        .split(".")[0];
      await cloudinary.uploader.destroy(`product_profiles/${oldImagePublicId}`);
    }

    await Reviews.deleteMany({ productId });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// **Get Related Products (User)**
exports.getRelatedProducts = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const titleRegex = new RegExp(
      product.name
        .split(" ")
        .filter((word) => word.length > 1)
        .join("|"),
      "i"
    );
    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      $or: [{ name: titleRegex }, { category: product.category }],
    });

    res.status(200).json(relatedProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// **Get Products By Category (User)**
exports.getProductsByCategory = async (req, res) => {
  try {
    const category = req.params.category;
    if (!category) {
      return res.status(400).json({ message: "Category is required" });
    }

    // Find category object first
    const categoryObject = await Category.findOne({ name: category });
    if (!categoryObject && category.toLowerCase() !== "all") {
      return res.status(404).json({ message: "Category not found" });
    }

    const filter = category.toLowerCase() !== "all" ? { category: categoryObject._id } : {};

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .populate("author", "email")
      .populate("category", "name");

    res.status(200).json({ category, products, totalProducts: products.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
