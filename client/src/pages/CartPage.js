import React, { useState, useEffect } from "react";
import DefaultLayout from "../components/DefaultLayout";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  DeleteOutlined,
  PlusSquareOutlined,
  MinusSquareOutlined,
} from "@ant-design/icons";
import {
  Button,
  Table,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
} from "antd";

const CartPage = () => {
  const { cartItems } = useSelector((state) => state.rootReducer);
  const [subTotal, setSubTotal] = useState(0);
  const [billPopUp, setBillPopUp] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(30);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleIncrement = (record) => {
    const updatedItem = { ...record, quantity: record.quantity + 1 };
    dispatch({ type: "UPDATE_CART", payload: updatedItem });
  };

  const handleDecrement = (record) => {
    if (record.quantity > 1) {
      const updatedItem = { ...record, quantity: record.quantity - 1 };
      dispatch({ type: "UPDATE_CART", payload: updatedItem });
    }
  };

  const handleDelete = (record) => {
    dispatch({ type: "DELETE_FROM_CART", payload: record });
  };

  const columns = [
    { title: "Name", dataIndex: "name" },
    {
      title: "Quantity",
      render: (_, record) => (
        <div>
          <MinusSquareOutlined
            className="mx-2"
            style={{ cursor: "pointer" }}
            onClick={() => handleDecrement(record)}
          />
          <InputNumber 
          min={1}
          value={record.quantity}
          onChange={(val)=>{
            if(val>0){
              const updatedItem ={...record, quantity:val};
              dispatch({type:"UPDATE_CART", payload:updatedItem })
            }
          }}
          style={{width:"70px", textAlign:"center",  }}
          />
          {/* <b>{record.quantity}</b> */}
          <PlusSquareOutlined
            className="mx-2"
            style={{ cursor: "pointer" }}
            onClick={() => handleIncrement(record)}
          />
        </div>
      ),
    },
    {
      title: "Price",
      render: (_, record) => `₹ ${record.price}`,
    },
    {
      title: "Tax (%)",
      render: (_, record) => `${record.taxPercent || 0}%`,
    },
    {
      title: "Amount",
      render: (_, record) => {
        const taxPercent = Number(record.taxPercent || 0);
        const basePrice = Number(record.price || 0);
        const quantity = Number(record.quantity || 0);
        const discount = Number(discountPercent || 0);

        if (!basePrice || !quantity) return "₹ 0.00";

        const discountedPrice = basePrice * (1 - discount / 100);
        const taxAmount = (discountedPrice * taxPercent) / 100;
        const finalRate = discountedPrice + taxAmount;
        const totalAmount = finalRate * quantity;

        return `₹ ${totalAmount.toFixed(2)}`;
      },
    },
    {
      title: "Actions",
      render: (_, record) => (
        <DeleteOutlined
          style={{ cursor: "pointer" }}
          onClick={() => handleDelete(record)}
        />
      ),
    },
  ];

  useEffect(() => {
    const fetchUpdatedCartItems = async () => {
      const updatedCart = await Promise.all(
        cartItems.map(async (item) => {
          try {
            const { data } = await axios.get(`/api/items/get-item/${item._id}`);
            return { ...item, taxPercent: data.taxPercent };
          } catch (err) {
            return item;
          }
        })
      );
      dispatch({ type: "SET_CART", payload: updatedCart });
    };

    fetchUpdatedCartItems();
  }, [cartItems, dispatch]);

  useEffect(() => {
    const total = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setSubTotal(total);
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const getGSTSummary = () => {
    const gstSummary = {};
    cartItems.forEach((item) => {
      const taxPercent = item.taxPercent || 0;
      const discountedPricePerUnit = item.price * (1 - discountPercent / 100);
      const taxAmountPerUnit = (discountedPricePerUnit * taxPercent) / 100;
      const totalTax = taxAmountPerUnit * item.quantity;

      if (!gstSummary[taxPercent]) gstSummary[taxPercent] = 0;
      gstSummary[taxPercent] += totalTax;
    });
    return gstSummary;
  };

  const handleSubmit = async (values) => {
    if (cartItems.length === 0) {
      return message.warning("Cart is empty");
    }

    const discountAmount = subTotal * (discountPercent / 100);
    const afterDiscount = subTotal - discountAmount;

    const gstSummary = getGSTSummary();
    const totalTax = Object.values(gstSummary).reduce((acc, val) => acc + val, 0);
    const roundOff = (
      Math.round(afterDiscount + totalTax) - (afterDiscount + totalTax)
    ).toFixed(2);
    const finalTotal = Math.round(afterDiscount + totalTax);

    const reqObject = {
      customerName: values.customerName,
      customerNumber: values.customerNumber,
      customerAddress: values.customerAddress,
      GSTNumber: values.GSTNumber,
      customerDL: values.customerDL,
      shippingAddress: values.shippingAddress,
      paymentMode: values.paymentMode,
      discountPercent: discountPercent,
      cartItems,
      afterDiscount,
      totalDiscount: discountAmount,
      roundOff,
      subTotal,
      tax: Number(totalTax.toFixed(2)),
      totalAmount: finalTotal,
      userId: JSON.parse(localStorage.getItem("auth"))?._id,
    };

    try {
      await axios.post("/api/bills/add-bill", reqObject);
      console.log(reqObject)
      message.success("Bill Generated Successfully");
      dispatch({ type: "CLEAR_CART" });
      navigate("/bills");
    } catch (error) {
      console.error("Billing error:", error.message);
      message.error("Billing Failed");
    }
  };

  const discountAmount = subTotal * (discountPercent / 100);
  const afterDiscount = subTotal - discountAmount;
  const gstSummary = getGSTSummary();
  const totalTax = Object.values(gstSummary).reduce((acc, val) => acc + val, 0);
  const roundOff = (
    Math.round(afterDiscount + totalTax) - (afterDiscount + totalTax)
  ).toFixed(2);
  const finalTotal = Math.round(afterDiscount + totalTax);

  return (
    <DefaultLayout>
      <h1>Cart Page</h1>
      <Table dataSource={cartItems} columns={columns} rowKey="_id" bordered />

      <div className="d-flex flex-column align-items-end">
        <h3>Sub Total: ₹ {subTotal.toFixed(2)}</h3>
        <Button type="primary" onClick={() => setBillPopUp(true)}>
          Create Invoice
        </Button>
      </div>

      <Modal
        title="Create Invoice"
        open={billPopUp}
        onCancel={() => setBillPopUp(false)}
        footer={false}
      >
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="customerName"
            label="Customer Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="customerNumber"
            label="Customer Number"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="customerAddress"
            label="Customer Address"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="GSTNumber"
            label="GST Number"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="paymentMode"
            label="Payment Method"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="cash">Cash</Select.Option>
              <Select.Option value="card">Card</Select.Option>
              <Select.Option value="upi">UPI</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Discount (%)">
            <InputNumber
              min={0}
              max={100}
              value={discountPercent}
              onChange={(val) => setDiscountPercent(val)}
            />
          </Form.Item>

          <div className="bill mt-3">
            <h6>Subtotal: ₹ <b>{subTotal.toFixed(2)}</b></h6>
            <h6>Discount ({discountPercent}%): ₹ <b>{discountAmount.toFixed(2)}</b></h6>
            <h6>After Discount: ₹ <b>{afterDiscount.toFixed(2)}</b></h6>
            {Object.entries(gstSummary).map(([rate, value]) => (
              <h6 key={rate}>{rate}% GST: ₹ <b>{value.toFixed(2)}</b></h6>
            ))}
            <h6>Total Tax: ₹ <b>{totalTax.toFixed(2)}</b></h6>
            <h6>Round Off: ₹ <b>{roundOff}</b></h6>
            <h4>Final Total: ₹ <b>{finalTotal}</b></h4>
          </div>

          <div className="d-flex justify-content-end">
            <Button type="primary" htmlType="submit">
              Generate Bill
            </Button>
          </div>
        </Form>
      </Modal>
    </DefaultLayout>
  );
};

export default CartPage;





