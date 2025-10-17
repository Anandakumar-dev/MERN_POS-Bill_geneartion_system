// -------------------------------------------
// routes/SalesRoutes.js
// Unified routes for Sales, Challans, Returns
// -------------------------------------------

const express = require("express");
const router = express.Router();
const {
  createSale,
  getAllSales,
  getSaleById,
  updateSale,
  deleteSale,
  createSalesReturn,
} = require("../controllers/SalesController");

// -------------------- ROUTES --------------------

// Create new sale / challan / return / challan-return
router.post("/", createSale);

// Fetch all sales (optional filter by ?type=Sales or ?type=Sales Return)
router.get("/", getAllSales);

// Fetch single sale by ID
router.get("/:id", getSaleById);

// Update sale / challan / return
router.put("/:id", updateSale);

// Delete sale / challan / return
router.delete("/:id", deleteSale);

// Optional: Legacy route for direct sales return creation
router.post("/return", createSalesReturn);

module.exports = router;
