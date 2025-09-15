// import React, { useEffect } from "react";
// import { Form, Input, Button, Card, message } from "antd";
// import axios from "axios";
// import DefaultLayout from "../components/DefaultLayout";

// export default function MyAccountPage() {
//   const [form] = Form.useForm();

//   const load = async () => {
//     try {
//       const { data } = await axios.get("/api/account");
//       form.setFieldsValue(data || {});
//     } catch (e) {
//       message.error("Failed to load account");
//     }
//   };

//   useEffect(() => { load(); }, []);

//   const onFinish = async (values) => {
//     try {
//       await axios.put("/api/account", values);
//       message.success("Saved!");
//     } catch (e) {
//       message.error("Save failed");
//     }
//   };

//   return (
//     <DefaultLayout >
//       <Card  title="My Account" style={{ maxWidth: 720 }}>
//         <Form form={form} layout="vertical" onFinish={onFinish}>
//           <Form.Item label="Business Name" name="businessName" rules={[{ required: true }]}>
//             <Input placeholder="e.g. Corewize Solutions" />
//           </Form.Item>
//           <Form.Item label="Tagline" name="tagline">
//             <Input placeholder="e.g. (UNIT OF IT Tech solutions)" />
//           </Form.Item>
//           <Form.Item label="Address" name="address">
//             <Input.TextArea rows={3} placeholder="Street, Area, City" />
//           </Form.Item>
//           <Form.Item label="Landmark" name="landmark">
//             <Input placeholder="Near Rathna cafe" />
//           </Form.Item>
//           <Form.Item label="Phone" name="phone">
//             <Input placeholder="044-43588000" />
//           </Form.Item>
//           <Form.Item label="Mobile" name="mobile">
//             <Input placeholder="6383063273" />
//           </Form.Item>
//           <Form.Item label="GSTIN" name="gstin">
//             <Input placeholder="AA3307250517157" />
//           </Form.Item>
//           <Button type="primary" htmlType="submit">Save</Button>
//         </Form>
//       </Card>
//     </DefaultLayout>
//   );
// }


import React, { useEffect } from "react";
import { Form, Input, Button, Card, message, Row, Col, Typography } from "antd";
import axios from "axios";
import DefaultLayout from "../components/DefaultLayout";

const { Title, Text } = Typography;

export default function MyAccountPage() {
  const [form] = Form.useForm();

  const load = async () => {
    try {
      const { data } = await axios.get("/api/account");
      form.setFieldsValue(data || {});
    } catch (e) {
      message.error("Failed to load account");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onFinish = async (values) => {
    try {
      await axios.put("/api/account", values);
      message.success("Saved!");
    } catch (e) {
      message.error("Save failed");
    }
  };

  return (
    <DefaultLayout>
      <Row justify="center" style={{ marginTop: -20 }}>
        <Col xs={24} sm={20} md={16} lg={10}>
          <Card
            bordered={false}
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

              <Form.Item label="Tagline" name="tagline">
                <Input placeholder="e.g. (UNIT OF IT Tech solutions)" />
              </Form.Item>

              <Form.Item label="Address" name="address">
                <Input.TextArea
                  rows={3}
                  placeholder="Street, Area, City"
                />
              </Form.Item>

              <Form.Item label="Landmark" name="landmark">
                <Input placeholder="Near Rathna cafe" />
              </Form.Item>

              <Form.Item label="Phone" name="phone">
                <Input placeholder="044-43588000" />
              </Form.Item>

              <Form.Item label="Mobile" name="mobile">
                <Input placeholder="6383063273" />
              </Form.Item>

              <Form.Item label="GSTIN" name="gstin">
                <Input placeholder="AA3307250517157" />
              </Form.Item>

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
