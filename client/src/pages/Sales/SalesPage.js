// -------------------------------------------
// SalesPage.js
// Unified Sales Module Page (Dashboard + Order + Challans + Returns)
// -------------------------------------------

import React, { useState, useEffect } from "react";
import {
  Tabs,
  Table,
  InputNumber,
  Button,
  Card,
  message,
  Select,
  Modal,
  Form,
  Input,
  Row,
  Col,
  Statistic,
  Space,
  Divider,
  Typography,
} from "antd";
import axios from "axios";
import DefaultLayout from "../../components/DefaultLayout";
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

const { TabPane } = Tabs;
const { Option } = Select;
const { Title } = Typography;

const SalesPage = () => {
  // -------------------- Common States --------------------
  const [activeTab, setActiveTab] = useState("1");

  // -------------------- Dashboard States --------------------
  const [period, setPeriod] = useState("month");
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [kpis, setKpis] = useState({ total: 0, count: 0, avg: 0 });

  // -------------------- Sales Table States --------------------
  const [itemsList, setItemsList] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [shippingCharges, setShippingCharges] = useState(0);
  const [customerModal, setCustomerModal] = useState(false);
  const [form] = Form.useForm();

  // -------------------- Fetch Items --------------------
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await axios.get("/api/items/get-item");
        setItemsList(data);
        if (orderItems.length === 0) addRow(); // init table
      } catch (err) {
        console.error(err);
        message.error("Failed to fetch items");
      }
    };
    fetchItems();
  }, []);

  // -------------------- Dashboard Data --------------------
  const fetchDashboard = async () => {
    try {
      const res = await axios.get("/api/sales");
      const data = res.data.data || [];
      if (!data.length) return;

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

      const filtered = data.filter((s) => new Date(s.createdAt) >= startDate);

      filtered.forEach((sale) => {
        const dateKey = new Date(sale.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
        });
        groupedByDate[dateKey] =
          (groupedByDate[dateKey] || 0) + (sale.totalAmount || 0);

        if (Array.isArray(sale.items)) {
          sale.items.forEach((i) => {
            productTotals[i.name] = (productTotals[i.name] || 0) + (i.qty || 0);
          });
        }
      });

      const formattedSales = Object.entries(groupedByDate).map(([date, total]) => ({
        date,
        total,
      }));

      const sortedProducts = Object.entries(productTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7)
        .map(([name, qty]) => ({ name, qty }));

      const total = filtered.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
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

  useEffect(() => {
    if (activeTab === "1") fetchDashboard();
  }, [period, activeTab]);

  // -------------------- Order Table Logic --------------------
  const addRow = () => {
    setOrderItems((prev) => [
      ...prev,
      {
        key: Date.now(),
        itemId: null,
        name: "",
        price: 0,
        unit: "pcs",
        qty: 1,
        taxPercent: 0,
        discount: 0,
        total: 0,
      },
    ]);
  };

  const removeRow = (key) => setOrderItems(orderItems.filter((r) => r.key !== key));

  const handleRowChange = (key, field, value) => {
    const updated = orderItems.map((row) => {
      if (row.key === key) {
        const newRow = { ...row, [field]: value };
        const rate = Number(newRow.price || 0);
        const qty = Number(newRow.qty || 0);
        const tax = Number(newRow.taxPercent || 0);
        const discount = Number(newRow.discount || 0);
        newRow.total = parseFloat(
          ((rate * qty + (rate * qty * tax) / 100) - discount).toFixed(2)
        );
        return newRow;
      }
      return row;
    });
    setOrderItems(updated);
  };

  const handleSelectItem = (key, itemId) => {
    const item = itemsList.find((i) => i._id === itemId);
    if (!item) return;

    const updated = orderItems.map((row) =>
      row.key === key
        ? {
            ...row,
            itemId: item._id,
            name: item.name,
            price: item.price,
            unit: item.unit || "pcs",
            taxPercent: item.taxPercent || 0,
            qty: 1,
            discount: 0,
            total: parseFloat((item.price * 1 * (1 + (item.taxPercent || 0) / 100)).toFixed(2)),
          }
        : row
    );
    setOrderItems(updated);

    const isLastRow = orderItems[orderItems.length - 1]?.key === key;
    if (isLastRow) addRow();
  };

  const handleSaveDraft = () => {
    if (!orderItems.some((i) => i.itemId)) return message.error("Add at least one item");
    setCustomerModal(true);
  };

  const handleSubmit = async (values, type = "Sales") => {
    try {
      const validItems = orderItems.filter((i) => i.itemId);
      if (!validItems.length) return message.error("Add at least one item");

      const items = validItems.map((i) => ({
        productId: i.itemId,
        name: i.name,
        qty: i.qty,
        rate: i.price,
        amount: i.total,
        taxPercent: i.taxPercent,
      }));

      const totalAmount = items.reduce((acc, i) => acc + (i.amount || 0), 0);

      const payload = {
        customer: values.customerName || "Walk-in Customer",
        salesDate: new Date(),
        items,
        totalAmount,
        orderNumber: form.getFieldValue("orderNumber") || "",
        challanNumber: "",
        type,
      };

      await axios.post("/api/sales", payload);
      message.success(`${type} created successfully`);

      // Reset table & modal
      setOrderItems([]);
      addRow();
      setCustomerModal(false);
    } catch (err) {
      console.error(`${type} error:`, err.response?.data || err.message);
      message.error(err.response?.data?.message || "Failed to save");
    }
  };

  // -------------------- Table Columns --------------------
  const getColumns = () => [
    {
      title: "Item",
      dataIndex: "name",
      render: (text, record) => (
        <Select
          showSearch
          placeholder="Select or type item"
          value={record.itemId}
          onChange={(val) => handleSelectItem(record.key, val)}
          filterOption={(input, option) =>
            option.children.toLowerCase().includes(input.toLowerCase())
          }
          style={{ width: "100%" }}
        >
          {itemsList.map((item) => (
            <Option key={item._id} value={item._id}>
              {item.name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Qty",
      dataIndex: "qty",
      render: (text, record) => (
        <InputNumber min={1} value={record.qty} onChange={(val) => handleRowChange(record.key, "qty", val)} />
      ),
    },
    {
      title: "Unit",
      dataIndex: "unit",
      render: (text, record) => (
        <Select value={record.unit} style={{ width: "100%" }} onChange={(val) => handleRowChange(record.key, "unit", val)}>
          <Option value="pcs">pcs</Option>
          <Option value="kg">kg</Option>
          <Option value="ltr">ltr</Option>
        </Select>
      ),
    },
    { title: "Price", dataIndex: "price", render: (text, record) => <span>₹{record.price}</span> },
    { title: "Tax %", dataIndex: "taxPercent", render: (text, record) => <span>{record.taxPercent}%</span> },
    {
      title: "Discount",
      dataIndex: "discount",
      render: (text, record) => (
        <InputNumber min={0} value={record.discount} onChange={(val) => handleRowChange(record.key, "discount", val)} />
      ),
    },
    { title: "Total", dataIndex: "total", render: (text, record) => <span>₹{record.total?.toFixed(2) || 0}</span> },
    { title: "Action", render: (_, record) => <Button danger onClick={() => removeRow(record.key)}>Delete</Button> },
  ];

  // -------------------- Render --------------------
  const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <DefaultLayout>
      <h2 style={{ marginBottom: 20, fontWeight: 600 }}>Sales Module</h2>
      <Tabs
        defaultActiveKey="1"
        type="card"
        size="large"
        tabBarGutter={10}
        tabBarStyle={{ fontSize: 16, fontWeight: 500 }}
        onChange={(key) => setActiveTab(key)}
      >
        {/* Dashboard */}
        <TabPane tab="Sales Dashboard" key="1">
          <Row gutter={16}>
            <Col span={8}>
              <Card>
                <Statistic title="Total Revenue" value={kpis.total.toFixed(2)} prefix="₹" />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic title="Total Orders" value={kpis.count} />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic title="Avg. Order Value" value={kpis.avg.toFixed(2)} prefix="₹" />
              </Card>
            </Col>
          </Row>

          <Divider />
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
            <Col span={14}>
              <Card title={`Sales Over Time (${period})`}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Col>
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
          <Card title="Sales Composition (Top 5 Products)">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={topProducts.slice(0, 5)} dataKey="qty" nameKey="name" outerRadius={100} label>
                  {topProducts.slice(0, 5).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </TabPane>

        {/* Sales Order */}
        <TabPane tab="Sales Order" key="2">
          <SalesTabContent type="Sales" />
        </TabPane>

        {/* Sales Challan */}
        <TabPane tab="Sales Challan" key="3">
          <SalesTabContent type="Sales Challan" />
        </TabPane>

        {/* Sales Return */}
        <TabPane tab="Sales Return" key="4">
          <SalesTabContent type="Sales Return" />
        </TabPane>

        {/* Sales Return Challan */}
        <TabPane tab="Sales Return Challan" key="5">
          <SalesTabContent type="Sales Return Challan" />
        </TabPane>
      </Tabs>
    </DefaultLayout>
  );

  // -------------------- Sales Tab Content Component --------------------
  function SalesTabContent({ type }) {
    const subtotal = orderItems.reduce((acc, i) => acc + (i.total || 0), 0);
    const finalTotal = subtotal + Number(shippingCharges || 0);

    return (
      <div style={{ display: "flex", gap: 20, padding: 20 }}>
        {/* Left: Table */}
        <div style={{ flex: 3 }}>
          <Table dataSource={orderItems} columns={getColumns()} pagination={false} rowKey="key" />
        </div>

        {/* Right: Summary */}
        <div style={{ flex: 1 }}>
          <Card title={`${type} Summary`}>
            <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
            <p>
              Shipping: <InputNumber min={0} value={shippingCharges} onChange={setShippingCharges} />
            </p>
            <p>
              <strong>Final Total: ₹{finalTotal.toFixed(2)}</strong>
            </p>
            <Button type="primary" onClick={handleSaveDraft} style={{ marginRight: 10 }}>
              Place {type}
            </Button>
            <Button danger onClick={() => setOrderItems([])}>
              Cancel
            </Button>
          </Card>
        </div>

        {/* Customer Modal */}
        <Modal
          title="Customer Details"
          open={customerModal}
          onCancel={() => setCustomerModal(false)}
          footer={false}
        >
          <Form form={form} layout="vertical" onFinish={(vals) => handleSubmit(vals, type)}>
            <Form.Item name="customerName" label="Customer Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="customerNumber" label="Customer Number" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="customerAddress" label="Customer Address" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="GSTNumber" label="GST Number">
              <Input />
            </Form.Item>
            <Form.Item name="paymentMode" label="Payment Method" rules={[{ required: true }]}>
              <Select>
                <Option value="cash">Cash</Option>
                <Option value="card">Card</Option>
                <Option value="upi">UPI</Option>
              </Select>
            </Form.Item>
            <div className="d-flex justify-content-end">
              <Button type="primary" htmlType="submit">
                Confirm {type}
              </Button>
            </div>
          </Form>
        </Modal>
      </div>
    );
  }
};

export default SalesPage;
