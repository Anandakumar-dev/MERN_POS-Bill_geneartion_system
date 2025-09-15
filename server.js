const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");


require("colors");

// Connect DB
const connectDb = require("./config/config.js");

// Load env vars
dotenv.config();
connectDb();

// Create app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("dev")); // optional, uncomment if needed

// Routes
app.use("/api/items", require("./routes/itemRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use("/api/bills", require("./routes/billsRoutes"));
app.use("/api/quickbilling", require("./routes/QuickBillingRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"))
app.use("/api/account", require("./routes/account"));

// Test route
app.get("/", function (req, res) {
  res.send("Welcome to Website?");
});

// Port
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`.bgWhite.green.bold);
});

