// -------------------------------------------
// models/Sales.js
// Unified Sales Schema for POS Retail Billing
// Supports Sales Order, Sales Challan, Sales Return, Return Challan
// -------------------------------------------

const mongoose = require("mongoose");

// Subdocument for individual sale/return items
const saleItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "items",
    required: true,
  },
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true },       // total for this item (rate*qty + tax - discount)
  taxPercent: { type: Number, default: 0 },       // tax %
  discount: { type: Number, default: 0 },         // optional discount per item
  unit: { type: String, default: "pcs" },         // unit: pcs, kg, ltr
});

// Main sales/return/challan schema
const saleSchema = new mongoose.Schema(
  {
    customer: { type: String, required: true },            // for Sales/Return
    supplier: { type: String, default: "" },              // optional for Purchase/Return
    salesDate: { type: Date, default: Date.now },          // for Sales
    returnDate: { type: Date },                            // for Returns
    items: [saleItemSchema],                               // array of items
    subtotalAmount: { type: Number, default: 0 },          // sum of all item.amount
    discountPercent: { type: Number, default: 0 },         // total discount %
    discountAmount: { type: Number, default: 0 },          // calculated discount value
    shippingCharges: { type: Number, default: 0 },         // shipping charges
    totalAmount: { type: Number, required: true },         // final total (subtotal - discount + shipping)
    orderNumber: { type: String, default: "" },            // optional
    challanNumber: { type: String, default: "" },          // optional
    type: { 
      type: String, 
      enum: ["Sales", "Sales Challan", "Sales Return", "Sales Return Challan"], 
      default: "Sales" 
    },                                                     // differentiates tab/type
    paymentMode: { type: String, enum: ["cash", "card", "upi"], default: "cash" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sales", saleSchema);
