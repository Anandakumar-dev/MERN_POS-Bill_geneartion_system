// -------------------------------------------
// routes/PurchaseRoutes.js
// Unified routes for Purchases + Bills
// -------------------------------------------

const express = require("express");
const router = express.Router();

const {
  createPurchase,
  getAllPurchases,
  getPurchaseById,
  updatePurchase,
  deletePurchase,
  getPurchaseStats,
  getAllPurchaseBills,
  getPurchaseBillById,
  deletePurchaseBill,
} = require("../controllers/PurchaseController");

// -------------------- Purchase Bill Endpoints --------------------

// Get all purchase bills
router.get("/bills/all", getAllPurchaseBills);

// Get specific purchase bill by ID
router.get("/bills/:id", getPurchaseBillById);

// Delete purchase bill
router.delete("/bills/:id", deletePurchaseBill);

// -------------------- Purchase Endpoints --------------------

// Create a purchase (auto-generates bill)
router.post("/", createPurchase);

// Get all purchases
router.get("/", getAllPurchases);

// Purchase statistics
router.get("/stats/data", getPurchaseStats);

// Get single purchase by ID (dynamic route MUST be last)
router.get("/:id", getPurchaseById);

// Update purchase
router.put("/:id", updatePurchase);

// Delete purchase
router.delete("/:id", deletePurchase);

module.exports = router;
