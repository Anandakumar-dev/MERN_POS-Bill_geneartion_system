import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function InvoicePage() {
  const { id } = useParams();
  const [bill, setBill] = useState(null);

  useEffect(() => {
    axios.get(`/api/bills/${id}`)
      .then(res => { setBill(res.data) })
      .catch(err => {
        console.error("Failed to fetch invoice", err);
      });
  }, [id]);

  if (!bill) return <div>Loading invoice...</div>;

  return (
    <div className="invoice">
      <h2>Invoice for {bill.customerName}</h2>
      <p>Mobile: {bill.customerNumber}</p>
      <ul>
        {bill.cartItems.map((item, index) => (
          <li key={index}>{item.name} - Qty: {item.quantity} x ₹{item.price}</li>
        ))}
      </ul>
      <p>Subtotal: ₹{Number(bill.subTotal).toFixed(2)}</p>
      <p>Tax: ₹{Number(bill.tax).toFixed(2)}</p>
      <h3>Total: ₹{Number(bill.totalAmount).toFixed(2)}</h3>
    </div>
  );
}

export default InvoicePage;

