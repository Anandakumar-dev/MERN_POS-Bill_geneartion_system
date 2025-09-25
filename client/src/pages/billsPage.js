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
    // {
    //   title: "Id",
    //   dataIndex: "_id",
    //   render: (id, record, index) => {
    //     // Generate serial no. (1-based, padded to 3 digits)
    //     const serial = String(index + 1).padStart(3, "0");

    //     // Financial year (this is hardcoded for 2025-26, you can make it dynamic)
    //     const finYear = "25-26";

    //     return `GST/${serial}/${finYear}`;
    //   },
    // },
    {
      title: "Id",
      dataIndex: "_id",
      render: (id, record) => {
        // find absolute index in billsData
        const index = billsData.findIndex(b => b._id === record._id);

        // Serial no. (1-based, padded to 3 digits)
        const serial = String(index + 1).padStart(3, "0");

        // Financial year (dynamic)
        const date = new Date(record.createdAt);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const fy = month >= 4 ? `${year.toString().slice(-2)}-${(year + 1).toString().slice(-2)}`
          : `${(year - 1).toString().slice(-2)}-${year.toString().slice(-2)}`;

        return `GST/${serial}/${fy}`;
      }
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

  const getInvoiceNumber = (bill, index) => {
    const serial = String(index + 1).padStart(3, "0"); // 001, 002 ...
    const finYear = "25-26"; // or make dynamic
    return `GST/${serial}/${finYear}`;
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
          <div className="p-3" ref={componentRef} style={{ fontFamily: "monospace" }}>
            <h3 style={{ textAlign: "center", marginBottom: "20px", marginTop: "20px" }}>TAX INVOICE</h3>
            {/* Header */}
            <div style={{
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              marginBottom: "10px",
              fontSize: "12px",
            }}>
              <div style={{ flex: 1, textAlign: "left" }}>
                <h2 style={{ margin: 0 }}>{account?.businessName || "Your Business Name"}</h2>
                <p style={{ margin: 0 }}>{account?.address || "Business Address"}</p>
                {/* <p style={{ margin: 0 }}>{account?.address1|| "Street / Area"}</p>
                <p style={{ margin: 0 }}>{account?.address2 || "City, State"}</p>
                <p style={{ margin: 0 }}>{account?.address3 || "Pincode"}</p> */}
                <p style={{ margin: 0 }}>
                  GSTIN: {account?.gstin || "XXXXXXXXXXXX"}
                </p>
                <p style={{ margin: 0 }}>
                  Phone: {account?.phone || ""} / {account?.mobile || ""}
                </p>
              </div>
              <div style={{ flex: 1, textAlign: "center" }}>
                {/* <p style={{ margin: 0 }}>Invoice No: {selectedBill.invoiceNumber || selectedBill._id}</p> */}
                <p style={{ margin: 0 }}>Invoice No: {getInvoiceNumber(selectedBill, billsData.findIndex(b => b._id === selectedBill._id))}</p>
                <p style={{ margin: 0 }}>
                  Date: {new Date(selectedBill.createdAt).toLocaleDateString("en-GB")}
                </p>
                <hr />
                <div style={{ textAlign: "left", margin: "0" }}>
                  <p style={{ margin: "0", marginLeft: "20px" }}>D.C. No  :</p>
                  <p style={{ margin: "0", marginLeft: "20px" }}>Cases  :</p>
                  <p style={{ margin: "0", marginLeft: "20px" }}>L.R. No  :</p>
                  <p style={{ margin: "0", marginLeft: "20px" }}>Transport  :</p>
                </div>
              </div>
              <div style={{ flex: 1, textAlign: "left" }}>
                {/* <h3 style={{ margin: 0 }}>CREDIT SALE INVOICE</h3> */}
                <p style={{ margin: "0", marginLeft: "10px", fontSize: "18px" }}><b>Cus.Name:{selectedBill.customerName}</b></p>
                <p style={{ margin: "0", marginLeft: "10px" }}>Customer Address:{selectedBill.customerAddress} </p>
                <p style={{ margin: "0", marginLeft: "10px" }}>G.S.T IN:{selectedBill.GSTNumber || "-"}</p>
                <p style={{ margin: "0", marginLeft: "10px" }}>D.L No:{selectedBill.customerDL || "-"}</p>
                {/* <p style={{ margin: "0", marginLeft:"20px" }}>Ship To:{selectedBill.shippingAddress || selectedBill.customerAddress || "-"}</p> */}
                <p style={{ margin: "0", marginLeft: "10px" }}>Ship To:{selectedBill.shippingAddress || "-"}</p>
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
                  <th style={{ border: "1px solid black", padding: "4px" }}>SNo</th>
                  <th style={{ border: "1px solid black", padding: "4px" }}>Description of goods/Services<br /> </th>
                  <th style={{ border: "1px solid black", padding: "4px" }}>HSN/SAC</th>
                  <th style={{ border: "1px solid black", padding: "4px" }}>Qty</th>
                  <th style={{ border: "1px solid black", padding: "4px" }}>Unit</th>
                  {/* <th>MRP</th> */}
                  <th style={{ border: "1px solid black", padding: "4px" }}>Rate (Excl Tax)</th>
                  <th style={{ border: "1px solid black", padding: "4px" }}>Disc %</th>
                  <th style={{ border: "1px solid black", padding: "4px" }}>Tax %</th>
                  <th style={{ border: "1px solid black", padding: "4px" }}>Amount</th>
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

                  // const baserate = item.price / ((100 + taxPercent) / 100);
                  // const rateExclTax = baserate - (baserate * discountPercent) / 100;
                  // const taxable = rateExclTax * quantity;
                  // const taxAmount = (taxable * taxPercent) / 100;
                  // const total = taxable + taxAmount;


                  return (
                    <tr key={index}>
                      <td style={{ border: "1px solid black", padding: "4px" }}>{index + 1}</td>
                      <td style={{ border: "1px solid black", padding: "4px" }} >{item.name}</td>
                      <td style={{ border: "1px solid black", padding: "4px" }}>{item.hsnCode || "-"}</td>
                      <td style={{ border: "1px solid black", padding: "4px" }}>{quantity}</td>
                      <td style={{ border: "1px solid black", padding: "4px" }}>{item.unit}</td>
                      {/* <td>{item.price.toFixed(2)}</td> */}
                      <td style={{ border: "1px solid black", padding: "4px" }}>{rateExclTax.toFixed(2)}</td>
                      <td style={{ border: "1px solid black", padding: "4px" }}>{discountPercent}</td>
                      <td style={{ border: "1px solid black", padding: "4px" }}>{taxPercent}</td>
                      <td style={{ border: "1px solid black", padding: "4px" }}>{total.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Totals */}
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between", fontSize: "13px", flexWrap: "wrap", gap: "10px", }}>
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

                  // const baseRate = Number(item.price) || 0;
                  // const discountedRate =
                  //   baseRate * (1 - (selectedBill.discountPercent || 0) / 100);
                  // const taxable = discountedRate * quantity;
                  // const taxAmount = (taxable * taxPercent) / 100;


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
                <table width="100%" border="1" style={{ fontSize: "12px", borderCollapse: "collapse", border: "1px solid black" }}>
                  <thead>
                    <tr style={{ background: "#f2f2f2" }}>
                      <th style={{ border: "1px solid black", padding: "4px" }}><u>TAX SUMMARY</u></th>
                      <th style={{ border: "1px solid black", padding: "4px" }}><u>TURNOVER AMT</u></th>
                      <th style={{ border: "1px solid black", padding: "4px" }}><u>SGST</u></th>
                      <th style={{ border: "1px solid black", padding: "4px" }}><u>SUMMARY</u></th>
                      <th style={{ border: "1px solid black", padding: "4px" }}><u>CGST</u></th>
                      <th style={{ border: "1px solid black", padding: "4px" }}><u>SUMMARY</u></th>
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
                            <td style={{ border: "1px solid black", padding: "4px" }}>GST-S@ {gst}%</td>
                            <td style={{ border: "1px solid black", padding: "4px" }}>₹{data.taxable.toFixed(2)}</td>
                            <td style={{ border: "1px solid black", padding: "4px" }}>{(gst / 2).toFixed(1)}%</td>
                            <td style={{ border: "1px solid black", padding: "4px" }}>₹{half.toFixed(2)}</td>
                            <td style={{ border: "1px solid black", padding: "4px" }}>{(gst / 2).toFixed(1)}%</td>
                            <td style={{ border: "1px solid black", padding: "4px" }}>₹{half.toFixed(2)}</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Right - Totals */}
              <div style={{ width: "35%", fontSize: "13px", border: "1px solid black", borderRadius: "5px", margin: "2px", padding: "10px" }}>
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
                      <p style={{ margin: "2px 0" }}>Sub Total: ₹{actualTotal.toFixed(2)}</p>
                      <p style={{ margin: "2px 0" }}>Turnover: ₹{turnoverAmount.toFixed(2)}</p>
                      <p style={{ margin: "2px 0" }}>Total SGST : ₹{sgst.toFixed(2)}</p>
                      <p style={{ margin: "2px 0" }}>Total CGST : ₹{cgst.toFixed(2)}</p>
                      <p style={{ margin: "2px 0" }}>Round Off : ₹{roundOff.toFixed(2)}</p>
                      <h3 style={{ margin: "5px 0" }}>Total : ₹{roundedTotal.toFixed(2)}</h3>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* BANK & SIGNATURE */}
            <div
              style={{
                marginTop: "40px",
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
              }}
            >
              {/* Left - Bank Details */}
              <div
                style={{
                  width: "48%",
                  border: "1px solid black",
                  padding: "10px",
                  borderRadius: "5px",
                }}
              >
                <p style={{ margin: "0 0 5px 0" }}><strong>Bank Details:</strong></p>
                <p style={{ margin: "0" }}>Bank: {account?.bankName || "Your Bank"}</p>
                <p style={{ margin: "0" }}>A/C No: {account?.accountNumber || "XXXXXXX"}</p>
                <p style={{ margin: "0" }}>IFSC: {account?.ifsc || "XXXXXXXX"}</p>
                <p style={{ margin: "0" }}>Branch: {account?.branch || "Main Branch"}</p>
                <p style={{ margin: "10px 0 0 0", textAlign: "right" }}><b> Receiver's Sign:</b></p>
              </div>

              {/* Right - Signatory */}
              <div
                style={{
                  width: "48%",
                  textAlign: "center",
                  border: "1px solid black",
                  padding: "10px",
                  borderRadius: "5px",
                }}
              >
                <p style={{ margin: "2px 0" }}>
                  For <strong>{account?.businessName || "Your Business"}</strong>
                </p>
                <br />
                <br />
                <p style={{ margin: "5px 0" }}>Authorised Signatory</p>
              </div>
            </div>

            {/* DISCLAIMER */}
            <dl style={{ fontSize: "11px", marginTop: "20px" }}>
              <dd style={{ fontWeight: "bold" }}>DISCLAIMER:</dd>
              <ul style={{ margin: "2px 0" }}>
                <li>Total invoice amount is due within 1 week from the date of billing.</li>
                <li>Charges are extra unless otherwise specified. Company is not responsible for delay, damage, or loss in transit.</li>
                <li>Once goods are delivered/received, they cannot be returned or exchanged under any circumstances.</li>
              </ul>
            </dl>
            <hr />
            <div>

            </div>
            <div style={{ textAlign: "center" }}>*** THANK YOU | VISIT AGAIN ***</div>

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
              Software by | Corewizesolutions.com | +91-6383063273
            </div>
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
