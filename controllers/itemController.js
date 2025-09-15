const itemModel = require("../models/itemModels.js");

// Get all items
const getItemController = async (req, res) => {
  try {
    const items = await itemModel.find();
    res.status(200).send(items);
  } catch (error) {
    console.log(error);
    res.status(500).send("Failed to fetch items");
  }
};

// Add a new item
const addItemController = async (req, res) => {
  try {

    let { name, price, category, image, stockQuantity, hsnCode, unit, taxPercent } = req.body;

    // name = name.chartAt(0).toUpperCase()+name.slice(1).toLowerCase();
    name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

    const existingItem = await itemModel.findOne({ name });

    if (existingItem) {
      return res.status(400).send("Item already exists");
    }

    const newItem = new itemModel({
      name,
      hsnCode,
      unit,
      taxPercent,
      price,
      category,
      image,
      stockQuantity: stockQuantity || 0,
    });

    await newItem.save();
    res.status(201).send("Item Created Successfully!");
  } catch (error) {
    console.log(error);
    res.status(400).send("Error: " + error.message);
  }
};

// Update item (with stock addition support)
const editItemController = async (req, res) => {
  try {
    // const { itemId, price, category, taxPercent,image, stockQuantity, isStockAddition } = req.body;

    const { itemId, price, category, taxPercent, image, stockQuantity, isStockAddition } = req.body;

    const numericTax = Number(taxPercent); // force conversion


    // Find the item
    const item = await itemModel.findById(itemId);
    if (!item) {
      return res.status(404).send("Item not found");
    }


    let updatedStock = stockQuantity;
    if (isStockAddition && stockQuantity) {
      updatedStock = item.stockQuantity + Number(stockQuantity);
    } else if (!isStockAddition) {
      updatedStock = Number(stockQuantity); // Replace with new stock value
    }


    // Update item
    const updateditem = await itemModel.findByIdAndUpdate(
      itemId,
      {
        price,
        taxPercent: numericTax,
        category,
        image,
        stockQuantity: updatedStock,
      },
      { new: true }
    );

    console.log(updateditem)


    res.status(200).json("Item updated successfully");
  } catch (error) {
    console.log(error);
    res.status(400).send("Update failed: " + error.message);
  }
};

// Delete item
const deleteItemController = async (req, res) => {
  try {
    await itemModel.findOneAndDelete({ _id: req.body.itemId });
    res.send("Item deleted successfully");
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

module.exports = {
  getItemController,
  addItemController,
  editItemController,
  deleteItemController,
};
