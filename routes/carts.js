const express = require("express");
const router = express.Router();
const Cart = require("../models/CartSchema");
const Book = require("../models/BookSchema");
const { cookieAuth } = require("../middlewares/AuthMWPermision");

router.get("/", cookieAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    let cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.book",
      "title author price coverImage stock",
    );
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
      await cart.save();
    } else {
      cart.items = cart.items.filter((item) => item.book !== null);
      cart.totalItems = cart.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      cart.totalAmount = cart.items.reduce((sum, item) => {
        const price = item.price || (item.book ? item.book.price : 0);
        return sum + price * item.quantity;
      }, 0);
      await cart.save();
    }
    return res
      .status(200)
      .json({ message: "Cart retrieved successfully", success: true, cart });
  } catch (err) {
    console.log("Error retrieveing cart", err);
    res.status(500).json({
      message: "Error retrieveing cart",
      success: false,
      error: err.message,
    });
  }
});

router.post("/add", cookieAuth, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { bookId } = req.body;

    const book = await Book.findById(bookId);
    if (book.stock <= 0) {
      return res.status(400).json({ message: "Out of stock" });
    }
    let cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.book",
      "title author price coverImage stock",
    );
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.book && (item.book._id || item.book).toString() === bookId,
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += 1;
    } else {
      cart.items.push({ book: bookId, price: book.price, quantity: 1 });
    }
    book.stock -= 1;
    await book.save();
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.book",
      "title author price coverImage stock",
    );
    return res.json({ success: true, cart: populatedCart });
  } catch (err) {
    console.error("Error adding to cart:", err);
    res
      .status(500)
      .json({ message: "Error adding to cart", error: err.message });
  }
});

router.put("/update", cookieAuth, async (req, res) => {
  try {
    const { bookId, quantity } = req.body;

    let cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.book",
      "title author price coverImage stock",
    );
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (item) => item.book && item.book._id.toString() === bookId,
    );
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    const book = await Book.findById(bookId);
    const diff = quantity - item.quantity;

    if (diff > 0) {
      if (book.stock < diff) {
        return res.status(400).json({ message: "Not enough stock" });
      }
      book.stock -= diff;
    } else {
      book.stock += Math.abs(diff);
    }

    item.quantity = quantity;
    await book.save();

    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    await cart.save();
    const populatedCart = await Cart.findById(cart._id).populate(
      "items.book",
      "title author price coverImage stock",
    );

    res.json({ success: true, cart: populatedCart });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updates to cart", error: err.message });
  }
});

router.delete("/remove/:bookId", cookieAuth, async (req, res) => {
  try {
    const { bookId } = req.params;

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (item) => item.book.toString() === bookId,
    );

    if (itemIndex === -1)
      return res.status(404).json({ message: "Item not found in cart" });

    const item = cart.items[itemIndex];
    const book = await Book.findById(bookId);
    if (book) {
      book.stock += item.quantity;
      await book.save();
    }

    cart.items.splice(itemIndex, 1);

    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate(
      "items.book",
      "title author price coverImage stock",
    );

    res.json({ success: true, cart: populatedCart });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting item", error: err.message });
  }
});

// Clear the entire cart after checkout
router.delete("/clear", cookieAuth, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    let cart = await Cart.findOne({ user: req.user.id });
    
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    cart.totalItems = 0;
    cart.totalAmount = 0;

    await cart.save();

    res.status(200).json({ 
      success: true, 
      message: "Cart cleared successfully",
      cart 
    });
  } catch (err) {
    console.error("Error clearing cart:", err);
    res.status(500).json({ message: "Error clearing cart", error: err.message });
  }
});
module.exports = router;
