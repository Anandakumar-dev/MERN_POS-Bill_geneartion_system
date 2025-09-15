import React, { useEffect, useState } from "react";
import { Button, Form, Input, Switch } from "antd";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { message } from "antd";
import { useDispatch } from "react-redux";
import "./Register.css";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  const handleSubmit = async (value) => {
    dispatch({ type: "showLoading" });
    axios
      .post("/api/users/register", value)
      .then((res) => {
        dispatch({ type: "hideLoading" });
        message.success(
          "Registration successful, please wait for verification"
        );
        navigate("/login");
      })
      .catch(() => {
        dispatch({ type: "hideLoading" });
        message.error("Something went wrong");
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
          <h2 className="brand-tagline">
            Your Trusted POS Software - CoreWize Solutions
          </h2>
        </div>

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

        <h3 className="form-title">Register</h3>
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Username">
            <Input className="form-input" />
          </Form.Item>
          <Form.Item name="userId" label="User ID">
            <Input className="form-input" />
          </Form.Item>
          <Form.Item name="password" label="Password">
            <Input type="password" className="form-input" />
          </Form.Item>
          <div className="form-footer">
            <p>
              Already Registered?
              <Link to="/login" className="form-link">
                Login Here!
              </Link>
            </p>
            <Button htmlType="submit" className="form-button">
              Register
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Register;
