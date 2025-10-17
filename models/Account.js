const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true, default: "Your Business Name" },
    tagline: { type: String, default: "" },
    address: { type: String, default: "" },
    landmark: { type: String, default: "" },
    gmail: { type: String, default: "" },
    phone: { type: String, default: "" },
    mobile: { type: String, default: "" },
    gstin: { type: String, default: "" },
    logo:{type:String, default:""},

    // ✅ Added banking fields
    bankName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    ifsc: { type: String, default: "" },
    branch: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Account", accountSchema);
