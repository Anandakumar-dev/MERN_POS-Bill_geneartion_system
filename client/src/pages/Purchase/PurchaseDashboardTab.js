// -------------------------------------------
// PurchaseDashboardTab.js
// Visual Dashboard for Purchase Analytics
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

const PurchaseDashboardTab = () => {
  const [period, setPeriod] = useState("month"); // day, week, month, year
  const [purchaseData, setPurchaseData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [kpis, setKpis] = useState({ total: 0, count: 0, avg: 0 });

  // ----------------------------------------
  // Fetch and process purchase data
  // ----------------------------------------
  const fetchData = async () => {
    try {
      const res = await axios.get("/api/purchase");
      const data = res.data.data || [];

      if (!data.length) return;

      // Aggregate by date and product
      const groupedByDate = {};
      const productTotals = {};

      const now = new Date();
      const startDate = new Date();

      switch (period) {
        case "day":
          startDate.setDate(now.getDate() - 1);
          break;
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
        case "year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          break;
      }

      const filtered = data.filter(
        (p) => new Date(p.createdAt) >= startDate
      );

      filtered.forEach((purchase) => {
        const dateKey = new Date(purchase.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        });

        groupedByDate[dateKey] =
          (groupedByDate[dateKey] || 0) + (purchase.totalAmount || 0);

        if (Array.isArray(purchase.items)) {
          purchase.items.forEach((i) => {
            productTotals[i.name] = (productTotals[i.name] || 0) + (i.qty || 0);
          });
        }
      });

      const formattedPurchases = Object.entries(groupedByDate).map(([date, total]) => ({
        date,
        total,
      }));

      const sortedProducts = Object.entries(productTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7)
        .map(([name, qty]) => ({ name, qty }));

      const total = filtered.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
      const count = filtered.length;
      const avg = count ? total / count : 0;

      setPurchaseData(formattedPurchases);
      setTopProducts(sortedProducts);
      setKpis({ total, count, avg });
    } catch (err) {
      console.error(err);
      message.error("Failed to load purchase dashboard data");
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

  // ----------------------------------------
  // Render
  // ----------------------------------------
  return (
    <DefaultLayout>
      <Title level={3}>Purchase Analytics Dashboard</Title>

      {/* KPI Cards */}
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Spend"
              value={kpis.total.toFixed(2)}
              prefix="₹"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Total Bills" value={kpis.count} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Avg. Bill Value"
              value={kpis.avg.toFixed(2)}
              prefix="₹"
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Period Selector */}
      <Space style={{ marginBottom: 16 }}>
        <span>View by:</span>
        <Select
          value={period}
          onChange={(v) => setPeriod(v)}
          style={{ width: 150 }}
        >
          <Option value="day">Day</Option>
          <Option value="week">Week</Option>
          <Option value="month">Month</Option>
          <Option value="year">Year</Option>
        </Select>
      </Space>

      <Row gutter={24}>
        {/* Purchases Over Time */}
        <Col span={14}>
          <Card title={`Purchases Over Time (${period})`}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={purchaseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="Total Purchases (₹)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Most Purchased Products */}
        <Col span={10}>
          <Card title={`Top Purchased Products (${period})`}>
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

      {/* Extra Visualization */}
      <Card title="Top 5 Product Composition">
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

export default PurchaseDashboardTab;
