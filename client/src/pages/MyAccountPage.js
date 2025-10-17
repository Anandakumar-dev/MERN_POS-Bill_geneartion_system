
import React, { useEffect, useState } from "react";
import { Form, Input, Button, Card, message, Row, Col, Typography, Upload, } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import DefaultLayout from "../components/DefaultLayout";

const { Title, Text } = Typography;

export default function MyAccountPage() {
  const [form] = Form.useForm();
  const [logoUrl, setLogoUrl] = useState(null);

  const load = async () => {
    try {
      const { data } = await axios.get("/api/account");
      form.setFieldsValue(data || {});
      // if (data?.logo) setLogoUrl(data.logo);
      setLogoUrl(data?.logo || null); // ✅ always sync logo with state
    } catch (e) {
      message.error("Failed to load account");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onFinish = async (values) => {
    try {
      // merge logoUrl with other form values
      const payload = { ...values, logo: logoUrl };
      await axios.put("/api/account", payload);
      message.success("Saved!");
    } catch (e) {
      message.error("Save failed");
    }
  };

  // handle file upload manually (convert to Base64)
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const handleUpload = async ({ file }) => {
    const base64 = await getBase64(file);
    setLogoUrl(base64);
    message.success("Logo uploaded!");
  };

  return (
    <DefaultLayout>
      <Row justify="center" style={{ marginTop: -20 }}>
        <Col xs={24} sm={20} md={16} lg={10}>
          <Card
            // bordered={false}
            variant="borderless"
            style={{
              borderRadius: "12px",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
              padding: "25px",
            }}
          >
            <Title level={3} style={{ textAlign: "center", marginBottom: 5 }}>
              My Account
            </Title>
            <Text
              type="secondary"
              style={{
                display: "block",
                textAlign: "center",
                marginBottom: 25,
              }}
            >
              Manage your business profile and billing details
            </Text>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              size="large"
            >
              <Form.Item
                label="Business Name"
                name="businessName"
                rules={[{ required: true, message: "Please enter your business name" }]}
              >
                <Input placeholder="e.g. Corewize Solutions" />
              </Form.Item>

              {/* <Form.Item label="Tagline" name="tagline">
                <Input placeholder="e.g. (UNIT OF IT Tech solutions)" />
              </Form.Item> */}

              <Form.Item label="Address" name="address" rules={[{ required: true, }]}>
                <Input.TextArea
                  rows={1}
                  placeholder="Street, Area, City"
                />
              </Form.Item>

              <Form.Item label="Landmark" name="landmark" rules={[{ required: true, }]}>
                <Input placeholder="Near Rathna cafe" />
              </Form.Item>

              <Form.Item label="Gmail" name="gmail" rules={[{ required: true, }]}>
                <Input placeholder="example@gmail.com" />
              </Form.Item>


              {/* 🔹 Logo Upload */}
              {/* <Form.Item label="Business Logo" name="logo" rules={[{ required: true, }]}>
                <>
                  <Upload
                    accept="image/*"
                    showUploadList={false}
                    customRequest={handleUpload}
                  >
                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                  </Upload>
                  {logoUrl && (
                    <div style={{ marginTop: 10, textAlign: "center" }}>
                      <img
                        src={logoUrl}
                        alt="logo"
                        style={{ maxHeight: "80px", objectFit: "contain" }}
                      />
                    </div>
                  )}
                </>
              </Form.Item> */}

              <Form.Item label="Business Logo" name="logo" rules={[{ required: true }]}>
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  customRequest={handleUpload}
                >
                  <Button icon={<UploadOutlined />}>Click to Upload</Button>
                </Upload>
              </Form.Item>

              {logoUrl && (
                <Form.Item>
                  <div style={{ textAlign: "center" }}>
                    <img
                      src={logoUrl}
                      alt="logo"
                      style={{ maxHeight: "80px", objectFit: "contain" }}
                    />
                  </div>
                </Form.Item>
              )}

              {/* <Form.Item label="Phone" name="phone" rules={[{ required: true, }]}>
                <Input placeholder="044-43588000" />
              </Form.Item>

              <Form.Item label="Mobile" name="mobile">
                <Input placeholder="6383063273" />
              </Form.Item>

               <Form.Item label="GSTIN" name="gstin" rules={[{ required: true, }]}>
                <Input placeholder="AA3307250517157" />
              </Form.Item>

              <Form.Item label="Bank name" name="bankName" rules={[{ required: true, }]}>
                <Input placeholder="your bank name (ex:SBI, HDFC)" />
              </Form.Item>
              
              <Form.Item label="A/C No" name="accountNumber" rules={[{ required: true, }]}>
                <Input placeholder="20202727177" />
              </Form.Item>
              
              <Form.Item label="IFSC" name="ifsc" rules={[{ required: true, }]}>
                <Input placeholder="SBIN0000000" />
              </Form.Item>
              
              <Form.Item label="Branch" name="branch" rules={[{ required: true, }]}>
                <Input placeholder="Royapet" />
              </Form.Item> */}

              <Form.Item style={{ textAlign: "center", marginTop: 20 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{
                    padding: "8px 30px",
                    borderRadius: "8px",
                    fontWeight: "bold",
                  }}
                >
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </DefaultLayout>
  );
}
