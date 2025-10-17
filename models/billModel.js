const mongoose = require("mongoose");

const billSchema = mongoose.Schema(
  {
    customerName: { type: String, required: true },
    customerNumber: { type: String, required: true },
    GSTNumber: { type: String, required: true },
    customerAddress: { type: String, required: true },
    paymentMode: { type: String, required: true },
    cartItems: { type: Array, required: true },

    // NEW FIELDS:
    subTotal: { type: Number, required: true },
    discountPercent: { type: Number, required: true },
    discountAmount: { type: Number, required: false },
    afterDiscount: { type: Number, required: true },
    // taxBreakdown: { type: Object, required: true }, // e.g. { "18": 123.45, "12": 45.00 }
    tax: { type: Number, required: true },
    roundOff: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    userId: { type: String, required: true },
  },
  { timestamps: true }
);

const Bills = mongoose.model("bills", billSchema);

module.exports = Bills;
