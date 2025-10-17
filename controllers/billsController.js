
const Bills = require('../models/billModel');
const Item = require("../models/itemModels");

const addBill = async (req, res) => {
  try {
    console.log("📦 Incoming bill data     :", JSON.stringify(req.body, null, 2));
    const { cartItems } = req.body;

    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart items are missing or invalid." });
    }

    // ✅ Validate stock 
    for (const item of cartItems) {
      const dbItem = await Item.findById(item._id);
      if (!dbItem) return res.status(404).json({ message: `Item not found: ${item.name}` });
      if (dbItem.stockQuantity < item.quantity) {
        return res.status(400).json({
          message: `Not enough stock for item: ${dbItem.name}`,
          available: dbItem.stockQuantity,
        });
      }
    }

    // ✅ GST Split-up logic
    const taxSummary = {}; // { '12': { taxable: 0, tax: 0 }, '18': {...} }

    for (const item of cartItems) {
      const quantity = Number(item.quantity || 0);
      const basePrice = Number(item.price || 0);
      const discount = Number(item.discountPercent || 0);
      const taxPercent = Number(item.taxPercent || 0);

      const discountedPrice = basePrice * (1 - discount / 100);
      const taxable = discountedPrice * quantity;
      const taxAmount = (discountedPrice * taxPercent / 100) * quantity;

      if (!taxSummary[taxPercent]) {
        taxSummary[taxPercent] = { taxable: 0, tax: 0 };
      }

      taxSummary[taxPercent].taxable += taxable;
      taxSummary[taxPercent].tax += taxAmount;
    }
    req.body.taxSummary = taxSummary;

    // ✅ Round to 2 decimals
    for (const slab in taxSummary) {
      taxSummary[slab].taxable = Number(taxSummary[slab].taxable.toFixed(2));
      taxSummary[slab].tax = Number(taxSummary[slab].tax.toFixed(2));
    }

    // ✅ Save new bill with taxSummary
    const newBill = new Bills({ ...req.body, taxSummary });
    await newBill.save();

    // ✅ Update stock
    for (const item of cartItems) {
      await Item.findByIdAndUpdate(item._id, {
        $inc: { stockQuantity: -item.quantity },
      });
    }

    res.status(200).json({ message: "Bill added successfully", billId: newBill._id });
  } catch (error) {
    console.error("❌ Add Bill Error:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

// ✅ Delete a bill by ID
const deleteBill = async (req, res) => {
  try {
    const billId = req.params.id;
    const deletedBill = await Bills.findByIdAndDelete(billId);

    if (!deletedBill) {
      return res.status(404).json({ message: "Bill not found" });
    }

    res.status(200).json({ message: "Bill deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Bill Error:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = { addBill , deleteBill };
