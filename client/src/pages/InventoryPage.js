import React, { useEffect, useState } from "react";
import DefaultLayout from "../components/DefaultLayout";
import { Table, Card, Row, Col, Tag } from "antd";
import axios from "axios";
import { Button } from "antd";

const InventoryPage = () => {
  const [items, setItems] = useState([]);

  const fetchItems = async () => {
    try {
      const { data } = await axios.get("/api/items/get-item");
      console.log("Fetched items: ", data);
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error.message);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const columns = [
    { title: "Item", dataIndex: "name" },
    { title: "Category", dataIndex: "category" },
    { title: "Price", dataIndex: "price" },
    {
      title: "Stock",
      dataIndex: "stockQuantity",
      render: (stock) => {
        if (typeof stock !== "number") return <Tag color="default">N/A</Tag>;
        return (
          <Tag color={stock === 0 ? "red" : stock < 10 ? "orange" : "green"}>
            {stock}
          </Tag>
        );
      },
    },
  ];

  const totalItems = items.length;
  const totalCategories = [...new Set(items.map((item) => item.category))].length;
  const lowStockItems = items.filter((item) => item.stockQuantity < 10).length;
  const outOfStock = items.filter((item) => item.stockQuantity === 0).length;

  return (
    <DefaultLayout>
      <h2>Inventory Overview</h2>
      <Button onClick={fetchItems} type="primary" style={{ marginBottom: "16px" }}>
        Refresh Inventory
      </Button>

      <Row gutter={16} className="my-3">
        <Col span={6}>
          <Card title="Total Items" variant="borderless">
            {totalItems}
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Categories" variant="borderless">
            {totalCategories}
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Low Stock (&lt;10)" variant="borderless">
            {lowStockItems}
          </Card>
        </Col>
        <Col span={6}>
          <Card title="Out of Stock" variant="borderless">
            {outOfStock}
          </Card>
        </Col>
      </Row>

      <Table columns={columns} dataSource={items} rowKey="_id" bordered />
    </DefaultLayout>
  );
};

export default InventoryPage;
