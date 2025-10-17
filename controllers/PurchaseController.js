// -------------------------------------------
// controllers/PurchaseController.js
// Unified controller for Purchases + Purchase Bills
// -------------------------------------------

const Purchase = require("../models/Purchase");
const Item = require("../models/itemModels");
const Account = require("../models/Account");
const mongoose = require("mongoose");

// -------------------- Create Purchase (also auto-creates bill) --------------------
exports.createPurchase = async (req, res) => {
  try {
    const {
      supplier,
      supplierNumber,
      supplierAddress,
      GSTNumber,
      items,
      subtotalAmount,
      discountPercent,
      discountAmount,
      shippingCharges,
      totalAmount,
      orderNumber,
      challanNumber,
      notes,
      purchaseDate,
      type,
      paymentMode,
    } = req.body;

    if (!items || !items.length)
      return res.status(400).json({ success: false, message: "At least one purchase item is required" });

    // -------------------- Normalize items --------------------
    const processedItems = items.map(i => ({
      productId: i.productId,
      name: i.name || "Unknown Item",
      qty: i.qty || 0,
      rate: i.rate || i.price || 0,
      amount: i.amount || i.total || 0,
      taxPercent: i.taxPercent || 0,
      discount: i.discount || 0,
      unit: i.unit || "pcs",
    }));

    // -------------------- Update inventory --------------------
    for (const i of processedItems) {
      if (i.qty && i.productId) {
        await Item.findByIdAndUpdate(i.productId, { $inc: { stockQuantity: i.qty } });
      }
    }

    // -------------------- Fetch account info --------------------
    const account = await Account.findOne();

    // -------------------- Create purchase --------------------
    const purchase = new Purchase({
      supplier: new mongoose.Types.ObjectId(supplier),
      supplierNumber,
      supplierAddress,
      GSTNumber,
      items: processedItems,
      subtotalAmount,
      discountPercent,
      discountAmount,
      shippingCharges,
      totalAmount,
      orderNumber,
      challanNumber,
      notes,
      purchaseDate: purchaseDate || new Date(),
      type: type || "Purchase",
      paymentMode: paymentMode || "cash",
      storeInfo: {
        businessName: account?.businessName || "Your Business",
        address: account?.address || "",
        landmark: account?.landmark || "",
        gmail: account?.gmail || "",
        phone: account?.phone || "",
        mobile: account?.mobile || "",
        gstin: account?.gstin || "",
        logo: account?.logo || "",
        bankName: account?.bankName || "",
        accountNumber: account?.accountNumber || "",
        ifsc: account?.ifsc || "",
        branch: account?.branch || "",
      },
      isBilled: true,
    });

    await purchase.save();

    res.status(201).json({ success: true, message: "Purchase & Bill created successfully", purchase });
  } catch (err) {
    console.error("Create Purchase Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------- Get All Purchases --------------------
exports.getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate("supplier", "supplierName")
      .sort({ createdAt: -1 });

    res.status(200).json(purchases);
  } catch (err) {
    console.error("Get Purchases Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------- Get Purchase By ID --------------------
exports.getPurchaseById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/))
      return res.status(400).json({ success: false, message: "Invalid Purchase ID" });

    const purchase = await Purchase.findById(id).populate("supplier", "supplierName");
    if (!purchase)
      return res.status(404).json({ success: false, message: "Purchase not found" });

    res.status(200).json(purchase);
  } catch (err) {
    console.error("Get Purchase By ID Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------- Update Purchase --------------------
exports.updatePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      supplier,
      supplierNumber,
      supplierAddress,
      GSTNumber,
      items,
      subtotalAmount,
      discountPercent,
      discountAmount,
      shippingCharges,
      totalAmount,
      orderNumber,
      challanNumber,
      notes,
      purchaseDate,
      type,
      paymentMode,
    } = req.body;

    let processedItems = [];
    if (items && items.length) {
      processedItems = items.map(i => ({
        productId: i.productId,
        name: i.name || "Unknown Item",
        qty: i.qty || 0,
        rate: i.rate || i.price || 0,
        amount: i.amount || i.total || 0,
        taxPercent: i.taxPercent || 0,
        discount: i.discount || 0,
        unit: i.unit || "pcs",
      }));

      // Update stock again if qty modified
      for (const i of processedItems) {
        if (i.qty && i.productId) {
          await Item.findByIdAndUpdate(i.productId, { $inc: { stockQuantity: i.qty } });
        }
      }
    }

    const updatedPurchase = await Purchase.findByIdAndUpdate(
      id,
      {
        supplier,
        supplierNumber,
        supplierAddress,
        GSTNumber,
        items: processedItems,
        subtotalAmount,
        discountPercent,
        discountAmount,
        shippingCharges,
        totalAmount,
        orderNumber,
        challanNumber,
        notes,
        purchaseDate,
        type,
        paymentMode,
      },
      { new: true }
    );

    if (!updatedPurchase)
      return res.status(404).json({ success: false, message: "Purchase not found" });

    res.status(200).json({ success: true, message: "Purchase updated successfully", purchase: updatedPurchase });
  } catch (err) {
    console.error("Update Purchase Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------- Delete Purchase --------------------
exports.deletePurchase = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Purchase.findByIdAndDelete(id);
    if (!deleted)
      return res.status(404).json({ success: false, message: "Purchase not found" });
    res.status(200).json({ success: true, message: "Purchase deleted successfully" });
  } catch (err) {
    console.error("Delete Purchase Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------- Purchase Stats --------------------
exports.getPurchaseStats = async (req, res) => {
  try {
    const totalPurchases = await Purchase.countDocuments();
    const completed = await Purchase.countDocuments({ type: "Purchase" });
    const returned = await Purchase.countDocuments({ type: /Return/i });
    const cash = await Purchase.countDocuments({ paymentMode: "cash" });
    const card = await Purchase.countDocuments({ paymentMode: "card" });
    const upi = await Purchase.countDocuments({ paymentMode: "upi" });

    res.status(200).json({ totalPurchases, completed, returned, cash, card, upi });
  } catch (err) {
    console.error("Stats Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------- Get All Purchase Bills --------------------
exports.getAllPurchaseBills = async (req, res) => {
  try {
    const bills = await Purchase.find({ isBilled: true })
      .populate("supplier", "supplierName")
      .sort({ createdAt: -1 });

    res.status(200).json(bills);
  } catch (err) {
    console.error("Get All Purchase Bills Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------- Get Purchase Bill By ID --------------------
exports.getPurchaseBillById = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await Purchase.findOne({ _id: id, isBilled: true }).populate("supplier", "supplierName");
    if (!bill)
      return res.status(404).json({ success: false, message: "Bill not found" });
    res.status(200).json(bill);
  } catch (err) {
    console.error("Get Bill By ID Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------- Delete Purchase Bill --------------------
exports.deletePurchaseBill = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await Purchase.findOneAndDelete({ _id: id, isBilled: true });
    if (!bill)
      return res.status(404).json({ success: false, message: "Bill not found" });
    res.status(200).json({ success: true, message: "Bill deleted successfully" });
  } catch (err) {
    console.error("Delete Bill Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
