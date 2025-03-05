require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const reviewRoutes = require("./routes/reviewsRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminPaymentRoutes = require("./routes/adminPaymentRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const adminCategoryRoutes = require("./routes/adminCategoryRoutes");
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());

// CORS Configuration
const corsOptions = {
  origin: "http://localhost:3031",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/product", productRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
// Admin Payment Route
app.use("/api/admin", adminPaymentRoutes);
app.use("/api/admin", adminOrderRoutes);
app.use("/api/admin", adminCategoryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
