const express = require("express");
const router = express.Router();
const Category = require("../models/categoryModel");

// ✅ Get all categories
router.get("/get-all", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.send(categories);
  } catch (err) {
    res.status(500).send("Error fetching categories");
  }
});

// ✅ Add new category
router.post("/add-category", async (req, res) => {
  try {
    const { name } = req.body;
    const categoryExists = await Category.findOne({  name: { $regex: new RegExp(`^${name}$`, "i") }, });
    if (categoryExists) {
      return res.status(400).send("Category already exists");
    }
    const formattedName = name.trim().toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    const newCategory = new Category({ name: formattedName  });
    await newCategory.save();
    res.send("Category added successfully");
  } catch (err) {
    res.status(500).send("Error creating category");
  }
});

// ✅ Delete category
router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ message: "Failed to delete category" });
  }
});

module.exports = router;
