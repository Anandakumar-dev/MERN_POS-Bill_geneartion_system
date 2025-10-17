const express = require("express");
const router = express.Router();
const { createVendor, getAllVendors, updateVendor, deleteVendor } = require("../controllers/VendorController");

router.post("/", createVendor);
router.get("/", getAllVendors);
router.put("/:id", updateVendor);
router.delete("/:id", deleteVendor);

module.exports = router;
