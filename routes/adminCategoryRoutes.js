const express = require("express");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  deleteMultipleCategories,
  getSingleCategory,
} = require("../controllers/adminCategoryController");

const CategoryRouter = express.Router();

CategoryRouter.post(
  "/categories/create",
  upload.single("ProductImage"),
  createCategory
);
CategoryRouter.get("/categories", getAllCategories);
CategoryRouter.get("/categories/:id", getSingleCategory); 
CategoryRouter.put("/categories/update/:id", updateCategory);
CategoryRouter.delete("/categories/delete/:id", deleteCategory);
CategoryRouter.delete("/categories/multi-delete", deleteMultipleCategories);

module.exports = CategoryRouter;
