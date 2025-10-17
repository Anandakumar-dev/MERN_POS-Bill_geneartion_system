
// --------- all category added ----------
import React, { useState, useEffect } from "react";
import DefaultLayout from "../components/DefaultLayout.js";
import axios from "axios";
import { Col, Row, Input } from "antd";
import ItemList from "../components/ItemList.js";
import { useDispatch } from "react-redux";

const Homepage = () => {
  const [itemsData, setitemsData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState(""); // ✅ Search state
  const dispatch = useDispatch();

  // ✅ Fetch items
  useEffect(() => {
    const getAllItems = async () => {
      try {
        dispatch({ type: "SHOW_LOADING" });
        const { data } = await axios.get("/api/items/get-item");
        setitemsData(data);
        dispatch({ type: "HIDE_LOADING" });
      } catch (error) {
        console.log(error);
      }
    };
    getAllItems();
  }, [dispatch]);

  // ✅ Fetch categories with "All"
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get("/api/categories/get-all");
        const formattedCategories = [{ name: "All" }, ...data];
        setCategories(formattedCategories);
        setSelectedCategory("all");
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // ✅ Filtered Items
  const filteredItems = itemsData.filter((i) => {
    const matchesCategory =
      selectedCategory === "all"
        ? true
        : i.category?.toLowerCase() === selectedCategory;

    const matchesSearch =
      i.name?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <DefaultLayout>
      {/* ✅ Search Bar */}
      <Input.Search
        placeholder="Search item by name"
        allowClear
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginTop: -5, border:"none" }}
      />

      {/* category section */}
      <div className="category-section">
        {categories.map((category) => (
          <div
            key={category.name}
            className={`category ${selectedCategory === category.name.toLowerCase() ? "category-active" : ""
              }`}
            onClick={() => setSelectedCategory(category.name.toLowerCase())}
          >
            <h4 className="m-0">{category.name}</h4>
          </div>
        ))}
      </div>

      {/* ✅ Items Grid */}
      <Row gutter={[16, 16]}>
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <Col xs={24} lg={6} md={12} sm={6} key={item._id}>
              <ItemList item={item} />
            </Col>
          ))
        ) : (
          <div style={{ marginTop: 20, fontSize: "16px", color: "#888" }}>
            No items found.
          </div>
        )}
      </Row>
    </DefaultLayout>
  );
};

export default Homepage;

