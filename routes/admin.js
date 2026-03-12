const express = require("express");
const router = express.Router();
const Books = require("../models/BookSchema");
const uploadCloud = require("../config/cloudinaryConfig");
const multer = require("multer");
const { auth } = require("../middlewares/AuthMWPermision");

router.post(
  "/add-book",
  auth("admin"),
  uploadCloud.single("coverImage"),
  async (req, res) => {
    try {
      const {
        title,
        author,
        description,
        price,
        stock,
        category,
        isFeatured,
        isOnSale,
        discountPercent,
      } = req.body;

      if (!title || !author || !description || !price || !stock)
        return res.status(400).json({ error: "All fields are required" });

      const newBook = new Books({
        title,
        author,
        description,
        price,
        stock,
        category,
        isFeatured,
        isOnSale,
        discountPercent,
        coverImage: req.file?.path,
      });

      await newBook.save();
      res.status(201).json({ message: "Created Successfully", book: newBook });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  },
);

router.get("/getAllBooks", auth("admin"), async (req, res) => {
  try {
    const books = await Books.find().populate("category", "name");
    return res.status(200).send(books);
  } catch (err) {
    console.log(err);
  }
});

router.get("/getAllBooks/:id", auth("admin"), async (req, res) => {
  try {
    const book = await Books.findById(req.params.id).populate(
      "category",
      "name",
    );
    if (!book) return res.status(400).send("this book is Not Found");
    return res.status(200).send(book);
  } catch (err) {
    console.log(err);
  }
});

router.put("/updateBook/:id", auth("admin"), async (req, res) => {
  try {
    const book = await Books.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("category", "name");

    if (!book) return res.status(404).send("Not Found");
    return res.status(200).send("book updated successfully", book);
  } catch (err) {
    console.log(err);
  }
});

router.delete("/deleteBook/:id", auth("admin"), async (req, res) => {
  try {
    const book = await Books.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).send("Not Found");
    return res.status(200).send("book deleted successfully");
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;
