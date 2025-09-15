// components/BillPreview.js

import React from "react";
import { Table } from "antd";
import "./BillPreview.css"; // Optional for custom print styling

const BillPreview = ({ invoiceData }) => {
  const {
    invoiceNumber,
    invoiceDate,
    customer,
    seller,
    items,
    summary,
    bankDetails
  } = invoiceData;

  const columns = [
    {
      title: "S.No",
      dataIndex: "sno",
      render: (_, __, index) => index + 1,
    },
    { title: "Description", dataIndex: "description" },
    { title: "HSN/SAC", dataIndex: "hsn" },
    { title: "Qty", dataIndex: "quantity" },
    { title: "Unit", dataIndex: "unit" },
    { title: "Rate (Incl. Tax)", dataIndex: "rateWithTax" },
    { title: "Rate", dataIndex: "rateWithoutTax" },
    { title: "Disc %", dataIndex: "discountPercent" },
    { title: "Tax %", dataIndex: "taxPercent" },
    { title: "Amount", dataIndex: "amount" },
  ];

  return (
    <div className="invoice-wrapper" style={{ padding: "20px", background: "#fff", fontFamily: "monospace" }}>
      {/* Header */}
      <h2 style={{ textAlign: "center" }}>{seller.name}</h2>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <p>{seller.address}</p>
          <p>Phone: {seller.phone}</p>
          <p>Email: {seller.email}</p>
          <p>GSTIN: {seller.gstin}</p>
        </div>
        <div>
          <p><b>Invoice No:</b> {invoiceNumber}</p>
          <p><b>Date:</b> {new Date(invoiceDate).toLocaleDateString()}</p>
          <p><b>DL No:</b> {customer?.dlNo || "N/A"}</p>
        </div>
      </div>

      {/* Buyer Info */}
      <hr />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div><b>To:</b> {customer.name}<br />{customer.address}<br />GSTIN: {customer.gstin}</div>
        <div><b>Phone:</b> {customer.phone}</div>
      </div>

      {/* Items Table */}
      <Table
        columns={columns}
        dataSource={items}
        pagination={false}
        rowKey={(record, index) => index}
        style={{ marginTop: "20px" }}
        bordered
      />

      {/* Summary */}
      <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
        <div>
          <p><b>Total Items:</b> {summary.totalItems}</p>
          <p><b>Total Quantity:</b> {summary.totalQuantity}</p>
          <p><b>Gross:</b> ₹{summary.grossAmount.toFixed(2)}</p>
          <p><b>Round Off:</b> ₹{summary.roundOff.toFixed(2)}</p>
        </div>
        <div>
          <p><b>Sub Total:</b> ₹{summary.subtotal.toFixed(2)}</p>
          <p><b>CGST:</b> ₹{summary.totalCGST.toFixed(2)}</p>
          <p><b>SGST:</b> ₹{summary.totalSGST.toFixed(2)}</p>
          <h3><b>Grand Total:</b> ₹{summary.grandTotal.toFixed(2)}</h3>
        </div>
      </div>

      {/* Bank & Footer */}
      <hr />
      <p><b>Bank:</b> {bankDetails.bankName} | A/C: {bankDetails.accountNo} | IFSC: {bankDetails.ifsc} | Branch: {bankDetails.branch}</p>
      <div style={{ marginTop: "40px", display: "flex", justifyContent: "space-between" }}>
        <p>Receiver's Sign</p>
        <p>For {seller.name} <br /> Authorised Signatory</p>
      </div>
    </div>
  );
};

export default BillPreview;
