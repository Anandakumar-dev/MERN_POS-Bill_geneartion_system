// -------------------------------------------
// models/Purchase.js
// Unified model for Purchase Orders + Bills
// -------------------------------------------

const mongoose = require("mongoose");

// -------------------- Item Schema --------------------
const purchaseItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true },
  taxPercent: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  unit: { type: String, default: "pcs" },
});

// -------------------- Main Purchase Schema --------------------
const purchaseSchema = new mongoose.Schema(
  {
    // Linked supplier/vendor
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },

    // Basic info
    purchaseDate: { type: Date, default: Date.now },
    returnDate: { type: Date },

    // Items
    items: [purchaseItemSchema],

    // Amounts
    subtotalAmount: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    shippingCharges: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    // Identifiers
    orderNumber: { type: String, default: "" },
    challanNumber: { type: String, default: "" },

    // Type of purchase
    type: {
      type: String,
      enum: ["Purchase", "Purchase Challan", "Purchase Return", "Purchase Return Challan"],
      default: "Purchase",
    },

    // Payment
    paymentMode: { type: String, enum: ["cash", "card", "upi"], default: "cash" },

    // Store info snapshot
    storeInfo: {
      businessName: { type: String, default: "Your Business" },
      address: { type: String, default: "" },
      landmark: { type: String, default: "" },
      gmail: { type: String, default: "" },
      phone: { type: String, default: "" },
      mobile: { type: String, default: "" },
      gstin: { type: String, default: "" },
      logo: { type: String, default: "" },
      bankName: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      ifsc: { type: String, default: "" },
      branch: { type: String, default: "" },
    },

    // Flags
    isBilled: { type: Boolean, default: false }, // marks whether bill generated
  },
  { timestamps: true }
);

module.exports = mongoose.model("Purchase", purchaseSchema);
