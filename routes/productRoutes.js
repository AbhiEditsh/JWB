const express = require("express");
const productController = require("../controllers/productController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const {
  authenticateToken,
  authorizeAdmin,
} = require("../middleware/authMiddleware");

const ProductRouter = express.Router();

ProductRouter.post(
  "/create",
  upload.single("ProductImage"),
  productController.createProduct
);
ProductRouter.get("/view", productController.getProducts);
ProductRouter.get("/:id", productController.getProductById);
ProductRouter.delete("/:id", productController.deleteProductId);
ProductRouter.patch(
  "/:id",
  authenticateToken,
  authorizeAdmin,
  upload.single("ProductImage"),
  productController.UpdateProductId
); 
ProductRouter.get("/related/:id", productController.reletedProduct);
ProductRouter.get("/category/:category", productController.getProductsByCategory);

module.exports = ProductRouter;
