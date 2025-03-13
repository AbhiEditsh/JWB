const express = require("express");
const productController = require("../controllers/productController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

const ProductRouter = express.Router();

// **Admin Routes**
ProductRouter.post(
  "/admin/create",
  authenticateToken,
  authorizeAdmin,
  upload.single("ProductImage"),
  productController.createProduct
);
ProductRouter.put(
  "/admin/update/:id",
  authenticateToken,
  authorizeAdmin,
  upload.single("ProductImage"),
  productController.updateProduct
);
ProductRouter.delete(
  "/admin/delete/:id",
  authenticateToken,
  authorizeAdmin,
  productController.deleteProduct
);

// **User Routes**
ProductRouter.get("/search", productController.searchProducts);
ProductRouter.get("/", productController.getProducts);
ProductRouter.get("/:id", productController.getProductById);
ProductRouter.get("/related/:id", productController.getRelatedProducts);
ProductRouter.get(
  "/category/:category",
  productController.getProductsByCategory
);
ProductRouter.delete("/delete/:id", productController.deleteProduct);
ProductRouter.delete("/multi-delete", productController.deleteMultipleProduct);


module.exports = ProductRouter;
