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
  DatePicker,
} from "antd";
import axios from "axios";
import DefaultLayout from "../../components/DefaultLayout";
import dayjs from "dayjs";

const { Option } = Select;

const PurchaseReturnChallanTab = () => {
  const [form] = Form.useForm();
  const [itemsList, setItemsList] = useState([]);
  const [challanItems, setChallanItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [shippingCharges, setShippingCharges] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [supplierModal, setSupplierModal] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState(dayjs());

  // -------------------- Fetch items & vendors --------------------
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data } = await axios.get("/api/items/get-item");
        setItemsList(data);
        if (challanItems.length === 0) addRow();
      } catch {
        message.error("Failed to fetch items");
      }
    };

    const fetchVendors = async () => {
      try {
        const { data } = await axios.get("/api/vendors");
        setVendors(data);
      } catch {
        message.error("Failed to fetch vendors");
      }
    };

    fetchItems();
    fetchVendors();
  }, []);

  // -------------------- Compute totals --------------------
  useEffect(() => {
    const sub = challanItems.reduce((acc, item) => acc + (item.total || 0), 0);
    setSubtotal(sub);
    setFinalTotal(sub + Number(shippingCharges || 0));
  }, [challanItems, shippingCharges, discountPercent]);

  // -------------------- Add / Remove Rows --------------------
  const addRow = () => {
    setChallanItems(prev => [
      ...prev,
      { key: Date.now(), itemId: null, name: "", price: 0, unit: "pcs", qty: 1, taxPercent: 0, discount: 0, total: 0 },
    ]);
  };
  const removeRow = key => setChallanItems(challanItems.filter(row => row.key !== key));

  // -------------------- Row change handlers --------------------
  const handleRowChange = (key, field, value) => {
    const updated = challanItems.map(row => {
      if (row.key === key) {
        const newRow = { ...row, [field]: value };
        const rate = Number(newRow.price || 0);
        const qty = Number(newRow.qty || 0);
        const tax = Number(newRow.taxPercent || 0);
        const discount = Number(newRow.discount || 0);
        newRow.total = parseFloat(((rate * qty + (rate * qty * tax) / 100) - discount).toFixed(2));
        return newRow;
      }
      return row;
    });
    setChallanItems(updated);
  };

  const handleSelectItem = (key, itemId) => {
    const item = itemsList.find(i => i._id === itemId);
    if (!item) return;

    const updated = challanItems.map(row =>
      row.key === key
        ? {
            ...row,
            itemId: item._id,
            name: item.name,
            price: item.price,
            unit: item.unit || "pcs",
            taxPercent: item.taxPercent,
            qty: 1,
            discount: 0,
            total: parseFloat((item.price * 1 * (1 + item.taxPercent / 100)).toFixed(2)),
          }
        : row
    );
    setChallanItems(updated);

    if (challanItems[challanItems.length - 1].key === key) addRow();
  };

  const handleSaveDraft = () => {
    if (!selectedVendor) return message.error("Select a vendor first");
    if (!challanItems.some(i => i.itemId)) return message.error("Add at least one item");
    setSupplierModal(true);
  };

  const handleSubmit = async values => {
    try {
      const validItems = challanItems.filter(i => i.itemId);
      if (!validItems.length) return message.error("Add at least one item");

      const items = validItems.map(i => ({
        productId: i.itemId,
        name: i.name,
        qty: i.qty,
        rate: i.price,
        amount: i.total,
        taxPercent: i.taxPercent || 0,
      }));

      const totalAmount = items.reduce((acc, i) => acc + (i.amount || 0), 0);

      const payload = {
        supplier: selectedVendor._id,
        returnDate: purchaseDate.toISOString(),
        items,
        totalAmount,
        orderNumber: form.getFieldValue("orderNumber") || "",
        challanNumber: form.getFieldValue("challanNumber") || "",
        type: "Purchase Return Challan",
        paymentMode: values.paymentMode,
      };

      await axios.post("/api/purchase", payload);
      message.success("Purchase Return Challan Created Successfully");

      setChallanItems([]);
      addRow();
      setSupplierModal(false);
      setSelectedVendor(null);
    } catch (err) {
      message.error(err.response?.data?.message || "Failed to create purchase return challan");
    }
  };

  const columns = [
    {
      title: "Item",
      dataIndex: "name",
      render: (text, record) => (
        <Select
          showSearch
          placeholder="Select or type item"
          value={record.itemId}
          onChange={val => handleSelectItem(record.key, val)}
          filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
          style={{ width: "100%" }}
        >
          {itemsList.map(item => <Option key={item._id} value={item._id}>{item.name}</Option>)}
        </Select>
      ),
    },
    {
      title: "Qty",
      dataIndex: "qty",
      render: (text, record) => <InputNumber min={1} value={record.qty} onChange={val => handleRowChange(record.key, "qty", val)} />,
    },
    {
      title: "Unit",
      dataIndex: "unit",
      render: (text, record) => (
        <Select value={record.unit} style={{ width: "100%" }} onChange={val => handleRowChange(record.key, "unit", val)}>
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
      render: (text, record) => <InputNumber min={0} value={record.discount} onChange={val => handleRowChange(record.key, "discount", val)} />,
    },
    { title: "Total", dataIndex: "total", render: (text, record) => <span>₹{record.total?.toFixed(2) || 0}</span> },
    { title: "Action", render: (_, record) => <Button danger onClick={() => removeRow(record.key)}>Delete</Button> },
  ];

  return (
    <DefaultLayout>
      {/* Vendor dropdown + Date picker */}
      <div style={{ padding: 20, display: "flex", gap: 20, marginBottom: 16 }}>
        <Select
          placeholder="Select Vendor"
          style={{ width: 250 }}
          value={selectedVendor?.key}
          onChange={val => setSelectedVendor(vendors.find(v => v._id === val))}
        >
          {vendors.map(v => (
            <Option key={v._id} value={v._id}>
              {v.supplierName}
            </Option>
          ))}
        </Select>

        <DatePicker
          style={{ width: 200 }}
          value={purchaseDate}
          onChange={date => setPurchaseDate(date)}
        />
      </div>

      {/* Table + Summary */}
      <div style={{ display: "flex", gap: 20, padding: 20 }}>
        <div style={{ flex: 3 }}>
          <Table dataSource={challanItems} columns={columns} pagination={false} rowKey="key" />
        </div>

        <div style={{ flex: 1 }}>
          <Card title="Return Challan Summary">
            <p>Subtotal: ₹{subtotal.toFixed(2)}</p>
            <p>Discount %: <InputNumber min={0} max={100} value={discountPercent} onChange={setDiscountPercent} /></p>
            <p>Discount Amount: ₹{challanItems.reduce((acc, i) => acc + (i.discount || 0), 0).toFixed(2)}</p>
            <p>Shipping: <InputNumber min={0} value={shippingCharges} onChange={setShippingCharges} /></p>
            <p><strong>Final Total: ₹{finalTotal.toFixed(2)}</strong></p>
            <Button type="primary" onClick={handleSaveDraft} style={{ marginRight: 10 }}>Create Return Challan</Button>
            <Button danger onClick={() => setChallanItems([])}>Cancel</Button>
          </Card>
        </div>
      </div>

      {/* Modal: Only Payment Mode */}
      <Modal title="Payment Details" open={supplierModal} onCancel={() => setSupplierModal(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="paymentMode"
            label="Payment Method"
            rules={[{ required: true, message: "Select payment mode" }]}
          >
            <Select>
              <Option value="cash">Cash</Option>
              <Option value="card">Card</Option>
              <Option value="upi">UPI</Option>
            </Select>
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="primary" htmlType="submit">Confirm Challan</Button>
          </div>
        </Form>
      </Modal>
    </DefaultLayout>
  );
};

export default PurchaseReturnChallanTab;
