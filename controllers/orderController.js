const Order = require("../model/orderModel");
const Product = require("../model/productModel");
//user api

//CREATE ORDER
const createOrder = async (req, res) => {
  try {
    const {
      userId,
      items,
      amount,
      billingAddress,
      shippingAddress,
      paymentMethod,
    } = req.body;

    if (
      !userId ||
      !items ||
      !amount ||
      !billingAddress ||
      !shippingAddress ||
      !paymentMethod
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const order = new Order({
      userId,
      items,
      amount,
      billingAddress,
      shippingAddress,
      paymentMethod,
      paymentStatus: "Pending",
    });

    const newOrder = await order.save();
    res.status(201).json({
      message: "Order created successfully",
      newOrder,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
//GET  USER ALL ORDER
const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    if (!orders.length) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    const populatedOrders = await Promise.all(
      orders.map(async (order) => {
        const populatedItems = await Promise.all(
          order.items.map(async (item) => {
            const product = await Product.findById(item.productId);
            if (product) {
              return {
                ...item.toObject(),
                productDetails: {
                  name: product.name,
                  price: product.price,
                  description: product.description,
                  productImage: product.ProductImage,
                  sku: product.sku,
                  available: product.Available,
                  gender: product.gender,
                  oldPrice: product.oldPrice,
                  rating: product.rating,
                },
              };
            } else {
              return {
                ...item.toObject(),
                productDetails: null,
              };
            }
          })
        );
        return {
          ...order.toObject(),
          items: populatedItems,
        };
      })
    );

    res.status(200).json({ success: true, orders: populatedOrders });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
//GET ORDER BY ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "userId",
      "name email"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
//GET ORDER USER BY ID
const getOrdersByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId }).populate(
      "userId",
      "name email"
    );

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//admin api
//GET ALL  ORDER
// const getAllOrders = async (req, res) => {
//   try {
//     const orders = await Order.find()
//       .populate("userId", "username email")
//       .populate("productId","ProductImage")
//       .sort({ createdAt: -1 });

//     if (!orders.length) {
//       return res.status(404).json({ message: "No orders found" });
//     }

//     res.status(200).json(orders);
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };
// const getAllOrders = async (req, res) => {
//   try {
//     const orders = await Order.find()
//       .populate("userId", "username email") // Fetch user details
//       .populate({
//         path: "items.productId", // Assuming products is an array of { productId, quantity }
//         select: "name ProductImage price", // Fetch name, image, and price
//       })
//       .sort({ createdAt: -1 });

//     if (!orders.length) {
//       return res.status(404).json({ message: "No orders found" });
//     }

//     res.status(200).json(orders);
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     res.status(500).json({ message: "Server Error", error: error.message });
//   }
// };

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "username email profilePicture") // Fetch user details
      .populate({
        path: "items.productId", // Assuming items is an array of { productId, quantity }
        select: "name ProductImage price", // Fetch name, image, and price
      })
      .sort({ createdAt: -1 });

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found" });
    }

    // Calculate totalQuantity for each order
    const ordersWithTotalQuantity = orders.map((order) => {
      const totalQuantity = order.items.reduce(
        (sum, item) => sum + (item.quantity || 0),
        0
      );
      return { ...order.toObject(), totalQuantity };
    });

    res.status(200).json(ordersWithTotalQuantity);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//GET ORDER
const getOrderDetails = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("userId", "username email profilePicture")
      .populate({
        path: "items.productId",
        select: "name price ProductImage sku",
      });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

//UPDATE ORDER STATUS
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Order status is required" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    order.status = status;
    await order.save();

    res
      .status(200)
      .json({ message: "Order status updated successfully", order });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getOrdersByUserId,
  getAllOrders,
  getOrderDetails,
  updateOrderStatus,
};
