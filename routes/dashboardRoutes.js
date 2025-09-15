// const express = require("express");
// const router = express.Router();

// const { dashboardData, getDashboardSummary, getItemWiseSales, getInventoryStock } = require("../controllers/dashboardController");
// router.get("/dashboard-data", dashboardData);
// router.get("/dashboard-summary", getDashboardSummary);
// router.get("/item-wise-sales", getItemWiseSales);
// router.get("/inventory-stock", getInventoryStock);
// module.exports = router;


const express = require("express");
const router = express.Router();
const {
  getDashboardSummary,
  getDashboardChartData,
  getItemWiseSales,
  getInventoryStock,
  getPurchaseData,
  getCurrentStock,
  getNegativeStock
} = require("../controllers/dashboardController");

router.get("/dashboard-summary", getDashboardSummary);
router.get("/dashboard-data", getDashboardChartData);
router.get("/item-wise-sales", getItemWiseSales);
router.get("/inventory-stock", getInventoryStock);
router.get("/purchase-data", getPurchaseData);
router.get("/current-stock", getCurrentStock);
router.get("/negative-stock", getNegativeStock);

module.exports = router;
