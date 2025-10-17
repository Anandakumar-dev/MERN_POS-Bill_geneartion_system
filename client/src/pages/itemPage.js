
// -------------------------------------------

import React, { useCallback, useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout";
import { useDispatch } from "react-redux";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Checkbox,
  Popconfirm,
  message,
  List,
} from "antd";
import axios from "axios";

const ItemPage = () => {
  const dispatch = useDispatch();
  const [itemsData, setItemsData] = useState([]);
  const [popupModel, setPopupModel] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryMap, setCategoryMap] = useState({}); // name to id mapping

  // 🔁 Fetch items
  const getAllItems = useCallback(async () => {
    try {
      dispatch({ type: "SHOW_LOADING" });
      const { data } = await axios.get("/api/items/get-item");
      setItemsData(data);
      dispatch({ type: "HIDE_LOADING" });
    } catch (error) {
      console.error("Failed to fetch items:", error);
      dispatch({ type: "HIDE_LOADING" });
    }
  }, [dispatch]);

  // 🔁 Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await axios.get("/api/categories/get-all");
      setCategories(res.data);
      const mapping = {};
      res.data.forEach((cat) => (mapping[cat.name] = cat._id));
      setCategoryMap(mapping);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  useEffect(() => {
    getAllItems();
    fetchCategories();
  }, [getAllItems]);

  useEffect(() => {
    if (!popupModel) return;
    if (editItem) {
      form.setFieldsValue(editItem);
    } else {
      form.resetFields();
    }
  }, [editItem, form, popupModel]);

  // ✅ Add category (case-insensitive)
  const handleAddCategory = async () => {
    if (!categoryName) return;

    const alreadyExists = categories.some(
      (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
    );

    if (alreadyExists) {
      message.error("Category already exists");
      return;
    }

    try {
      await axios.post("/api/categories/add-category", { name: categoryName });
      await fetchCategories();
      setCategoryModalVisible(false);
      setCategoryName("");
      message.success("Category added successfully");
    } catch (error) {
      if (error.response?.status === 400) {
        message.error("Category already exists");
      } else {
        console.error("Category add failed:", error);
        message.error("Failed to add category");
      }
    }
  };

  // ✅ Delete category by _id
  const handleDeleteCategory = async (categoryName) => {
    const id = categoryMap[categoryName];
    if (!id) return message.error("Invalid category");

    try {
      await axios.delete(`/api/categories/${id}`);
      message.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      message.error("Failed to delete category");
    }
  };

  const deleteItem = async (record) => {
    try {
      dispatch({ type: "SHOW_LOADING" });
      await axios.post("/api/items/delete-item", { itemId: record._id });
      message.success("Item deleted successfully");
      getAllItems();
      dispatch({ type: "HIDE_LOADING" });
    } catch (error) {
      console.error("Failed to delete item:", error);
      message.error("Something went wrong");
      dispatch({ type: "HIDE_LOADING" });
    }
  };

  const handleSubmit = async (values) => {
    try {
      dispatch({ type: "SHOW_LOADING" });

      if (editItem === null) {
        await axios.post("/api/items/add-item", values);
        message.success("Item added successfully");
      } else {
        await axios.put("/api/items/edit-item", {
          ...values,
          itemId: editItem._id,
          isStockAddition: values.isStockAddition || false,
        });
        message.success("Item updated successfully");
      }

      setPopupModel(false);
      setEditItem(null);
      getAllItems();
      dispatch({ type: "HIDE_LOADING" });
    } catch (error) {
      console.error("Failed to submit item:", error);
      message.error(values.name + " already exists or failed");
      dispatch({ type: "HIDE_LOADING" });
    }
  };

  const handleNonNegativeChange = (field) => (e) => {
    const value = parseFloat(e.target.value);
    form.setFieldsValue({
      [field]: isNaN(value) || value < 0 ? 0 : value,
    });
  };

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "HSN Code", dataIndex: "hsnCode" },
    { title: "Rate", dataIndex: "price" },
    { title: "Stock", dataIndex: "stockQuantity" },
    {
      title: "Actions",
      dataIndex: "_id",
      render: (id, record) => (
        <div className="d-flex">
          <EditOutlined
            className="mx-2"
            onClick={() => {
              setEditItem(record);
              setPopupModel(true);
            }}
          />
          <Popconfirm
            title="Are you sure to delete this item?"
            onConfirm={() => deleteItem(record)}
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

  return (
    <DefaultLayout>
      <div className="d-flex justify-content-between mb-2">
        <h2>Item Management</h2>
        <div>
          <Button
            icon={<PlusOutlined />}
            className="me-2"
            onClick={() => setCategoryModalVisible(true)}
          >
            Add Category
          </Button>
          <Button
            type="primary"
            onClick={() => {
              setEditItem(null);
              setPopupModel(true);
            }}
          >
            Add Item
          </Button>
        </div>
      </div>

      <Table dataSource={itemsData} columns={columns} bordered rowKey="_id" />

      {/* Add/Edit Item Modal */}
      <Modal
        title={editItem ? "Edit Item" : "Add New Item"}
        open={popupModel}
        onCancel={() => {
          setEditItem(null);
          setPopupModel(false);
        }}
        footer={false}
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item name="name" label="Item Name" rules={[{ required: true }]}>
            <Input disabled={editItem !== null} />
          </Form.Item>
          <Form.Item name="hsnCode" label="HSN Code" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          {/* <Form.Item name="image" label="Image URL" rules={[{ message: "Please enter image URL" }]}>
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item> */}
          <Form.Item name="stockQuantity" label="Stock Quantity" rules={[{ required: true }]}>
            <Input type="number" min={0} onChange={handleNonNegativeChange("stockQuantity")} />
          </Form.Item>
          <Form.Item name="unit" label="Unit" rules={[{ required: true }]}>
            <Select placeholder="Select unit">
              <Select.Option value="pcs">pcs</Select.Option>
              <Select.Option value="kg">kg</Select.Option>
              <Select.Option value="carton">carton</Select.Option>
              <Select.Option value="litre">litre</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="price" label="Rate" rules={[{ required: true }]}>
            <Input type="number" min={0} step="0.01" onChange={handleNonNegativeChange("price")} />
          </Form.Item>
          <Form.Item name="taxPercent" label="Tax (%)" rules={[{ required: true }]}>
            <Input type="number" min={0} onChange={handleNonNegativeChange("taxPercent")} />
          </Form.Item>
          {editItem && (
            <Form.Item name="isStockAddition" valuePropName="checked">
              <Checkbox>Add quantity to existing stock</Checkbox>
            </Form.Item>
          )}
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select placeholder="Select Category">
              {categories.map((cat) => (
                <Select.Option key={cat._id} value={cat.name}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <div className="d-flex justify-content-end">
            <Button type="primary" htmlType="submit">Save</Button>
          </div>
        </Form>
      </Modal>

      {/* Category Modal */}
      <Modal
        title="Add New Category"
        open={categoryModalVisible}
        onCancel={() => setCategoryModalVisible(false)}
        onOk={handleAddCategory}
        okText="Add"
      >
        <Input
          placeholder="Enter category name"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value.trim())}
        />

        <div style={{ marginTop: "16px" }}>
          <h5>Existing Categories</h5>
          <List
            bordered
            dataSource={categories.map((c) => c.name)}
            renderItem={(category) => (
              <List.Item
                actions={[
                  <Popconfirm
                    title="Are you sure to delete this category?"
                    onConfirm={() => handleDeleteCategory(category)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="text" icon={<DeleteOutlined />} danger />
                  </Popconfirm>,
                ]}
              >
                {category}
              </List.Item>
            )}
          />
        </div>
      </Modal>
    </DefaultLayout>
  );
};

export default ItemPage;