// -------------------------------------------
// server.js
// Main server entry for POS Retail ERP
// -------------------------------------------

const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
require("colors");

// -------------------- Load environment variables --------------------
dotenv.config();

// -------------------- Connect to Database --------------------
const connectDb = require("./config/config.js");
connectDb();

// -------------------- Initialize Express App --------------------
const app = express();

// -------------------- Middlewares --------------------
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(bodyParser.json({ limit: "10mb" }));
// app.use(bodyParser.urlencoded({ extended: false })); // optional
app.use(morgan("dev")); // request logger (optional)

// -------------------- API Routes --------------------
app.use("/api/items", require("./routes/itemRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/bills", require("./routes/billsRoutes"));
app.use("/api/quickbilling", require("./routes/QuickBillingRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/account", require("./routes/account"));
app.use("/api/vendors", require("./routes/vendorRoute"));
app.use("/api/purchase", require("./routes/PurchaseRoutes"));
app.use("/api/employees", require("./routes/employeeRoutes"));
app.use("/api/sales", require("./routes/SalesRoutes"));

// -------------------- Test Route --------------------
app.get("/", (req, res) => {
  res.send("✅ Welcome to POS Retail ERP Backend!");
});

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`.bgWhite.green.bold);
});
