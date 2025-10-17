// -------------------------------------------
// PurchaseBillingTab.js
// Fully functional Purchase Billing Tab (Enhanced Print Details)
// -------------------------------------------

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import DefaultLayout from "../../components/DefaultLayout";
import axios from "axios";
import { Table, Button, Modal, message } from "antd";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { useReactToPrint } from "react-to-print";

const PurchaseBillingTab = forwardRef((props, ref) => {
  const componentRef = useRef();
  const [billsData, setBillsData] = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);
  const [account, setAccount] = useState(null);
  const [printModalVisible, setPrintModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // -------------------- Fetch all purchase bills --------------------
  const getAllPurchaseBills = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/purchase/bills/all");
      setBillsData(data);
    } catch (err) {
      console.error("Fetch Purchase Bills Error:", err);
      message.error("Failed to fetch purchase bills");
    } finally {
      setLoading(false);
    }
  }, []);

  // Expose refresh function to parent via ref
  useImperativeHandle(ref, () => getAllPurchaseBills);

  // -------------------- Delete Bill --------------------
  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/purchase/bills/${id}`);
      message.success("Bill deleted successfully");
      getAllPurchaseBills();
    } catch (err) {
      console.error("Delete Purchase Bill Error:", err);
      message.error("Failed to delete bill");
    }
  };

  // -------------------- Fetch store account info --------------------
  const getAccount = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/account");
      setAccount(data);
    } catch (err) {
      console.error("Fetch Account Error:", err);
    }
  }, []);

  useEffect(() => {
    getAllPurchaseBills();
    getAccount();
  }, [getAllPurchaseBills, getAccount]);

  // -------------------- Print handler --------------------
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  // -------------------- Table Columns --------------------
  const columns = [
    {
      title: "Invoice ID",
      dataIndex: "_id",
      render: (id, record, index) => {
        const serial = String(index + 1).padStart(3, "0");
        const date = new Date(record.createdAt);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const fy =
          month >= 4
            ? `${year.toString().slice(-2)}-${(year + 1).toString().slice(-2)}`
            : `${(year - 1).toString().slice(-2)}-${year.toString().slice(-2)}`;
        return `PUR/${serial}/${fy}`;
      },
    },
    {
      title: "Supplier",
      dataIndex: "supplier",
      render: (supplier) => supplier?.supplierName || "N/A",
    },
    {
      title: "Bill Type",
      dataIndex: "type",
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      render: (val) => `₹${val.toFixed(2)}`,
    },
    {
      title: "Actions",
      dataIndex: "_id",
      render: (id, record) => (
        <div className="d-flex">
          <EyeOutlined
            className="mx-2"
            style={{ cursor: "pointer" }}
            onClick={() => {
              setSelectedBill(record);
              setPrintModalVisible(true);
            }}
          />
          <DeleteOutlined
            className="mx-2"
            style={{ color: "red", cursor: "pointer" }}
            onClick={() => handleDelete(record._id)}
          />
        </div>
      ),
    },
  ];

  return (
    <DefaultLayout>
      <h3 style={{ marginBottom: 20 }}>All Purchase Bills</h3>
      <Table
        columns={columns}
        dataSource={billsData}
        rowKey="_id"
        bordered
        loading={loading}
      />

      {/* -------------------- Print Modal -------------------- */}
      {selectedBill && (
        <Modal
          open={printModalVisible}
          onCancel={() => setPrintModalVisible(false)}
          footer={false}
          width={1000}
        >
          <div ref={componentRef} style={{ fontFamily: "monospace", padding: "10px" }}>
            {/* Store Header */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                {account?.logo && <img src={account.logo} alt="Logo" style={{ maxWidth: 100, maxHeight: 100 }} />}
                <h2>{account?.businessName}</h2>
                <p>{account?.address}</p>
                <p>{account?.landmark}</p>
                <p>{account?.gmail}</p>
                <p>{account?.phone}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p><b>Invoice:</b> {selectedBill._id}</p>
                <p><b>Date:</b> {new Date(selectedBill.purchaseDate || selectedBill.createdAt).toLocaleDateString()}</p>
                <p><b>Time:</b> {new Date(selectedBill.purchaseDate || selectedBill.createdAt).toLocaleTimeString()}</p>
                <p><b>Supplier:</b> {selectedBill.supplier?.supplierName || "N/A"}</p>
                <p><b>Supplier GST:</b> {selectedBill.GSTNumber || "N/A"}</p>
                <p><b>Bill Type:</b> {selectedBill.type || "Purchase"}</p>
              </div>
            </div>

            {/* Items Table */}
            <table style={{ width: "100%", borderCollapse: "collapse" }} border="1">
              <thead style={{ backgroundColor: "#29a629", color: "#fff" }}>
                <tr>
                  <th>#</th>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Rate</th>
                  <th>Discount</th>
                  <th>Tax %</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {selectedBill.items.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.qty} {item.unit || ""}</td>
                    <td>₹{item.rate.toFixed(2)}</td>
                    <td>{item.discount || 0}%</td>
                    <td>{item.taxPercent || 0}%</td>
                    <td>₹{item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total Summary */}
            <div style={{ marginTop: 20, textAlign: "right" }}>
              <p><b>Subtotal:</b> ₹{selectedBill.totalAmount.toFixed(2)}</p>
            </div>

            <div style={{ textAlign: "center", marginTop: 20 }}>
              *** THANK YOU | VISIT AGAIN ***
            </div>
          </div>

          <div style={{ marginTop: 10, textAlign: "right" }}>
            <Button type="primary" onClick={() => window.print()}>Print Bill</Button>
          </div>
        </Modal>
      )}
    </DefaultLayout>
  );
});

export default PurchaseBillingTab;
