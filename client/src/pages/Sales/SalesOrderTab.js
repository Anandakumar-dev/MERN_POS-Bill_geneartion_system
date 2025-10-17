// -------------------------------------------
// SalesOrderTab.js
// POS-style Sales Order Page (refined)
// Fully aligned with unified Sales Mongoose Schema
// Live table: auto-add row on last selection
// -------------------------------------------

import React, { useState, useEffect } from "react";
import {
  Table,
  InputNumber,
  Button,
  Card,
  message,
  Select,
  Modal,
  Form,
  Input,
} from "antd";
import axios from "axios";
import DefaultLayout from "../../components/DefaultLayout";

const { Option } = Select;

const SalesOrderTab = () => {
  const [form] = Form.useForm();

  const [itemsList, setItemsList] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [shippingCharges, setShippingCharges] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [customerModal, setCustomerModal] = useState(false);

  const TYPE = "Sales"; // preset type

  // -------------------- Fetch items --------------------
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await axios.get("/api/items/get-item");
        setItemsList(data);
        if (orderItems.length === 0) addRow();
      } catch (err) {
        console.error(err);
        message.error("Failed to fetch items");
      }
    };
    fetchItems();
  }, []);

  // -------------------- Compute totals --------------------
  useEffect(() => {
    let sub = orderItems.reduce((acc, item) => acc + (item.total || 0), 0);
    setSubtotal(sub);
    const total = sub + Number(shippingCharges || 0);
    setFinalTotal(total);
  }, [orderItems, shippingCharges, discountPercent]);

  // -------------------- Add / Remove rows --------------------
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

  const removeRow = (key) => {
    setOrderItems(orderItems.filter((row) => row.key !== key));
  };

  // -------------------- Row changes --------------------
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

  // -------------------- Item selection --------------------
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
            total: parseFloat(
              (item.price * 1 * (1 + (item.taxPercent || 0) / 100)).toFixed(2)
            ),
          }
        : row
    );
    setOrderItems(updated);

    const isLastRow = orderItems[orderItems.length - 1]?.key === key;
    if (isLastRow) addRow();
  };

  // -------------------- Save Draft / Open Customer Modal --------------------
  const handleSaveDraft = () => {
    if (!orderItems.some((i) => i.itemId))
      return message.error("Add at least one item");
    setCustomerModal(true);
  };

  // -------------------- Submit --------------------
  const handleSubmit = async (values) => {
    try {
      const validItems = orderItems.filter((i) => i.itemId);
      if (!validItems.length)
        return message.error("Add at least one item before placing the order");

      const items = validItems.map((i) => ({
        productId: i.itemId,
        name: i.name,
        qty: i.qty,
        rate: i.price,
        amount: i.total,
        taxPercent: i.taxPercent || 0,
      }));

      const totalAmount = items.reduce((acc, i) => acc + (i.amount || 0), 0);

      const payload = {
        customer: values.customerName || "Walk-in Customer",
        salesDate: new Date(),
        items,
        totalAmount,
        orderNumber: form.getFieldValue("orderNumber") || "",
        challanNumber: "",
        type: TYPE,
      };

      await axios.post("/api/sales", payload);
      message.success(`${TYPE} Created Successfully`);

      // reset table & modal
      setOrderItems([]);
      addRow();
      setCustomerModal(false);
    } catch (err) {
      console.error(`${TYPE} error:`, err.response?.data || err.message);
      message.error(err.response?.data?.message || `Failed to create ${TYPE}`);
    }
  };

  // -------------------- Table columns --------------------
  const columns = [
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
        <InputNumber
          min={1}
          value={record.qty}
          onChange={(val) => handleRowChange(record.key, "qty", val)}
        />
      ),
    },
    {
      title: "Unit",
      dataIndex: "unit",
      render: (text, record) => (
        <Select
          value={record.unit}
          style={{ width: "100%" }}
          onChange={(val) => handleRowChange(record.key, "unit", val)}
        >
          <Option value="pcs">pcs</Option>
          <Option value="kg">kg</Option>
          <Option value="ltr">ltr</Option>
        </Select>
      ),
    },
    { title: "Price", dataIndex: "price", render: (text, record) => `₹${record.price}` },
    { title: "Tax %", dataIndex: "taxPercent", render: (text, record) => `${record.taxPercent}%` },
    {
      title: "Discount",
      dataIndex: "discount",
      render: (text, record) => (
        <InputNumber
          min={0}
          value={record.discount}
          onChange={(val) => handleRowChange(record.key, "discount", val)}
        />
      ),
    },
    {
      title: "Total",
      dataIndex: "total",
      render: (text, record) => `₹${record.total?.toFixed(2) || 0}`,
    },
    {
      title: "Action",
      render: (_, record) => <Button danger onClick={() => removeRow(record.key)}>Delete</Button>,
    },
  ];

  // -------------------- Render --------------------
  return (
    <DefaultLayout>
      <div style={{ display: "flex", gap: 20, padding: 20 }}>
        <div style={{ flex: 3 }}>
          <Table dataSource={orderItems} columns={columns} pagination={false} rowKey="key" />
        </div>

        <div style={{ flex: 1 }}>
          <Card title="Order Summary">
            <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
            <p>
              Discount %:{" "}
              <InputNumber
                min={0}
                max={100}
                value={discountPercent}
                onChange={setDiscountPercent}
              />
            </p>
            <p>
              Discount Amount: ₹{orderItems.reduce((acc, i) => acc + (i.discount || 0), 0).toFixed(2)}
            </p>
            <p>
              Shipping:{" "}
              <InputNumber min={0} value={shippingCharges} onChange={setShippingCharges} />
            </p>
            <p>
              <strong>Final Total: ₹{finalTotal.toFixed(2)}</strong>
            </p>
            <Button type="primary" onClick={handleSaveDraft} style={{ marginRight: 10 }}>
              Place Order
            </Button>
            <Button danger onClick={() => setOrderItems([])}>Cancel</Button>
          </Card>
        </div>
      </div>

      <Modal title="Customer Details" open={customerModal} onCancel={() => setCustomerModal(false)} footer={false}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="primary" htmlType="submit">Confirm Order</Button>
          </div>
        </Form>
      </Modal>
    </DefaultLayout>
  );
};

export default SalesOrderTab;
