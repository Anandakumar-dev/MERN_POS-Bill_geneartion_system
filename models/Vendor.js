const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  supplierName: { type: String, required: true },
  supplierNumber: { type: String, required: true },
  supplierAddress: { type: String, required: true },
  GSTNumber: { type: String },
  email: { type: String },
  mobileNumber: { type: String },
}, { timestamps: true });

module.exports = mongoose.model("Vendor", vendorSchema);
