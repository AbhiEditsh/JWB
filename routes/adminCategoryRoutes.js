const express = require("express");
const {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/adminCategoryController");

const CategoryRouter = express.Router();

CategoryRouter.post("/create", createCategory);
CategoryRouter.get("/categories", getAllCategories);
CategoryRouter.put("/categories/update/:id", updateCategory);
CategoryRouter.delete("/categories/delete/:id", deleteCategory);

module.exports = CategoryRouter;
