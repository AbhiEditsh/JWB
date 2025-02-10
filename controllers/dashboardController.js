const Product = require("../model/productModel");
const Category = require("../model/CategoryModel");
const Order = require("../model/orderModel");
const User = require("../model/userModel");

// 🟢 Get Admin Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });
    const totalRevenue = await Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }]);

    res.status(200).json({
      totalProducts,
      totalCategories,
      totalOrders,
      totalUsers,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
