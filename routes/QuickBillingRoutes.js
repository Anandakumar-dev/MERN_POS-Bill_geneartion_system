// Routes

const express = require("express");
const router = express.Router();
const {
  getLast5BillsByCustomerName,
  cloneAndGenerateBill,
  getQuickBills,
} = require("../controllers/QuickBillingController");

// Route to fetch last 5 bills by customer name
router.get("/last-5/:customerName", getLast5BillsByCustomerName);

// Route to clone a bill and generate new one
router.post("/clone/:billId", cloneAndGenerateBill);

router.get("/bills", getQuickBills);

router.get("/ping", (req, res) => {
  res.send("QuickBilling is alive");
});

module.exports = router;