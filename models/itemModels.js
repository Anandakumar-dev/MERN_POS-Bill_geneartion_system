const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    hsnCode: {
      type: String,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    taxPercent: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    stockQuantity: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const itemModel = mongoose.model("items", itemSchema);
module.exports = itemModel;
