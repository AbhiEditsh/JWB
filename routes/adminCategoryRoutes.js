const express = require("express");
const {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  deleteMultipleCategories
} = require("../controllers/adminCategoryController");

const CategoryRouter = express.Router();

CategoryRouter.post("/categories/create", createCategory);
CategoryRouter.get("/categories", getAllCategories);
CategoryRouter.put("/categories/update/:id", updateCategory);
CategoryRouter.delete("/categories/delete/:id", deleteCategory);
CategoryRouter.delete("/categories/multi-delete", deleteMultipleCategories);

module.exports = CategoryRouter;
