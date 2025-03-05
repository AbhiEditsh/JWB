const Category = require("../model/CategoryModel");
const { cloudinary } = require("../config/cloudinary");
const fs = require("fs");

// CREATE CATEGORY
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    let productPictureUrl = "";
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "product_profiles",
      });
      productPictureUrl = uploadResult.secure_url;
      fs.unlinkSync(req.file.path); // Delete the temporary file after upload
    }

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const newCategory = new Category({
      name,
      description,
      ProductImage: productPictureUrl,
    });
    await newCategory.save();

    res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// GET ALL CATEGORIES
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    if (!categories.length) {
      return res.status(404).json({ message: "No categories found" });
    }

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// GET SINGLE CATEGORY
const getSingleCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Find the category by ID
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching single category:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};


// UPDATE CATEGORY
const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const categoryId = req.params.id;

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Update name and description if provided
    category.name = name || category.name;
    category.description = description || category.description;

    // Handle ProductImage update
    if (req.file) {
      // Upload new image to Cloudinary
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "product_profiles",
      });
      const newProductImageUrl = uploadResult.secure_url;

      // Delete old image from Cloudinary if it exists
      if (category.ProductImage) {
        const publicId = category.ProductImage.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`product_profiles/${publicId}`);
      }

      // Update the ProductImage field
      category.ProductImage = newProductImageUrl;

      // Delete the temporary file
      fs.unlinkSync(req.file.path);
    }

    // Save the updated category
    await category.save();

    res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// DELETE CATEGORY
const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    if (category.ProductImage) {
      const publicId = category.ProductImage.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`product_profiles/${publicId}`);
    }
    await category.deleteOne();
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// MULTI-DELETE CATEGORIES
const deleteMultipleCategories = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid or missing category IDs" });
    }

    // Find all categories by IDs
    const categories = await Category.find({ _id: { $in: ids } });

    // Delete associated images from Cloudinary
    for (const category of categories) {
      if (category.ProductImage) {
        const publicId = category.ProductImage.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`product_profiles/${publicId}`);
      }
    }

    // Delete the categories from the database
    const result = await Category.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No categories found to delete" });
    }

    res.status(200).json({
      message: `${result.deletedCount} categories deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting multiple categories:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  updateCategory,
  getSingleCategory,
  deleteCategory,
  deleteMultipleCategories,
};