//  ---------- second ------------

import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  Button,
  Modal,
  message,
  Input,
  Space,
  Select,
} from "antd";
import DefaultLayout from "../components/DefaultLayout";
import { useNavigate } from "react-router-dom";

const { Option } = Select;

function QuickAccess() {
  const [customerName, setCustomerName] = useState("");
  const [bills, setBills] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [editedItems, setEditedItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [allItems, setAllItems] = useState([]);
  const navigate = useNavigate();

  const [subTotal, setSubTotal] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [afterDiscount, setAfterDiscount] = useState(0);
  const [totalGST, setTotalGST] = useState(0);
  const [roundOff, setRoundOff] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  // Calculate totals whenever editedItems or discountPercent changes
  useEffect(() => {
    let subTotalCalc = 0;
    let gstCalc = 0;

    editedItems.forEach((item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const taxPercent = Number(item.taxPercent) || 0;

      // Tax-exclusive price
      const basePrice = (price * 100) / (100 + taxPercent);

      subTotalCalc += basePrice * qty;
    });

    const discountAmt = subTotalCalc * (discountPercent / 100);
    const afterDiscountCalc = subTotalCalc - discountAmt;

    // Calculate GST on discounted price
    editedItems.forEach((item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const taxPercent = Number(item.taxPercent) || 0;

      const basePrice = (price * 100) / (100 + taxPercent);
      const priceAfterDiscount = basePrice * (1 - discountPercent / 100);

      gstCalc += (priceAfterDiscount * taxPercent / 100) * qty;
    });

    const exactTotal = afterDiscountCalc + gstCalc;
    const finalTotalCalc = Math.round(exactTotal);
    const roundOffCalc = finalTotalCalc - exactTotal;

    setSubTotal(subTotalCalc);
    setDiscountAmount(discountAmt);
    setAfterDiscount(afterDiscountCalc);
    setTotalGST(gstCalc);
    setFinalTotal(finalTotalCalc);
    setRoundOff(roundOffCalc);
  }, [editedItems, discountPercent]);

  useEffect(() => {
    axios
      .get("/api/items/get-item")
      .then((res) => setAllItems(res.data))
      .catch((err) => {
        console.error("Error fetching items:", err);
        message.error("Failed to load item list.");
      });
  }, []);

  const fetchBills = async () => {
    try {
      const res = await axios.get(
        `/api/quickbilling/last-5/${encodeURIComponent(customerName)}`
      );
      setBills(res.data);
    } catch (err) {
      console.error("Error fetching bills:", err);
      message.error("Failed to fetch bills.");
    }
  };

  const openEditModal = (bill) => {
    setSelectedBill(bill);
    setEditedItems(bill.cartItems || []);
    setDiscountPercent(bill.discountPercent || 0);
    setIsModalOpen(true);
  };

  const handleItemUpdate = (index, field, value) => {
    const updated = [...editedItems];
    if (field === "name") {
      updated[index].name = value;
      const selected = allItems.find((item) => item.name === value);
      updated[index].price = selected?.price || 0;
      updated[index].taxPercent = selected?.taxPercent || 0;
    } else {
      updated[index][field] =
        field === "quantity" || field === "price" ? Number(value) : value;
    }
    setEditedItems(updated);
  };

  const handleItemDelete = (index) => {
    const updated = [...editedItems];
    updated.splice(index, 1);
    setEditedItems(updated);
  };

  const addNewItem = () => {
    setEditedItems([...editedItems, { name: "", quantity: 1, price: 0, taxPercent: 0 }]);
  };

  const handleGenerateBill = async () => {
    if (
      editedItems.some(
        (item) => !item.name || item.quantity <= 0 || item.price < 0
      )
    )
      return message.error(
        "Please ensure all items have valid name, quantity, and price."
      );

    try {
      const cartItems = editedItems.map((item) => {
        const match = allItems.find((i) => i.name === item.name);
        return {
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          taxPercent: match?.taxPercent || 0,
          hsnCode:match?.hsnCode || "",
          unit:match?.unit || "",
          discountPercent,
        };
      });

      const payload = {
        cartItems,
        customerName: selectedBill.customerName || "QuickAccess User",
        customerNumber: selectedBill.customerNumber || "0000000000",
        paymentMode: selectedBill.paymentMode || "QuickAccess",
        customerAddress: selectedBill?.customerAddress || "N/A",
        GSTNumber: selectedBill?.GSTNumber || "N/A",

        subTotal: subTotal.toFixed(2),
        discountPercent,
        discountAmount: discountAmount.toFixed(2),
        afterDiscount: afterDiscount.toFixed(2),
        tax: totalGST.toFixed(2),
        roundOff: roundOff.toFixed(2),
        totalAmount: finalTotal.toFixed(2),
      };

      // await axios.post(`/api/quickbilling/clone/${selectedBill._id}`, payload);
      await axios.post(`api/quickbilling/clone/${selectedBill?._id}`, payload);

      message.success("New bill generated successfully!");
      setIsModalOpen(false);
      navigate("/bills");
    } catch (err) {
      console.error("Error generating bill:", err.message, err);
      message.error("Failed to generate new bill.");
    }
  };

  const columns = [
    {
      title: "Date & Time",
      dataIndex: "createdAt",
      render: (val) => {
        if (!val) return "-";
        const date = new Date(val);
        const pad = (n) => (n < 10 ? `0${n}` : n);
        return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ` +
          `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
      },
    },
    // { title: "Date", dataIndex: "createdAt", render: (val) => new Date(val).toLocaleDateString() },
    { title: "Customer", dataIndex: "customerName" },
    { title: "Mobile", dataIndex: "customerNumber" },
    { title: "Total", dataIndex: "totalAmount" },
    { title: "Action", render: (_, record) => <Button type="link" onClick={() => openEditModal(record)}>Edit & Clone</Button> },
  ];

  const uniqueItems = Array.from(new Map(allItems.map((item) => [item.name, item])).values())
    .filter((item) => item.stockQuantity > 0);

  return (
    <DefaultLayout>
      <h3>🔁 Quick Access - Reuse Past Bills</h3>
      <Space className="mb-3">
        <Input placeholder="Enter Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        <Button type="primary" onClick={fetchBills}>Search</Button>
      </Space>

      <Table dataSource={bills} columns={columns} rowKey={(record) => record._id} bordered pagination={false} />

      <Modal open={isModalOpen} title="🛒 Edit Bill Items" onCancel={() => setIsModalOpen(false)} onOk={handleGenerateBill} okText="Generate Bill" width={800}>

        {editedItems.map((item, index) => (
          <div className="d-flex mb-2 gap-2" key={index}>
            <Select showSearch style={{ width: 200 }} placeholder="Select Item" value={item.name} onChange={(value) => handleItemUpdate(index, "name", value)} filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
              {uniqueItems.map((i) => <Option key={i.name} value={i.name}>{i.name} ({i.stockQuantity} left)</Option>)}
            </Select>

            <Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => handleItemUpdate(index, "quantity", e.target.value)} />
            <Input placeholder="Amount" value={(item.quantity * item.price).toFixed(2)} disabled />
            <Button danger onClick={() => handleItemDelete(index)}>Delete</Button>
          </div>
        ))}
        {/* i want here the discount option */}

        <div className="d-flex justify-content-end align-items-center gap-2 my-2">
          <span>Discount %:</span>
          <Input
            type="number"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(Number(e.target.value))}
            style={{ width: 80 }}
            min={0}
            max={100}
          />
        </div>

        <div className="text-end fw-bold mt-2">
          <div>Qty: {editedItems.reduce((sum, item) => sum + item.quantity, 0)}</div>
          <div>Sub Total: ₹{subTotal.toFixed(2)}</div>
          <div>Discount ({discountPercent}%): ₹{discountAmount.toFixed(2)}</div>
          <div>After Discount: ₹{afterDiscount.toFixed(2)}</div>
          <div>GST: ₹{totalGST.toFixed(2)}</div>
          <div>Round Off: ₹{roundOff.toFixed(2)}</div>
          <strong style={{ fontSize: "1.1rem" }}>Grand Total: ₹{finalTotal.toFixed(2)}</strong>
        </div>

        <Button type="dashed" onClick={addNewItem} block>➕ Add Item</Button>
      </Modal>
    </DefaultLayout>
  );
}

export default QuickAccess;

