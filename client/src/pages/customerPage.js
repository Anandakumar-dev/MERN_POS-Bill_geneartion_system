/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout";
import axios from "axios";
import { useDispatch } from "react-redux";
import { Table, Modal, Form, Input, message } from "antd";

function Customers() {
  const [billsData, setBillsData] = useState([]);

  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const getAllBills = () => {
    dispatch({ type: "showLoading" });
    axios
      .get("/api/bills/get-bills")
      .then((response) => {
        dispatch({ type: "hideLoading" });
        const data = response.data;
        data.reverse();
        setBillsData(data);
      })
      .catch((error) => {
        dispatch({ type: "hideLoading" });
        console.log(error);
      });
  };

  const columns = [
    {
      title: "Customer",
      dataIndex: "customerName",
    },
    {
      title: "Phone Number",
      dataIndex: "customerNumber",
    },
    {
      title: "Created On",
      dataIndex: "createdAt",
      render: (value) => <span>{value.toString().substring(0, 10)}</span>,
    },
    {
      title: "Actions",
      render: (_, record) => (
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            setEditingCustomer(record);
            setIsModalVisible(true);
            form.setFieldsValue({
              customerName: record.customerName,
              customerNumber: record.customerNumber,
            });
          }}
        >
          Edit
        </button>
      ),
    }
  ];

  useEffect(() => {
    getAllBills();
  }, []);

  return (
    <DefaultLayout>
      <div className="d-flex justify-content-between">
        <h3>Customers</h3>
      </div>
      <Table
        columns={columns}
        dataSource={billsData.map((item) => ({
          ...item,
          key: item._id,
        }))}
        bordered
      />


      <Modal
        title="Edit Customer"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => {
          form
            .validateFields()
            .then(async (values) => {
              try {
                const changes = [];
                if (values.customerName !== editingCustomer.customerName) {
                  changes.push("Customer Name")
                }
                if (values.customerNumber !== editingCustomer.customerNumber) {
                  changes.push("Phone Number")
                }

                await axios.put(`/api/bills/update-customer/${editingCustomer._id}`, values);

                if (changes.length > 0) {
                  message.success(`${changes.join(" & ")} updated successfully`);
                }
                else {
                  message.info("no were updated")
                }
                setIsModalVisible(false);
                getAllBills();
              } catch (err) {
                message.error("Something went wrong while updating customer");
              }
            });
        }}
        okText="Update"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Customer Name"
            name="customerName"
            rules={[{ required: true, message: "Please enter customer name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Phone Number"
            name="customerNumber"
            rules={[{ required: true, message: "Please enter phone number" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </DefaultLayout>
  );

}

export default Customers;
