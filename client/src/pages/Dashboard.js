import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  Tooltip, XAxis, YAxis, ResponsiveContainer, Legend
} from "recharts";
import DefaultLayout from "../components/DefaultLayout";
// import { Table, Dropdown, Button } from "antd";
import { Dropdown, Button } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import {
  exportChartAsPDF,
  exportTableAsPDF,
  exportTableAsCSV
} from "../utils/exportUtils";
import "./Dashboard.css";

// const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA00FF"];

// 🎨 Modern Chart Colors
const CHART_COLORS = [
  "#6366F1", // Indigo
  "#22C55E", // Green
  "#FACC15", // Amber
  "#F97316", // Orange
  "#EF4444", // Red
  "#3B82F6", // Blue
  "#8B5CF6", // Violet
  "#14B8A6", // Teal
];


const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);


  const [summary, setSummary] = useState(null);

  const [chartType, setChartType] = useState("bar");
  const [selectedPeriod, setSelectedPeriod] = useState("Today");

  const [itemSalesChartType, setItemSalesChartType] = useState("bar");
  const [itemSalesPeriod, setItemSalesPeriod] = useState("Today");

  const [inventoryChartType, setInventoryChartType] = useState("bar");
  const [inventoryPeriod, setInventoryPeriod] = useState("Today");

  const [lowStockChartType, setLowStockChartType] = useState("bar");
  const [lowStockPeriod, setLowStockPeriod] = useState("Today");

  const [topItems, setTopItems] = useState([]);
  const [itemSales, setItemSales] = useState([]);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, chartRes, itemSalesRes, inventoryRes] = await Promise.all([
          axios.get("/api/dashboard/dashboard-summary"),
          axios.get(`/api/dashboard/dashboard-data?period=${selectedPeriod}`),
          axios.get(`/api/dashboard/item-wise-sales?period=${itemSalesPeriod}`),
          axios.get(`/api/dashboard/inventory-stock?period=${inventoryPeriod}`)
        ]);
        setSummary(summaryRes.data);
        setTopItems(chartRes.data.topItems || []);
        setItemSales(itemSalesRes.data.itemWiseSales || []);
        setInventory(inventoryRes.data || []);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      }
    };
    fetchData();
  }, [selectedPeriod, itemSalesPeriod, inventoryPeriod, lowStockPeriod]);

  const renderChart = (data, key, type) => {
    if (data.length === 0) return <div className="text-muted">⚠ No data available</div>;

    if (type === "bar") {
      return (
        <BarChart data={data}>
          <defs>
            {CHART_COLORS.map((c, i) => (
              <linearGradient id={`grad-${i}`} key={i} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={c} stopOpacity={0.9} />
                <stop offset="95%" stopColor={c} stopOpacity={0.3} />
              </linearGradient>
            ))}
          </defs>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={key} fill="url(#grad-0)" radius={[6, 6, 0, 0]} />
        </BarChart>
      );
    }

    if (type === "line") {
      return (
        <LineChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey={key}
            stroke={CHART_COLORS[0]}
            strokeWidth={3}
            dot={{ fill: CHART_COLORS[0], r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      );
    }

    if (type === "pie") {
      return (
        <PieChart>
          <Pie
            data={data}
            dataKey={key}
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={130}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      );
    }
    return null;
  };

  const exportMenu = (chartId, columns, tableData, tableName) => (
    {
      items: [
        {
          key: 'chartPdf',
          label: <span onClick={() => exportChartAsPDF(chartId, `${tableName}_Chart`)}>Export Chart as PDF</span>
        },
        {
          key: 'tablePdf',
          label: <span onClick={() => exportTableAsPDF(columns, tableData, `${tableName}_Table`)}>Export Table as PDF</span>
        },
        {
          key: 'csv',
          label: <span onClick={() => exportTableAsCSV(columns, tableData, `${tableName}_Table`)}>Export Table as CSV</span>
        }
      ]
    }
  );

  const itemSalesColumns = [
    { title: "Item Name", dataIndex: "name", key: "name" },
    { title: "Quantity Sold", dataIndex: "quantity", key: "quantity" },
    { title: "Revenue (₹)", dataIndex: "revenue", key: "revenue" },
  ];

  const inventoryColumns = [
    { title: "Item", dataIndex: "name", key: "name" },
    { title: "Category", dataIndex: "category", key: "category" },
    { title: "Price (₹)", dataIndex: "price", key: "price" },
    { title: "Stock Qty", dataIndex: "stockQuantity", key: "stockQuantity" },
  ];

  const lowStockColumns = [
    { title: "Item", dataIndex: "name", key: "name" },
    { title: "Stock Qty", dataIndex: "stockQuantity", key: "stockQuantity" },
  ];

  if (!summary) return <DefaultLayout><div className="container mt-4">Loading...</div></DefaultLayout>;

  return (
    <DefaultLayout>
      <div className="d-flex justify-content-end ">
        <div className="styles">
          <button
            className="btn btn-sm btn-dark"
            onClick={() => setDarkMode(prev => !prev)}
          >
            {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>
      </div>
      <div className="dashboard-container">
        {/* 🔢 Summary Cards */}
        <div className="row my-1 d-flex justify-content-around">
          {/* <div className="col-md-2"><div className="summary-card sales">Total Sales<br /><span>₹ {summary.totalSales}</span>  <span className="sp">💰 </span>  </div></div> */}
          {/* <div className="col-md-2"><div className="summary-card purchase">Total Purchase <br /><span>₹ {summary.totalPurchase}</span> <span className="sp">📦</span></div></div> */}
          {/* <div className="col-md-2"><div className="summary-card items">Total Items<br /><span>{summary.totalItems} </span> <span className="sp">📋</span></div></div> */}
          {/* <div className="col-md-2"><div className="summary-card stock">Stock Value<br /><span>₹ {summary.totalStockValue}</span>  <span className="sp">🏷</span></div></div> */}

          <div className="col-md-2">
            <div className="summary-card sales">
              Total Sales
              <br />
              <span>₹ {summary.totalSales}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24"
                style={{ width: "24px", marginLeft: "5px", verticalAlign: "middle" }}>
                <path fill="currentColor" d="M12 16q-.825 0-1.412-.587T10 14t.588-1.412T12 12t1.413.588T14 14t-.587 1.413T12 16M7.375 7h9.25l2-4H5.375zM8.4 21h7.2q2.25 0 3.825-1.562T21 15.6q0-.95-.325-1.85t-.925-1.625L17.15 9H6.85l-2.6 3.125q-.6.725-.925 1.625T3 15.6q0 2.275 1.563 3.838T8.4 21">
                </path>
              </svg>
            </div>
          </div>

          <div className="col-md-2">
            <div className="summary-card purchase">
              Total purchase
              <br />
              <span>₹ {summary.totalPurchase}</span>
              <svg xmlns="http://www.w3.org/2000/svg"
                width={24} height={24} viewBox="0 0 48 48"
                style={{ width: "24px", marginLeft: "5px", verticalAlign: "middle" }}>
                <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M8.038 16.342h31.925a3.537 3.537 0 0 1 3.537 3.536v18.986a3.54 3.54 0 0 1-3.538 3.538H8.037A3.537 3.537 0 0 1 4.5 38.865V19.88a3.54 3.54 0 0 1 3.538-3.538" strokeWidth={1}></path><rect width={4.126} height={4.127} x={19.874} y={19.353} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" rx={2.063} strokeWidth={1}></rect><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M35.367 19.353a2.063 2.063 0 0 1 2.063 2.063h0a2.063 2.063 0 0 1-2.063 2.064h0a2.063 2.063 0 0 1-2.063-2.064h0a2.063 2.063 0 0 1 2.063-2.063m-13.473-7.141a6.612 6.612 0 1 1 13.224 0m-13.224 0v4.15m13.224-4.15v3.913m-22.487-3.33a6.612 6.612 0 0 1 10.432-5.4m-10.432 5.4v3.261M8.13 21.842a2.063 2.063 0 1 1 4.126 0m-.001 14.897a2.063 2.063 0 1 1-4.126 0m4.126 0V21.84m-4.125.002V36.74" strokeWidth={1}>
                </path>
              </svg>
            </div>
          </div>

          <div className="col-md-2">
            <div className="summary-card items">
              Total items
              <br />
              <span>{summary.totalItems}</span>
              <svg xmlns="http://www.w3.org/2000/svg" 
              width={16} height={16} viewBox="0 0 16 16"
              style={{ marginLeft:"5px", verticalAlign:"middle"}}>
                <path fill="currentColor" d="M12 0a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-1v2a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1V2a2 2 0 0 1 2-2zM4 5.5a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5v-2H7a2 2 0 0 1-2-2V5.5zm3-4a.5.5 0 0 0-.5.5v8a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5V2a.5.5 0 0 0-.5-.5zM10.75 3a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1 0-1.5z">
                </path>
                </svg>
            </div>
          </div>

          <div className="col-md-3">
            <div className="summary-card stock">
              Stock Value
              <br />
              <span>₹ {summary.totalStockValue.toFixed(2)}</span>
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24"
                style={{ width: "24px", marginLeft: "5px", verticalAlign: "middle" }}>
                <path fill="currentColor" d="M12 16q-.825 0-1.412-.587T10 14t.588-1.412T12 12t1.413.588T14 14t-.587 1.413T12 16M7.375 7h9.25l2-4H5.375zM8.4 21h7.2q2.25 0 3.825-1.562T21 15.6q0-.95-.325-1.85t-.925-1.625L17.15 9H6.85l-2.6 3.125q-.6.725-.925 1.625T3 15.6q0 2.275 1.563 3.838T8.4 21">
                </path>
              </svg>
            </div>
          </div>
        </div>

        {/* 🧾 Item-wise Sales and 📦 Inventory Stock */}
        <div className="row section-container">
          {/* Item-wise Sales */}
          <div className="col-md-6">
            <div className="section-card sales">
              {/* <h4 className="d-flex justify-content-between align-items-center mb-2">🧾 Item-wise Sales</h4> */}
              <h4>🧾 Item-wise Sales</h4>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex gap-2">
                  <select className="form-select" value={itemSalesChartType} onChange={(e) => setItemSalesChartType(e.target.value)}>
                    <option value="bar">Bar</option>
                    <option value="line">Line</option>
                    {/* <option value="pie">Pie</option> */}
                  </select>
                  <select className="form-select" value={itemSalesPeriod} onChange={(e) => setItemSalesPeriod(e.target.value)}>
                    <option value="Today">Today</option>
                    <option value="LastYear">Last Year</option>
                    <option value="LastThreeMonths">Last Three Months</option>
                    <option value="CurrentFinancialYear">Current Financial Year</option>
                    <option value="LastMonth">Last Month</option>
                    <option value="CurrentMonth">Current Month</option>
                    <option value="LastWeek">Last Week</option>
                  </select>
                  <Dropdown menu={exportMenu("itemSalesChart", itemSalesColumns, itemSales, "ItemSales")} trigger={['click']}>
                    <Button icon={<MenuOutlined />} className="export-dropdown" />
                  </Dropdown>
                </div>
              </div>
              <ResponsiveContainer id="itemSalesChart" width="100%" height={250}>
                {renderChart(itemSales, "quantity", itemSalesChartType)}
              </ResponsiveContainer>
              {/* <Table dataSource={itemSales} columns={itemSalesColumns} rowKey="name" pagination={false} /> */}
            </div>
          </div>

          {/* Inventory Stock */}
          <div className="col-md-6">
            <div className="section-card purchase">
              <h4>📦 Inventory Stock</h4>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex gap-2">
                  <select className="form-select" value={inventoryChartType} onChange={(e) => setInventoryChartType(e.target.value)}>
                    <option value="bar">Bar</option>
                    <option value="line">Line</option>
                    {/* <option value="pie">Pie</option> */}
                  </select>
                  <select className="form-select" value={inventoryPeriod} onChange={(e) => setInventoryPeriod(e.target.value)}>
                    <option value="Today">Today</option>
                    <option value="LastYear">Last Year</option>
                    <option value="LastThreeMonths">Last Three Months</option>
                    <option value="CurrentFinancialYear">Current Financial Year</option>
                    <option value="LastMonth">Last Month</option>
                    <option value="CurrentMonth">Current Moncdth</option>
                    <option value="LastWeek">Last Week</option>
                  </select>
                  <Dropdown menu={exportMenu("inventoryChart", inventoryColumns, inventory, "Inventory")} trigger={['click']}>
                    <Button icon={<MenuOutlined />} className="export-dropdown" />
                  </Dropdown>
                </div>
              </div>
              <ResponsiveContainer id="inventoryChart" width="100%" height={250}>
                {renderChart(inventory.map(i => ({ name: i.name, stockQuantity: i.stockQuantity })), "stockQuantity", inventoryChartType)}
              </ResponsiveContainer>
              {/* <Table dataSource={inventory} columns={inventoryColumns} rowKey="_id" pagination={false} /> */}
            </div>
          </div>
        </div>

        {/* 📊 Sales Chart and 🚨 Low Stock */}
        <div className="row section-container">
          {/* Sales Chart */}
          <div className="col-md-6">
            <div className="section-card items">
              <h4>📊 Sales Chart</h4>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex gap-2">
                  <select className="form-select" value={chartType} onChange={(e) => setChartType(e.target.value)}>
                    <option value="bar">Bar</option>
                    <option value="line">Line</option>
                    {/* <option value="pie">Pie</option> */}
                  </select>
                  <select className="form-select" value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                    <option value="Today">Today</option>
                    <option value="LastYear">Last Year</option>
                    <option value="LastThreeMonths">Last Three Months</option>
                    <option value="CurrentFinancialYear">Current Financial Year</option>
                    <option value="LastMonth">Last Month</option>
                    <option value="CurrentMonth">Current Month</option>
                    <option value="LastWeek">Last Week</option>
                  </select>
                  <Dropdown menu={exportMenu("salesChart", topItems, "Sales")} trigger={['click']}>
                    <Button icon={<MenuOutlined />} className="export-dropdown" />
                  </Dropdown>
                </div>
              </div>
              <ResponsiveContainer id="salesChart" width="100%" height={250}>
                {renderChart(topItems, "quantity", chartType)}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Low Stock */}
          <div className="col-md-6">
            <div className="section-card sales">
              <h4>🚨 Low Stock (Qty less then 10)</h4>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex gap-2">
                  <select className="form-select" value={lowStockChartType} onChange={(e) => setLowStockChartType(e.target.value)}>
                    <option value="bar">Bar</option>
                    <option value="line">Line</option>
                    {/* <option value="pie">Pie</option> */}
                  </select>
                  <select className="form-select" value={lowStockPeriod} onChange={(e) => setLowStockPeriod(e.target.value)}>
                    <option value="Today">Today</option>
                    <option value="LastYear">Last Year</option>
                    <option value="LastThreeMonths">Last Three Months</option>
                    <option value="CurrentFinancialYear">Current Financial Year</option>
                    <option value="LastMonth">Last Month</option>
                    <option value="CurrentMonth">Current Month</option>
                    <option value="LastWeek">Last Week</option>
                  </select>
                  <Dropdown menu={exportMenu("lowStockChart", lowStockColumns, inventory.filter(i => i.stockQuantity < 5), "LowStock")} trigger={['click']}>
                    <Button icon={<MenuOutlined />} className="export-dropdown" />
                  </Dropdown>
                </div>
              </div>
              <ResponsiveContainer id="lowStockChart" width="100%" height={250}>
                {renderChart(
                  inventory.filter(i => i.stockQuantity < 10).map(i => ({ name: i.name, stockQuantity: i.stockQuantity })),
                  "stockQuantity",
                  lowStockChartType
                )}
              </ResponsiveContainer>
            </div>
            {/* <Table
              dataSource={inventory.filter(i => i.stockQuantity < 5)}
              columns={lowStockColumns}
              rowKey="_id"
              pagination={false}
            /> */}

          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Dashboard;
