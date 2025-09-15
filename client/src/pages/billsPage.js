import React, { useEffect, useRef, useState, useCallback } from "react";
import DefaultLayout from "../components/DefaultLayout";
import axios from "axios";
import { EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Modal, Table, Popconfirm, message } from "antd";
import { useReactToPrint } from "react-to-print";

function Bills() {
  const componentRef = useRef();
  const [billsData, setBillsData] = useState([]);
  const [printBillModalVisibility, setPrintBillModalVisibilty] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [account, setAccount] = useState(null);

  const getAllBills = useCallback(async () => {
    try {
      const response = await axios.get("/api/bills/get-bills");
      setBillsData(response.data);
    } catch (err) {
      console.error("Error fetching bills:", err);
    }
  }, []);

  const getAccount = useCallback(async () => {
    try {
      const { data } = await axios.get("/api/account");
      setAccount(data);
    } catch (err) {
      console.error("Error fetching account info:", err);
    }
  }, []);

  useEffect(() => {
    getAllBills();
    getAccount();
  }, [getAllBills, getAccount]);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const columns = [
    {
      title: "Id",
      dataIndex: "_id",
    },
    {
      title: "Customer",
      dataIndex: "customerName",
    },
    {
      title: "Tax",
      dataIndex: "tax",
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
    },
    {
      title: "Actions",
      dataIndex: "_id",
      render: (id, record) => (
        <div className="d-flex">
          <EyeOutlined
            className="mx-2"
            onClick={() => {
              setSelectedBill(record);
              setPrintBillModalVisibilty(true);
            }}
          />
          <Popconfirm
            title="Are you sure to delete this bill?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <DeleteOutlined
              className="mx-2"
              style={{ color: "red", fontSize: "18px", cursor: "pointer" }}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/bills/delete-bill/${id}`);
      message.success("Bill deleted successfully");
      getAllBills();
    } catch (error) {
      console.error(error);
      message.error("Failed to delete bill");
    }
  };

  const calculateBillStats = (bill) => {
    let totalItems = bill.cartItems?.length || 0;
    let totalQty = 0;
    let gross = 0;

    (bill.cartItems || []).forEach((item) => {
      const qty = Number(item.quantity) || 0;
      totalQty += qty;
      gross += (Number(item.price) || 0) * qty;
    });

    return { totalItems, totalQty, gross };
  };

  return (
    <DefaultLayout>
      <div className="d-flex justify-content-between">
        <h3>All Bills</h3>
      </div>
      <Table columns={columns} dataSource={billsData} bordered />

      {printBillModalVisibility && selectedBill && (
        <Modal
          onCancel={() => setPrintBillModalVisibilty(false)}
          open={printBillModalVisibility}
          title="Invoice Preview"
          footer={false}
          width={1000}
        >
          <h3 style={{ textAlign: "center" }}>CREDIT SALE INVOICE</h3>
          <div className="p-3" ref={componentRef} style={{ fontFamily: "monospace" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ margin: 0 }}>{account?.businessName || "Your Business Name"}</h2>
                <p style={{ margin: 0 }}>{account?.address || "Business Address"}</p>
                <p style={{ margin: 0 }}>
                  GSTIN: {account?.gstin || "XXXXXXXXXXXX"}
                </p>
                <p style={{ margin: 0 }}>
                  Phone: {account?.phone || ""} / {account?.mobile || ""}
                </p>
              </div>
              <div>
                <p style={{ margin: 0 }}>Invoice No: {selectedBill.invoiceNumber || selectedBill._id}</p>
                <p style={{ margin: 0 }}>
                  Date: {new Date(selectedBill.createdAt).toLocaleDateString()}
                </p>
                <hr />
                <p style={{ margin: 0 }}>D.C. No  :</p>
                <p style={{ margin: 0 }}>D.C. Date  :</p>
                <p style={{ margin: 0 }}>Cases  :</p>
                <p style={{ margin: 0 }}>L.R. No  :</p>
                <p style={{ margin: 0 }}>Transport  :</p>
              </div>
              <div >
                {/* <h3 style={{ margin: 0 }}>CREDIT SALE INVOICE</h3> */}
                <p>customer Name:{selectedBill.customerName }</p>
                <p>customer Address:</p>
                <p>G.S.T IN:</p>
                <p>D.L No:</p>
                <p>Ship To:</p>
              </div>
            </div>

            <hr />

            {/* Items Table */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "10px",
                fontSize: "12px",
              }}
              border="1"
            >
              <thead>
                <tr style={{ background: "#f2f2f2" }}>
                  <th>SNo</th>
                  <th>Description of goods/Services<br /> </th>
                  <th>HSN/SAC</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>Rate (Incl Tax)</th>
                  <th>Rate (Excl Tax)</th>
                  <th>Disc %</th>
                  <th>Tax %</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {selectedBill.cartItems.map((item, index) => {
                  const taxPercent = item.taxPercent || 0;
                  const quantity = item.quantity || 0;
                  const discountPercent = selectedBill.discountPercent || 0;

                  const baserate = item.price / ((100 + taxPercent) / 100);
                  const rateExclTax = baserate - (baserate * discountPercent) / 100;
                  const taxable = rateExclTax * quantity;
                  const taxAmount = (taxable * taxPercent) / 100;
                  const total = taxable + taxAmount;

                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.name}</td>
                      <td>{item.hsnCode || "-"}</td>
                      <td>{quantity}</td>
                      <td>PCS</td>
                      <td>{item.price.toFixed(2)}</td>
                      <td>{rateExclTax.toFixed(2)}</td>
                      <td>{discountPercent}</td>
                      <td>{taxPercent}</td>
                      <td>{total.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", fontSize: "13px", flexWrap: "wrap", gap: "20px" }}>
              {(() => {
                const { totalItems, totalQty, gross } = calculateBillStats(selectedBill);

                // Recalculate totals (same as in TAX SUMMARY area)
                let totalTax = 0;
                let turnoverAmount = 0;

                (selectedBill.cartItems || []).forEach((item) => {
                  const quantity = Number(item.quantity) || 0;
                  const taxPercent = Number(item.taxPercent) || 0;
                  const rateExclTax = item.price / ((100 + taxPercent) / 100);
                  const discountedRate =
                    rateExclTax -
                    (rateExclTax * (selectedBill.discountPercent || 0)) / 100;
                  const taxable = discountedRate * quantity;
                  const taxAmount = (taxable * taxPercent) / 100;
                  turnoverAmount += taxable;
                  totalTax += taxAmount;
                });

                const sgst = totalTax / 2;
                const cgst = totalTax / 2;
                const actualTotal = turnoverAmount + sgst + cgst;
                const roundedTotal = Math.round(actualTotal);
                const roundOff = roundedTotal - actualTotal;

                return (
                  <>
                    <p>Total Items : {totalItems}</p>
                    <p>Qty : {totalQty}</p>
                    <p>Gross : ₹{gross.toFixed(2)}</p>
                    <p>Due Date: </p>
                    <p>Salesman: Direct</p>
                    <p>Round Off : ₹{roundOff.toFixed(2)}</p>
                  </>
                );
              })()}
            </div>

            {/* TAX SUMMARY & TOTALS */}

            <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
              {/* Left - Tax Summary */}
              <div style={{ width: "60%" }}>
                <table width="100%" border="1" style={{ fontSize: "12px", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th><u>TAX SUMMARY</u></th>
                      <th><u>TURNOVER AMT</u></th>
                      <th><u>SGST</u></th>
                      <th><u>SUMMARY</u></th>
                      <th><u>CGST</u></th>
                      <th><u>SUMMARY</u></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const groupedTaxes = {};
                      (selectedBill.cartItems || []).forEach((item) => {
                        const quantity = Number(item.quantity) || 0;
                        const taxPercent = Number(item.taxPercent) || 0;
                        const rateExclTax = item.price / ((100 + taxPercent) / 100);
                        const discountedRate =
                          rateExclTax - (rateExclTax * (selectedBill.discountPercent || 0)) / 100;
                        const taxable = discountedRate * quantity;
                        const taxAmount = (taxable * taxPercent) / 100;

                        if (!groupedTaxes[taxPercent]) {
                          groupedTaxes[taxPercent] = { taxable: 0, taxAmount: 0 };
                        }
                        groupedTaxes[taxPercent].taxable += taxable;
                        groupedTaxes[taxPercent].taxAmount += taxAmount;
                      });

                      return Object.entries(groupedTaxes).map(([gst, data], idx) => {
                        const half = data.taxAmount / 2;
                        return (
                          <tr key={idx}>
                            <td>GST-S@ {gst}%</td>
                            <td>₹{data.taxable.toFixed(2)}</td>
                            <td>{(gst / 2).toFixed(1)}%</td>
                            <td>₹{half.toFixed(2)}</td>
                            <td>{(gst / 2).toFixed(1)}%</td>
                            <td>₹{half.toFixed(2)}</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Right - Totals */}
              <div style={{ width: "35%", fontSize: "13px" }}>
                {(() => {
                  let totalTax = 0;
                  let turnoverAmount = 0;

                  (selectedBill.cartItems || []).forEach((item) => {
                    const quantity = Number(item.quantity) || 0;
                    const taxPercent = Number(item.taxPercent) || 0;
                    const rateExclTax = item.price / ((100 + taxPercent) / 100);
                    const discountedRate =
                      rateExclTax - (rateExclTax * (selectedBill.discountPercent || 0)) / 100;
                    const taxable = discountedRate * quantity;
                    const taxAmount = (taxable * taxPercent) / 100;
                    turnoverAmount += taxable;
                    totalTax += taxAmount;
                  });

                  const sgst = totalTax / 2;
                  const cgst = totalTax / 2;

                  const actualTotal = turnoverAmount + sgst + cgst;
                  const roundedTotal = Math.round(actualTotal);
                  const roundOff = roundedTotal - actualTotal;

                  return (
                    <>
                      <p>Sub Total: ₹{actualTotal.toFixed(2)}</p>
                      <p>Turnover: ₹{turnoverAmount.toFixed(2)}</p>
                      <p>Total SGST : ₹{sgst.toFixed(2)}</p>
                      <p>Total CGST : ₹{cgst.toFixed(2)}</p>
                      <p>Round Off : ₹{roundOff.toFixed(2)}</p>
                      <h3>Total : ₹{roundedTotal.toFixed(2)}</h3>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* BANK & SIGNATURE */}
            <div >
              <div style={{marginTop:"40px", fontSize:"12px", textAlign:"center"}}>
                <p><strong>Bank Details:</strong></p>
                <p>Bank: {account?.bankName || "Your Bank"}</p>
                <p>A/C No: {account?.accountNumber || "XXXXXXX"}</p>
                <p>IFSC: {account?.ifsc || "XXXXXXXX"}</p>
                <p>Branch: {account?.branch || "Main Branch"}</p>
                <p>Receiver's Sign:</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p>For <strong>{account?.businessName || "Your Business"}</strong></p>
                <br /><br />
                <p>Authorised Signatory</p>
              </div>
            </div>

            <hr />
            <div style={{ textAlign: "center" }}>*** THANK YOU | VISIT AGAIN ***</div>
          </div>

          
          {/* ✅ Footer: Software Creator Info */}
          <div style={{
            position: "absolute",
            bottom: "10px",
            left: "30px",
            fontSize: "15px",
            color: "#555",
            fontFamily: "monospace",
            fontWeight: "bold"
          }}>
            Software by | Corewizesolutions.com | +91-638306327312
          </div>

          <div className="d-flex justify-content-end mt-2">
            <Button type="primary" onClick={handlePrint}>
              Print Bill
            </Button>
          </div>
        </Modal>
      )}
    </DefaultLayout>
  );
}

export default Bills;




