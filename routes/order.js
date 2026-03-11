const express = require("express");
const router = express.Router();
const Order = require("../models/OrderSchema");
const { cookieAuth } = require("../middlewares/AuthMWPermision");

router.post("/create", cookieAuth, async (req, res) => {
  try {
    const { items, shippingAddress, totalAmount } = req.body;

    const newOrder = new Order({
      user: req.user.id,
      items,
      shippingAddress,
      totalAmount,
    });

    await newOrder.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Order created successfully!",
        order: newOrder,
      });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/my-orders", cookieAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 }) 
      .populate("items.book");
    res.status(200).json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
module.exports = router;
