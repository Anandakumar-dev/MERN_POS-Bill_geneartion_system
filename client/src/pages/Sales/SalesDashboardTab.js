// -------------------------------------------
// SalesDashboardTab.js
// Visual Dashboard for Sales Analytics (robust)
// -------------------------------------------

import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Select,
  Statistic,
  Space,
  Typography,
  Divider,
  message,
} from "antd";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import axios from "axios";
import DefaultLayout from "../../components/DefaultLayout";

const { Option } = Select;
const { Title } = Typography;

const SalesDashboardTab = () => {
  const [period, setPeriod] = useState("month"); // day, week, month, year
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [kpis, setKpis] = useState({ total: 0, count: 0, avg: 0 });

  const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

  // -------------------- Fetch & Process --------------------
  const fetchData = async () => {
    try {
      const res = await axios.get("/api/sales");
      const data = res.data.data || [];
      console.log("Sales raw data:", data);

      if (!data.length) {
        message.info("No sales recorded yet");
        setSalesData([]);
        setTopProducts([]);
        setKpis({ total: 0, count: 0, avg: 0 });
        return;
      }

      // Filter by period
      const now = new Date();
      const startDate = new Date();
      switch (period) {
        case "day": startDate.setDate(now.getDate() - 1); break;
        case "week": startDate.setDate(now.getDate() - 7); break;
        case "month": startDate.setMonth(now.getMonth() - 1); break;
        case "year": startDate.setFullYear(now.getFullYear() - 1); break;
        default: break;
      }

      const filtered = data.filter(s => new Date(s.createdAt) >= startDate);
      if (!filtered.length) {
        message.info("No sales data for selected period");
        setSalesData([]);
        setTopProducts([]);
        setKpis({ total: 0, count: 0, avg: 0 });
        return;
      }

      // Aggregate sales by date
      const groupedByDate = {};
      const productTotals = {};

      filtered.forEach(sale => {
        const dateKey = new Date(sale.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit", month: "short"
        });
        groupedByDate[dateKey] = (groupedByDate[dateKey] || 0) + (sale.totalAmount || 0);

        // Aggregate items sold
        if (Array.isArray(sale.items)) {
          sale.items.forEach(i => {
            const qty = i.qty || 0;
            const name = i.name || "Unknown";
            productTotals[name] = (productTotals[name] || 0) + qty;
          });
        }
      });

      // Format data for charts
      const formattedSales = Object.entries(groupedByDate).map(([date, total]) => ({ date, total }));
      const sortedProducts = Object.entries(productTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7)
        .map(([name, qty]) => ({ name, qty }));

      const total = filtered.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
      const count = filtered.length;
      const avg = count ? total / count : 0;

      setSalesData(formattedSales);
      setTopProducts(sortedProducts);
      setKpis({ total, count, avg });

    } catch (err) {
      console.error(err);
      message.error("Failed to load dashboard data");
    }
  };

  useEffect(() => { fetchData(); }, [period]);

  // -------------------- Render --------------------
  return (
    <DefaultLayout>
      <Title level={3}>Sales Analytics Dashboard</Title>

      {/* KPI Cards */}
      <Row gutter={16}>
        <Col span={8}><Card><Statistic title="Total Revenue" value={kpis.total.toFixed(2)} prefix="₹" /></Card></Col>
        <Col span={8}><Card><Statistic title="Total Orders" value={kpis.count} /></Card></Col>
        <Col span={8}><Card><Statistic title="Avg Order Value" value={kpis.avg.toFixed(2)} prefix="₹" /></Card></Col>
      </Row>

      <Divider />

      {/* Period Selector */}
      <Space style={{ marginBottom: 16 }}>
        <span>View by:</span>
        <Select value={period} onChange={setPeriod} style={{ width: 150 }}>
          <Option value="day">Day</Option>
          <Option value="week">Week</Option>
          <Option value="month">Month</Option>
          <Option value="year">Year</Option>
        </Select>
      </Space>

      <Row gutter={24}>
        {/* Sales Over Time */}
        <Col span={14}>
          <Card title={`Sales Over Time (${period})`}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={false} name="Total Sales (₹)" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Top Products */}
        <Col span={10}>
          <Card title={`Top Products (${period})`}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart layout="vertical" data={topProducts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={120} />
                <Tooltip />
                <Bar dataKey="qty" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Pie Chart */}
      <Card title="Sales Composition (Top 5 Products)">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={topProducts.slice(0, 5)}
              dataKey="qty"
              nameKey="name"
              outerRadius={100}
              label
            >
              {topProducts.slice(0, 5).map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </DefaultLayout>
  );
};

export default SalesDashboardTab;
