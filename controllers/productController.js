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
      ProductImage,
    } = req.body;

    const categoryDoc = await Category.findOne({ name: category });
    if (!categoryDoc) {
      return res.status(400).json({ message: "Invalid category name" });
    }

    const newProduct = new Product({
      ProductImage,
      name,
      category: categoryDoc._id,
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
    res.status(201).json({
      message: "Product created successfully",
      savedProduct,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};

    if (category && category !== "all") {
      const categoryDoc = await Category.findOne({ name: category });
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      }
    }

    const products = await Product.find(filter)
      .populate("author", "email")
      .populate("category", "name _id")
      .sort({ createdAt: -1 });

    res.status(200).json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate({ path: "author", select: "email" }) 
      .populate({ path: "category", select: "name" }) 

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const reviews = await Reviews.find({ productId: product._id })
      .populate({ path: "userId", select: "email" });

    res.status(200).json({ product, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// UPDATE PRODUCT-ADMIN

exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    let updateData = { ...req.body };

    if (req.body.category) {
      const categoryDoc = await Category.findOne({ name: req.body.category });
      if (!categoryDoc) {
        return res.status(400).json({ message: "Invalid category name" });
      }
      updateData.category = categoryDoc._id;
    }

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "product_profiles",
      });
      fs.unlinkSync(req.file.path);

      if (existingProduct.ProductImage) {
        const oldImagePublicId = existingProduct.ProductImage.split("/")
          .pop()
          .split(".")[0];
        await cloudinary.uploader.destroy(`product_profiles/${oldImagePublicId}`);
      }
      updateData.ProductImage = uploadResult.secure_url;
    }

    const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true });

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// DELETE PRODUCT-ADMIN
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

// GET RELETED PRODUCT-USER
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

// GET PRODUCT BY CATEGORY-USER
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

    const filter =
      category.toLowerCase() !== "all" ? { category: categoryObject._id } : {};

    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .populate("author", "email")
      .populate("category", "name");

    res
      .status(200)
      .json({ category, products, totalProducts: products.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//GET PRODUCT SEARCH-USER
exports.searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Query parameter is required and cannot be empty.",
      });
    }

    const products = await Product.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    })
      .populate("category")
      .exec();

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No products found matching the search criteria.",
      });
    }

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error in searchProducts:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// DELETE PRODUCTS
exports.deleteProduct = async (req, res) => {
  console.log(req.params.id);
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.ProductImage) {
      const publicId = product.ProductImage.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`product_profiles/${publicId}`);
    }
    await product.deleteOne();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// MULTI-DELETE PRODUCTS
exports.deleteMultipleProduct = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid or missing product IDs" });
    }

    const products = await Product.find({ _id: { $in: ids } });

    for (const product of products) {
      if (product.ProductImage) {
        const publicId = product.ProductImage.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`product_profiles/${publicId}`);
      }
    }

    const result = await Product.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No categories found to delete" });
    }

    res.status(200).json({
      message: `${result.deletedCount} product deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting multiple products:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
