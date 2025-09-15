import React, { useEffect, useState } from "react";
import { Button, Form, Input, Switch } from "antd";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import { useDispatch } from "react-redux";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  const handleSubmit = async (value) => {
    dispatch({ type: "showLoading" });
    await axios
      .post("/api/users/login", value)
      .then((res) => {
        dispatch({ type: "hideLoading" });
        message.success("Login Successfully");
        localStorage.setItem("auth", JSON.stringify(res.data.data));
        navigate("/");
      })
      .catch(() => {
        dispatch({ type: "hideLoading" });
        message.error("Login Failed");
      });
  };

  useEffect(() => {
    if (localStorage.getItem("auth")) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  return (
    <div className="register-page">
      <div className="form-container">
        <div className="brand-block">
          <img src="/cws.jpg" alt="Logo" className="brand-logo" />
          <div className="brand-tagline">POS Billing System</div>
        </div>
        <h3 className="form-title">Login</h3>

        {/* Dark Mode Toggle */}
        <div style={{ textAlign: "right", marginBottom: "10px" }}>
          <span style={{ marginRight: "8px", fontSize: "12px" }}>
            Dark Mode
          </span>
          <Switch
            checked={darkMode}
            onChange={(checked) => setDarkMode(checked)}
          />
        </div>

        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="userId" label="User ID">
            <Input className="form-input" />
          </Form.Item>
          <Form.Item name="password" label="Password">
            <Input type="password" className="form-input" />
          </Form.Item>
          <Button type="primary" htmlType="submit" className="form-button">
            Login
          </Button>
        </Form>
        <div className="form-footer">
          Not registered?
          <Link to="/register" className="form-link">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
