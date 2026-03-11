const mongoose = require("mongoose");
const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
    minLength: 3,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  oldPrice: { type: Number, default: 0 },
  isOnSale: {
    type: Boolean,
    default: false,
  },
  discountPercent: {
    type: Number,
  },
  coverImage: {
    type: String,
  },
});

module.exports = mongoose.model("Book", BookSchema);
