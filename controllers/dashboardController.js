const Bill = require("../models/billModel");
const Item = require("../models/itemModels");

// Total summary
const getDashboardSummary = async (req, res) => {
  try {
    const bills = await Bill.find();
    const items = await Item.find();

    const totalSales = bills.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalPurchase = bills.reduce((sum, b) => sum + (b.purchaseAmount || 0), 0);
    const totalStockValue = items.reduce((sum, item) => sum + (item.price * item.stockQuantity), 0);

    res.status(200).json({
      totalSales,
      totalPurchase,
      totalItems: items.length,
      totalStockValue
    });
  } catch (err) {
    res.status(500).json({ error: "Dashboard summary error" });
  }
};

// Chart: top selling items
const getDashboardChartData = async (req, res) => {
  try {
    const { period } = req.query;
    const { startDate, endDate } = getStartAndEndDate(period);
    const bills = await Bill.find({ createdAt: { $gte: startDate, $lte: endDate } });

    const itemMap = {};

    bills.forEach(bill => {
      bill.cartItems.forEach(item => {
        if (!itemMap[item.name]) {
          itemMap[item.name] = { name: item.name, quantity: 0 };
        }
        itemMap[item.name].quantity += item.quantity;
      });
    });

    const topItems = Object.values(itemMap).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    res.json({ topItems });
  } catch (err) {
    res.status(500).json({ error: "Dashboard chart error" });
  }
};

// Table: item-wise sales
const getItemWiseSales = async (req, res) => {
  try {
    // const bills = await Bill.find();
    const { period } = req.query;
    const { startDate, endDate } = getStartAndEndDate(period);
    const bills = await Bill.find({ createdAt: { $gte: startDate, $lte: endDate } });

    const sales = {};

    bills.forEach(bill => {
      bill.cartItems.forEach(item => {
        if (!sales[item.name]) {
          sales[item.name] = { name: item.name, quantity: 0, revenue: 0 };
        }
        sales[item.name].quantity += item.quantity;
        sales[item.name].revenue += item.quantity * item.price;
      });
    });

    res.json({ itemWiseSales: Object.values(sales) });
  } catch (err) {
    res.status(500).json({ error: "Item-wise sales error" });
  }
};

// Table: inventory stock
const getInventoryStock = async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Inventory stock fetch error" });
  }
};

// Chart: purchase data
const getPurchaseData = async (req, res) => {
  try {
    // const bills = await Bill.find();
    const { period } = req.query;
    const { startDate, endDate } = getStartAndEndDate(period);
    const bills = await Bill.find({ createdAt: { $gte: startDate, $lte: endDate } });

    const data = [];

    bills.forEach(bill => {
      const date = bill.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
      const found = data.find(item => item.name === date);
      if (found) found.amount += (bill.purchaseAmount || 0);
      else data.push({ name: date, amount: bill.purchaseAmount || 0 });
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Purchase chart error" });
  }
};

// Chart: current stock
const getCurrentStock = async (req, res) => {
  try {
    const items = await Item.find();
    const data = items.map(item => ({
      name: item.name,
      stockQuantity: item.stockQuantity
    }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Current stock error" });
  }
};

// Chart: negative stock
const getNegativeStock = async (req, res) => {
  try {
    const items = await Item.find({ stockQuantity: { $lt: 0 } });
    const data = items.map(item => ({
      name: item.name,
      stockQuantity: item.stockQuantity
    }));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Negative stock error" });
  }
};

module.exports = {
  getDashboardSummary,
  getDashboardChartData,
  getItemWiseSales,
  getInventoryStock,
  getPurchaseData,
  getCurrentStock,
  getNegativeStock,
  getStartAndEndDate
};


function getStartAndEndDate(period) {
  const now = new Date();
  let startDate, endDate;

  switch (period) {
    case "Today":
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      break;

    case "LastWeek":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      endDate = new Date();
      break;

    case "LastMonth":
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      endDate = new Date();
      break;

    case "CurrentMonth":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date();
      break;

    case "LastThreeMonths":
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      endDate = new Date();
      break;

    case "CurrentFinancialYear":
      startDate = new Date(now.getFullYear(), 3, 1); // April 1st
      if (now.getMonth() < 3) {
        startDate.setFullYear(now.getFullYear() - 1);
      }
      endDate = new Date();
      break;

    case "LastYear":
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
      break;

    default:
      startDate = new Date(0); // From beginning
      endDate = new Date();    // Until now
  }

  return { startDate, endDate };
}
