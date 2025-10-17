// -------------------------------------------
// controllers/SalesController.js
// Unified Business Logic for Sales, Challans, Returns
// -------------------------------------------

const Sales = require("../models/Sales");
const Item = require("../models/itemModels");

// Utility: adjust inventory quantity based on sale type
async function adjustInventory(items, type, rollback = false) {
  for (const i of items) {
    const qtyChange =
      type === "Sales" || type === "Sales Challan"
        ? -i.qty
        : type === "Sales Return" || type === "Sales Return Challan"
        ? i.qty
        : 0;

    // Rollback reverses the change (e.g., during update/delete)
    const finalChange = rollback ? -qtyChange : qtyChange;

    await Item.findByIdAndUpdate(i.productId, {
      $inc: { stockQuantity: finalChange },
    });
  }
}

// -------------------- Create new Sale / Challan / Return --------------------
const createSale = async (req, res) => {
  try {
    const { items, type } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .send({ success: false, message: "No items provided" });
    }

    const sale = new Sales(req.body);
    await sale.save();

    await adjustInventory(items, type);

    res
      .status(201)
      .send({ success: true, message: `${type} recorded successfully`, sale });
  } catch (error) {
    console.error(`${req.body.type || "Sale"} creation error:`, error);
    res
      .status(500)
      .send({ success: false, message: error.message || "Server error" });
  }
};

// -------------------- Fetch all Sales / Challans / Returns --------------------
const getAllSales = async (req, res) => {
  try {
    const { type } = req.query; // optional ?type=Sales Return
    const query = type ? { type } : {};
    const sales = await Sales.find(query).sort({ createdAt: -1 });
    res.status(200).send({ success: true, data: sales });
  } catch (error) {
    console.error("Fetch sales error:", error);
    res
      .status(500)
      .send({ success: false, message: error.message || "Server error" });
  }
};

// -------------------- Fetch single sale by ID --------------------
const getSaleById = async (req, res) => {
  try {
    const sale = await Sales.findById(req.params.id);
    if (!sale)
      return res
        .status(404)
        .send({ success: false, message: "Sale record not found" });
    res.status(200).send({ success: true, data: sale });
  } catch (error) {
    console.error("Fetch sale by ID error:", error);
    res
      .status(500)
      .send({ success: false, message: error.message || "Server error" });
  }
};

// -------------------- Update existing Sale / Challan / Return --------------------
const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, type } = req.body;

    const oldSale = await Sales.findById(id);
    if (!oldSale)
      return res
        .status(404)
        .send({ success: false, message: "Sale record not found" });

    // Rollback old inventory changes
    await adjustInventory(oldSale.items, oldSale.type, true);

    // Apply new inventory changes
    await adjustInventory(items, type, false);

    const updated = await Sales.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res
      .status(200)
      .send({ success: true, message: `${type} updated successfully`, updated });
  } catch (error) {
    console.error("Update sale error:", error);
    res
      .status(500)
      .send({ success: false, message: error.message || "Server error" });
  }
};

// -------------------- Delete Sale / Challan / Return --------------------
const deleteSale = async (req, res) => {
  try {
    const sale = await Sales.findById(req.params.id);
    if (!sale)
      return res
        .status(404)
        .send({ success: false, message: "Sale record not found" });

    // Rollback inventory
    await adjustInventory(sale.items, sale.type, true);

    await Sales.findByIdAndDelete(req.params.id);

    res.status(200).send({
      success: true,
      message: `${sale.type} deleted and inventory restored`,
    });
  } catch (error) {
    console.error("Delete sale error:", error);
    res
      .status(500)
      .send({ success: false, message: error.message || "Server error" });
  }
};

// -------------------- Optional: Sales Return shortcut (legacy) --------------------
const createSalesReturn = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || !items.length)
      return res.status(400).send({ message: "No items provided" });

    const returnSale = new Sales({
      ...req.body,
      type: "Sales Return",
      totalAmount: req.body.totalAmount || 0,
    });
    await returnSale.save();

    await adjustInventory(items, "Sales Return");

    res
      .status(200)
      .send({ success: true, message: "Sales return processed", returnSale });
  } catch (error) {
    console.error("Sales return error:", error);
    res
      .status(500)
      .send({ success: false, message: error.message || "Server error" });
  }
};

module.exports = {
  createSale,
  getAllSales,
  getSaleById,
  updateSale,
  deleteSale,
  createSalesReturn, // optional legacy route
};
