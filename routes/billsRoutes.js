
const express = require("express");
const billModel = require("../models/billModel");
const { addBill, deleteBill } = require("../controllers/billsController");

const router = express.Router();

// ✅ Add new bill (normal invoice flow)
router.post("/add-bill", addBill);

// Delete Bill
router.delete("/delete-bill/:id", deleteBill); // ✅ deleteBill now defined

// ✅ Get all bills
router.get("/get-bills", async (req, res) => {
  try {
    const bills = await billModel.find();
    res.send(bills);
  } catch (error) {
    res.status(400).json(error);
  }
});

// ✅ Get single bill by ID (for GST split-up etc.)
router.get("/:id", async (req, res) => {
  try {
    const bill = await billModel.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch bill", error: error.message });
  }
});


// PUT /api/bills/update-customer/:id
router.put("/update-customer/:id", async (req, res) => {
  try {
    const {       customerName,
      customerNumber,
      customerAddress,
      GSTNumber,
      customerDL,
      shippingAddress, } = req.body;

    const updatedBill = await billModel.findByIdAndUpdate(
      req.params.id,
      {       customerName,
      customerNumber,
      customerAddress,
      GSTNumber,
      customerDL,
      shippingAddress,},
      { new: true }
    );

    if (!updatedBill) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json(updatedBill);
  } catch (error) {
    console.error("Update customer error:", error);
    res.status(500).json({ message: "Server error while updating customer" });
  }
});


router.delete("/delete-bill/:id", (req, res, next) => {
  console.log("✅ Hit delete-bill route:", req.params.id);
  next();
}, deleteBill);

module.exports = router;
