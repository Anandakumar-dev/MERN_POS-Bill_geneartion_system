
// working fine

const Bill = require("../models/billModel");
const Item = require("../models/itemModels");

// ✅ 1. Fetch last 5 bills by customer name (case-insensitive)
const getLast5BillsByCustomerName = async (req, res) => {
  const customerName = req.params.customerName;
  try {
    const bills = await Bill.find({
      customerName: { $regex: new RegExp(customerName, "i") },
    })
      .sort({ createdAt: -1 })
      .limit(5);
    res.status(200).json(bills);
  } catch (err) {
    console.error("❌ Error fetching bills:", err.message);
    res.status(500).json({ message: "Error fetching bills" });
  }
};

// ✅ 2. Clone selected bill with edited items and update inventory
const cloneAndGenerateBill = async (req, res) => {
  const billId = req.params.billId;

  const {
    cartItems,
    customerName = "QuickAccess User",
    customerNumber = "0000000000",
    paymentMode = "QuickAccess",
    customerAddress = "N/A",
    GSTNumber = "N/A",
    subTotal = 0,
    discountPercent = 0,
    discountAmount = 0,
    afterDiscount = 0,
    tax = 0,
    roundOff = 0,
    totalAmount = 0,
  } = req.body;

  try {
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: "Cart items missing." });
    }

    // 🚫 Stock check
    for (let item of cartItems) {
      const dbItem = await Item.findOne({ name: item.name });
      if (!dbItem) {
        return res.status(404).json({ message: `Item not found: ${item.name}` });
      }
      if (dbItem.stockQuantity < item.quantity) {
        return res.status(400).json({
          message: `❌ Not enough stock for "${item.name}". Only ${dbItem.stockQuantity} available.`,
        });
      }
    }

    // 🧾 Save new bill with detailed fields
    const newBill = new Bill({
      cartItems,
      customerName,
      customerNumber,
      paymentMode,
      customerAddress,
      GSTNumber,
      userId: "quick-access", // optional user tracking

      subTotal,
      discountPercent,
      discountAmount,
      afterDiscount,
      tax,
      roundOff,
      totalAmount,

      // createdAt: new Date(),
    });

    await newBill.save();

    // 🏷️ Inventory update
    for (let item of cartItems) {
      await Item.findOneAndUpdate(
        { name: item.name },
        { $inc: { stockQuantity: -item.quantity } },
        { new: true }
      );
    }

    res.status(201).json({
      message: "✅ Bill cloned and saved successfully.",
      newBillId: newBill._id,
      createdAt: newBill.createdAt,
    });
  } catch (err) {
    console.error("❌ Error cloning bill:", err.message);
    res.status(500).json({ message: err.message || "Error cloning bill" });
  }
};

// ✅ 3. Get all quick bills
const getQuickBills = async (req, res) => {
  try {
    const bills = await Bill.find().sort({ createdAt: -1 });
    res.status(200).json(bills);
  } catch (err) {
    console.error("❌ Error fetching quick bills:", err.message);
    res.status(500).json({ message: "Error fetching quick bills" });
  }
};

module.exports = {
  getLast5BillsByCustomerName,
  cloneAndGenerateBill,
  getQuickBills,
};
