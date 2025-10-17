import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, message, Popconfirm } from "antd";
import axios from "axios";
import DefaultLayout from "../../components/DefaultLayout";

const Vendor = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [form] = Form.useForm();

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/vendors");
      setVendors(data);
      setLoading(false);
    } catch (err) {
      message.error("Failed to fetch vendors");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleAddEdit = (vendor) => {
    setEditingVendor(vendor || null);
    form.resetFields();
    if (vendor) {
      form.setFieldsValue(vendor);
    }
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/vendors/${id}`);
      message.success("Vendor deleted successfully");
      fetchVendors();
    } catch (err) {
      message.error("Failed to delete vendor");
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingVendor) {
        await axios.put(`/api/vendors/${editingVendor._id}`, values);
        message.success("Vendor updated successfully");
      } else {
        await axios.post("/api/vendors", values);
        message.success("Vendor added successfully");
      }
      setModalVisible(false);
      fetchVendors();
    } catch (err) {
      message.error("Failed to save vendor");
    }
  };

  const columns = [
    { title: "Name", dataIndex: "supplierName", key: "name" },
    { title: "Number", dataIndex: "supplierNumber", key: "number" },
    { title: "Address", dataIndex: "supplierAddress", key: "address" },
    { title: "GST Number", dataIndex: "GSTNumber", key: "gst" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Mobile", dataIndex: "mobileNumber", key: "mobile" },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button type="primary" onClick={() => handleAddEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure delete this vendor?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <DefaultLayout>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => handleAddEdit(null)}>
          Add Vendor
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={vendors}
        rowKey={(record) => record._id}
        loading={loading}
      />

      <Modal
        title={editingVendor ? "Edit Vendor" : "Add Vendor"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Supplier Name"
            name="supplierName"
            rules={[{ required: true, message: "Please enter supplier name" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Supplier Number"
            name="supplierNumber"
            rules={[{ required: true, message: "Please enter supplier number" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Supplier Address"
            name="supplierAddress"
            rules={[{ required: true, message: "Please enter supplier address" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="GST Number" name="GSTNumber">
            <Input />
          </Form.Item>

          <Form.Item label="Email" name="email">
            <Input type="email" />
          </Form.Item>

          <Form.Item label="Mobile Number" name="mobileNumber">
            <Input />
          </Form.Item>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button type="primary" htmlType="submit">
              {editingVendor ? "Update Vendor" : "Add Vendor"}
            </Button>
          </div>
        </Form>
      </Modal>
    </DefaultLayout>
  );
};

export default Vendor;
