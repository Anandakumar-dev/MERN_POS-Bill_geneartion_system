// ----------- simplified version ------------
import React, { useEffect, useState } from "react";
import { Layout, Menu, Button, theme } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  UnorderedListOutlined,
  BarChartOutlined,
  AppstoreOutlined,
  IdcardOutlined,
  ThunderboltOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";

import "../styles/DefaultLayout.css";
import Spinner from "./Spinner";

const { Header, Sider, Content } = Layout;

const DefaultLayout = ({ children }) => {
  const navigate = useNavigate();
  const { cartItems, loading } = useSelector((state) => state.rootReducer);
  const [collapsed, setCollapsed] = useState(false);
  const [storedUser, setStoredUser] = useState(null);

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // ✅ Load user from localStorage
  useEffect(() => {
    try {
      const data = localStorage.getItem("auth");
      if (data) {
        setStoredUser(JSON.parse(data));
      }
    } catch (err) {
      console.error("Error parsing auth from localStorage", err);
    }
  }, []);

  // ✅ Persist cart items
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // ✅ Simple menu items (like Code X)
  const menuItems = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: <Link to="/">Home</Link>,
    },
    {
      key: "/dashboard",
      icon: <BarChartOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: "/quick-access",
      icon: <ThunderboltOutlined />,
      label: <Link to="/quick-access">Quick Access</Link>,
    },
    {
      key: "/bills",
      icon: <FileTextOutlined />,
      label: <Link to="/bills">Billing</Link>,
    },
    {
      key: "/items",
      icon: <UnorderedListOutlined />,
      label: <Link to="/items">Items</Link>,
    },
    {
      key: "/customers",
      icon: <UserOutlined />,
      label: <Link to="/customers">My Customers</Link>,
    },
    {
      key: "/inventory",
      icon: <AppstoreOutlined />,
      label: <Link to="/inventory">Inventory</Link>,
    },
    {
      key: "/employee",
      icon: <UserOutlined />,
      label: <Link to="/employee">Employees</Link>,
    },

    // -------------------- Purchase --------------------
    {
      key: "/purchase",
      icon: <ShoppingCartOutlined />,
      label: "Purchase",
      children: [
        { key: "/purchase/dashboard", label: <Link to="/purchase/dashboard">Purchase Dashboard</Link> },
        { key: "/purchase/order", label: <Link to="/purchase/order">Purchase Order</Link> },
        { key: "/purchase/challan", label: <Link to="/purchase/challan">Purchase Challan</Link> },
        { key: "/purchase/return", label: <Link to="/purchase/return">Purchase Return</Link> },
        { key: "/purchase/return-challan", label: <Link to="/purchase/return-challan">Purchase Return Challan</Link> },
        { key: "/purchase/vendor", label: <Link to="/purchase/vendor">Vendor</Link> },
        { key: "/purchase/purchase-billing", label: <Link to="/purchase/purchase-billing">Purchase Billing</Link> },
      ],
    },

    // -------------------- Sales --------------------
    {
      key: "/sales",
      icon: <ShoppingCartOutlined />,
      label: "Sales",
      children: [
        { key: "/sales/dashboard", label: <Link to="/sales/dashboard">Sales Dashboard</Link> },
        { key: "/sales/order", label: <Link to="/sales/order">Sales Order</Link> },
        { key: "/sales/challan", label: <Link to="/sales/challan">Sales Challan</Link> },
        { key: "/sales/return", label: <Link to="/sales/return">Sales Return</Link> },
        { key: "/sales/return-challan", label: <Link to="/sales/return-challan">Sales Return Challan</Link> },
      ],
    },
    {
      key: "/my-account",
      icon: <IdcardOutlined />,
      label: <Link to="/my-account">My Account</Link>,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: () => {
        localStorage.removeItem("auth");
        navigate("/login");
      },
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {loading && <Spinner />}

      {/* Sidebar */}
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo">
          <img src="/CWW.jpg" alt="Logo" className="brand-logo" />
        </div>
        <div className="demo-logo-vertical text-center mt-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={32}
            height={32}
            viewBox="0 0 24 24"
            className="text-white inline-block"
            fill="currentColor"
            style={{ margin: "20px" }}>
            <g fill="none" fillRule="evenodd">
              <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"></path>
              <path fill="currentColor" d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m1 2.062V5a1 1 0 0 1-1.993.117L11 5v-.938a8.005 8.005 0 0 0-6.902 6.68L4.062 11H5a1 1 0 0 1 .117 1.993L5 13h-.938a8.001 8.001 0 0 0 15.84.25l.036-.25H19a1 1 0 0 1-.117-1.993L19 11h.938a7.98 7.98 0 0 0-2.241-4.617l-2.424 4.759l-.155.294l-.31.61c-.37.72-.772 1.454-1.323 2.005c-.972.971-2.588 1.089-3.606.07c-1.019-1.018-.901-2.634.07-3.606c.472-.472 1.078-.835 1.696-1.162l.919-.471l.849-.444l4.203-2.135A7.98 7.98 0 0 0 13 4.062m.162 6.776l-.21.112l-.216.113c-.402.209-.822.426-1.172.698l-.201.17l-.073.084c-.193.26-.135.554.003.692s.432.196.692.003l.086-.074l.168-.2c.217-.28.4-.605.571-.93l.127-.242q.112-.22.225-.426"></path>
            </g>
          </svg>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[window.location.pathname]}
          items={menuItems}
        />
      </Sider>

      {/* Main Layout */}
      <Layout>
        {/* Header */}
        <Header
          style={{
            padding: "0 16px",
            background: colorBgContainer,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 64,
          }}
        >
          {/* Left: Collapse Button */}
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16, width: 50, height: 50, color: "white" }}
          />

          {/* Center: Greeting */}
          <div style={{ fontSize: 16, fontWeight: 500, color: "coral" }}>
            {storedUser?.name ? `Hi, ${storedUser.name} Welcome ` : "Welcome"}
          </div>

          {/* Right: Cart */}
          <div
            className="cart-item"
            onClick={() => navigate("/cart")}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            <p style={{ margin: 0 }}>{cartItems.length}</p>
            <svg xmlns="http://www.w3.org/2000/svg"
              width={24} height={24} viewBox="0 0 24 24">
              <path fill="currentColor" fillRule="evenodd" d="M8.418 3.25c.28-.59.884-1 1.582-1h4c.698 0 1.301.41 1.582 1c.683.006 1.216.037 1.692.223a3.25 3.25 0 0 1 1.426 1.09c.367.494.54 1.127.776 1.998l.742 2.722l.28.841l.024.03c.901 1.154.472 2.87-.386 6.301c-.546 2.183-.818 3.274-1.632 3.91c-.814.635-1.939.635-4.189.635h-4.63c-2.25 0-3.375 0-4.189-.635c-.814-.636-1.087-1.727-1.632-3.91c-.858-3.431-1.287-5.147-.386-6.301l.024-.03l.28-.841l.742-2.722c.237-.871.41-1.505.776-1.999a3.25 3.25 0 0 1 1.426-1.089c.476-.186 1.008-.217 1.692-.222m.002 1.502c-.662.007-.928.032-1.148.118a1.75 1.75 0 0 0-.768.587c-.176.237-.28.568-.57 1.635l-.57 2.089C6.384 9 7.778 9 9.684 9h4.631c1.907 0 3.3 0 4.32.18l-.569-2.089c-.29-1.067-.394-1.398-.57-1.635a1.75 1.75 0 0 0-.768-.587c-.22-.086-.486-.111-1.148-.118A1.75 1.75 0 0 1 14 5.75h-4a1.75 1.75 0 0 1-1.58-.998" clipRule="evenodd">
              </path>
            </svg>
            {/* <ShoppingCartOutlined /> */}
          </div>
        </Header>

        {/* Page Content */}
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children || <div>No content available</div>}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DefaultLayout;