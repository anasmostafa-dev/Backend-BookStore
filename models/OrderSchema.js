const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
    },
  ],
  shippingAddress: {
    city: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
  },
  totalAmount: { type: Number, required: true },
  status: { type: String, default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", OrderSchema);
