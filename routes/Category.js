const express = require("express");
const router = express.Router();
const Category = require("../models/CategorySchema");

router.post("/", async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) return res.status(400).send("Name is required");
    const newCategory = new Category({
      name,
    });
    await newCategory.save();
    res.status(201).send(`Category Created=> ${newCategory}`);
  } catch (err) {
    console.log(err);
  }
});

router.get("/getCategories", async (req, res) => {
  try {
    const categories = await Category.find();
    return res.status(200).send(categories);
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;
