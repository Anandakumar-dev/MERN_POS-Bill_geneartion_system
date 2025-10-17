// import React, { useEffect, useState } from "react";
// import {
//   Table,
//   Button,
//   Modal,
//   Form,
//   Input,
//   Collapse,
//   Select,
//   Upload,
//   Row,
//   Col,
//   Typography,
//   message,
// } from "antd";
// import { PlusOutlined, UploadOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
// import axios from "axios";
// import DefaultLayout from "../components/DefaultLayout";

// const { Panel } = Collapse;
// const { Title } = Typography;
// const { Option } = Select;

// export default function EmployeePage() {
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [editingEmployee, setEditingEmployee] = useState(null);
//   const [form] = Form.useForm();
//   const [photoUrl, setPhotoUrl] = useState(null);

//   const loadEmployees = async (query = {}) => {
//     try {
//       setLoading(true);
//       const params = {};
//       if (query.search) params.search = query.search;
//       if (query.department) params.department = query.department;
//       if (query.position) params.position = query.position;

//       const { data } = await axios.get("/api/employees", { params });
//       setEmployees(data);
//     } catch (e) {
//       console.error("loadEmployees error:", e, e?.response?.data);
//       const friendly = e?.response?.data?.message || e.message || "Failed to fetch employees";
//       message.error(friendly);
//     } finally {
//       setLoading(false);
//     }
//   };


//   useEffect(() => {
//     loadEmployees();
//   }, []);

//   const openModal = (employee = null) => {
//     setEditingEmployee(employee);
//     if (employee) {
//       form.setFieldsValue(employee);
//       setPhotoUrl(employee.photo || null);
//     } else {
//       form.resetFields();
//       setPhotoUrl(null);
//     }
//     setModalVisible(true);
//   };

//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`/api/employees/${id}`);
//       message.success("Employee deleted");
//       loadEmployees();
//     } catch (e) {
//       message.error("Delete failed");
//     }
//   };

//   const getBase64 = (file) =>
//     new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => resolve(reader.result);
//       reader.onerror = (error) => reject(error);
//     });

//   const handleUpload = async ({ file }) => {
//     const base64 = await getBase64(file);
//     setPhotoUrl(base64);
//     message.success("Photo uploaded!");
//   };

//   const onFinish = async (values) => {
//     try {
//       const payload = { ...values, photo: photoUrl };
//       if (editingEmployee) {
//         await axios.put(`/api/employees/${editingEmployee._id}`, payload);
//         message.success("Employee updated");
//       } else {
//         await axios.post("/api/employees", payload);
//         message.success("Employee added");
//       }
//       setModalVisible(false);
//       loadEmployees();
//     } catch (e) {
//       message.error("Save failed");
//     }
//   };

//   const columns = [
//     {
//       title: "Name",
//       dataIndex: "name",
//       key: "name",
//     },
//     {
//       title: "Department",
//       dataIndex: "department",
//       key: "department",
//     },
//     {
//       title: "Position",
//       dataIndex: "position",
//       key: "position",
//     },
//     {
//       title: "Actions",
//       key: "actions",
//       render: (_, record) => (
//         <>
//           <Button
//             icon={<EditOutlined />}
//             size="small"
//             onClick={() => openModal(record)}
//             style={{ marginRight: 5 }}
//           />
//           <Button
//             icon={<DeleteOutlined />}
//             size="small"
//             danger
//             onClick={() => handleDelete(record._id)}
//           />
//         </>
//       ),
//     },
//   ];

//   return (
//     <DefaultLayout>
//       <div style={{ padding: 20 }}>
//         <Row justify="space-between" align="middle" style={{ marginBottom: 20 }}>
//           <Title level={3}>Employee Details</Title>
//           <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
//             Add Employee
//           </Button>
//         </Row>

//         <Table
//           columns={columns}
//           dataSource={employees}
//           rowKey="_id"
//           loading={loading}
//         />

//         <Modal
//           visible={modalVisible}
//           title={editingEmployee ? "Edit Employee" : "Add Employee"}
//           onCancel={() => setModalVisible(false)}
//           footer={null}
//           width={700}
//         >
//           <Form layout="vertical" form={form} onFinish={onFinish}>
//             <Collapse defaultActiveKey={["1"]}>
//               <Panel header="Contact Information" key="1">
//                 <Form.Item
//                   label="Name"
//                   name="name"
//                   rules={[{ required: true, message: "Please enter name" }]}
//                 >
//                   <Input />
//                 </Form.Item>
//                 <Form.Item label="Phone" name="phone">
//                   <Input />
//                 </Form.Item>
//                 <Form.Item label="Email" name="email">
//                   <Input type="email" />
//                 </Form.Item>
//                 <Form.Item label="Gender" name="Gender">
//                   <Input type="Gender" />
//                 </Form.Item>
//                 <Form.Item label="Address" name="address">
//                   <Input />
//                 </Form.Item>
//               </Panel>

//               <Panel header="Identification Details" key="2">
//                 <Form.Item label="Date of Birth" name="dob">
//                   <Input type="date" />
//                 </Form.Item>
//                 <Form.Item label="ID Number" name="idNumber">
//                   <Input />
//                 </Form.Item>
//               </Panel>

//               <Panel header="Employment Data" key="3">
//                 <Form.Item label="Start Date" name="startDate">
//                   <Input type="date" />
//                 </Form.Item>
//                 <Form.Item label="Department" name="department" rules={[{ required: true, message: "Please enter Dept name" }]}>
//                   <Input />
//                 </Form.Item>
//                 <Form.Item label="Position" name="position" rules={[{ required: true, message: "Please enter position" }]}>
//                   <Input />
//                 </Form.Item>
//               </Panel>

//               <Panel header="Educational details" key="4">
//                 <Form.Item label="Qualification" name="qualName">
//                   <Input type="Qualification" />
//                 </Form.Item>
//                 <Form.Item label="Major subject" name="majorSubject">
//                   <Input />
//                 </Form.Item>
//                 <Form.Item label="Institution Name" name="InstituteName">
//                   <Input />
//                 </Form.Item>
//                 <Form.Item label="Location" name="Location">
//                   <Input />
//                 </Form.Item>
//                 <Form.Item label="Year of completion" name="completion">
//                   <Input type="month" />
//                 </Form.Item>
//                 <Form.Item label="Grade/CGPA/Percentage" name="performance">
//                   <Input />
//                 </Form.Item>
//               </Panel>

//               <Panel header="Financial Information" key="5">
//                 <Form.Item label="Bank Name" name="bankName">
//                   <Input />
//                 </Form.Item>
//                 <Form.Item label="Account Number" name="accountNumber">
//                   <Input />
//                 </Form.Item>
//                 <Form.Item label="IFSC" name="ifsc">
//                   <Input />
//                 </Form.Item>
//                 <Form.Item label="Tax ID" name="taxId">
//                   <Input />
//                 </Form.Item>
//                 <Form.Item label="adhaar Card" name="adhaarCard">
//                   <Input />
//                 </Form.Item>
//                 <Form.Item label="Pan Card" name="panCard">
//                   <Input />
//                 </Form.Item>
//                 <Form.Item label="UAN number" name="uanNumber">
//                   <Input />
//                 </Form.Item>
//               </Panel>

//               <Panel header="Emergency Contact" key="6">
//                 <Form.Item label="Contact Person" name="emergencyContact">
//                   <Input />
//                 </Form.Item>
//                 <Form.Item label="Contact Number" name="emergencyNumber">
//                   <Input />
//                 </Form.Item>
//               </Panel>

//               <Panel header="Photo Upload" key="6">
//                 <Upload
//                   accept="image/*"
//                   showUploadList={false}
//                   customRequest={handleUpload}
//                 >
//                   <Button icon={<UploadOutlined />}>Upload Photo</Button>
//                 </Upload>
//                 {photoUrl && (
//                   <div style={{ textAlign: "center", marginTop: 10 }}>
//                     <img
//                       src={photoUrl}
//                       alt="photo"
//                       style={{ maxHeight: 120, objectFit: "contain" }}
//                     />
//                   </div>
//                 )}
//               </Panel>
//             </Collapse>

//             <Form.Item style={{ marginTop: 20, textAlign: "center" }}>
//               <Button type="primary" htmlType="submit">
//                 {editingEmployee ? "Update Employee" : "Add Employee"}
//               </Button>
//             </Form.Item>
//           </Form>
//         </Modal>
//       </div>
//     </DefaultLayout>
//   );
// }




// --------------2ND------------
// import React, { useEffect, useState } from "react";
// import {
//   Table,
//   Button,
//   Modal,
//   Tabs,
//   Form,
//   Input,
//   Select,
//   Upload,
//   message,
//   Popconfirm,
//   Space,
//   Typography,
// } from "antd";
// import {
//   PlusOutlined,
//   UploadOutlined,
//   DownloadOutlined,
//   ReloadOutlined,
//   DeleteOutlined,
//   EditOutlined,
// } from "@ant-design/icons";
// import Papa from "papaparse";
// import axios from "axios";
// import DefaultLayout from "../components/DefaultLayout";

// const { TabPane } = Tabs;
// const { Option } = Select;
// const { Title } = Typography;

// const EmployeePage = () => {
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [editingEmployee, setEditingEmployee] = useState(null);
//   const [form] = Form.useForm();
//   // const [photoUrl, setPhotoUrl] = useState(null);

//   // Load all employees from backend
//   const loadEmployees = async () => {
//     try {
//       setLoading(true);
//       const { data } = await axios.get("/api/employees");
//       setEmployees(data);
//     } catch (err) {
//       console.error(err);
//       message.error("Failed to fetch employees");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadEmployees();
//   }, []);

//   // Save a row (add or update)
//   const saveEmployee = async (record) => {
//     try {
//       const payload = { ...record };
//       delete payload.key;
//       delete payload.isNew;

//       if (record.isNew) {
//         await axios.post("/api/employees", payload);
//         message.success("Employee added");
//       } else {
//         await axios.put(`/api/employees/${record._id}`, payload);
//         message.success("Employee updated");
//       }
//       loadEmployees();
//     } catch (e) {
//       console.error(e);
//       message.error("Save failed");
//     }
//   };

//   // Delete employee
//   const deleteEmployee = async (record) => {
//     try {
//       if (record.isNew) {
//         setEmployees(employees.filter((e) => e.key !== record.key));
//         return;
//       }
//       await axios.delete(`/api/employees/${record._id}`);
//       message.success("Employee deleted");
//       loadEmployees();
//     } catch (e) {
//       message.error("Delete failed");
//     }
//   };

//   // CSV Export
//   const exportToCSV = () => {
//     if (!employees.length) {
//       message.warning("No employee data to export");
//       return;
//     }
//     const csv = Papa.unparse(
//       employees.map(({ _id, key, isNew, __v, ...rest }) => rest)
//     );
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const link = document.createElement("a");
//     link.href = URL.createObjectURL(blob);
//     link.download = "employees.csv";
//     link.click();
//   };

//   // CSV Import
//   const importCSV = (file) => {
//     Papa.parse(file, {
//       header: true,
//       complete: async (result) => {
//         const imported = result.data.filter((r) => r.name);
//         if (!imported.length) {
//           message.error("No valid employee data found in CSV");
//           return;
//         }
//         try {
//           await axios.post("/api/employees/bulk", imported);
//           message.success("Employees imported successfully");
//           loadEmployees();
//         } catch (e) {
//           console.error(e);
//           message.error("Import failed");
//         }
//       },
//     });
//     return false;
//   };

//   const openModal = (employee = null) => {
//     if (employee) {
//       setEditingEmployee(employee);
//       form.setFieldsValue(employee); // pre-fill form with old data
//     } else {
//       setEditingEmployee(null);
//       form.resetFields();
//     }
//     setIsModalVisible(true);
//   };

//   // Table columns (inline editable removed)
//   const columns = [
//     { title: "Name", dataIndex: "name", width: 150 },
//     { title: "Email", dataIndex: "email", width: 180 },
//     { title: "Phone", dataIndex: "phone", width: 120 },
//     { title: "Designation", dataIndex: "position", width: 120 },
//     {
//       title: "Actions",
//       key: "actions",
//       width: 130,
//       fixed: "right",
//       render: (_, record) => (
//         <Space>
//           <Button
//             type="default"
//             size="small"
//             onClick={() => openModal(record)} // open modal for edit
//           >
//             <EditOutlined />
//           </Button>
//           <Popconfirm
//             title="Are you sure to delete?"
//             onConfirm={() => deleteEmployee(record)}
//           >
//             <Button danger icon={<DeleteOutlined />} size="small" />
//           </Popconfirm>
//         </Space>
//       ),
//     },
//   ];

//   const handleCancel = () => {
//     setIsModalVisible(false);
//     form.resetFields();
//   };

//   const handleSave = async () => {
//     try {
//       const values = await form.validateFields();

//       const payload = {
//         ...values,
//         emergencyContact: values.emergencyName,
//         emergencyNumber: values.emergencyPhone,
//         department: values.department || "General", // default if empty
//         position: values.designation || "Employee",
//         photo: values.photo?.fileList?.[0]?.originFileObj
//           ? await getBase64(values.photo.fileList[0].originFileObj)
//           : null,
//       };

//       if (editingEmployee) {
//         await saveEmployee({ ...editingEmployee, ...payload });
//       } else {
//         await saveEmployee({ ...payload, isNew: true, key: Date.now().toString() });
//       }

//       handleCancel();
//     } catch (info) {
//       console.log("Validation Failed:", info);
//     }
//   };

//   const getBase64 = (file) =>
//     new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.readAsDataURL(file);
//       reader.onload = () => resolve(reader.result);
//       reader.onerror = (error) => reject(error);
//     });


//   return (
//     <DefaultLayout>
//       <div style={{ padding: 20 }}>
//         <Space
//           style={{
//             display: "flex",
//             justifyContent: "space-between",
//             marginBottom: 15,
//             width: "100%",
//           }}
//         >
//           <Title level={3}>Employee Management</Title>
//           <Space>
//             <Upload accept=".csv" showUploadList={false} beforeUpload={importCSV}>
//               <Button icon={<UploadOutlined />}>Import CSV</Button>
//             </Upload>
//             <Button icon={<DownloadOutlined />} onClick={exportToCSV}>
//               Export CSV
//             </Button>
//             <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()}>
//               Add Row
//             </Button>
//             <Button icon={<ReloadOutlined />} onClick={loadEmployees}>
//               Refresh
//             </Button>
//           </Space>
//         </Space>

//         <Table
//           columns={columns}
//           dataSource={employees}
//           rowKey={(record) => record._id || record.key}
//           bordered
//           size="middle"
//           loading={loading}
//           scroll={{ x: true }}
//         />

//         <Modal
//           title={editingEmployee ? "Edit Employee" : "Add Employee"}
//           visible={isModalVisible}
//           onOk={handleSave}
//           onCancel={handleCancel}
//           width={800}
//         >
//           <Tabs defaultActiveKey="1" type="card">
//             {/* Contact Information */}
//             <TabPane tab="Contact Information" key="1">
//               <Form form={form} layout="vertical">
//                 <Form.Item
//                   name="name"
//                   label="Full Name"
//                   rules={[{ required: true, message: "Please enter name" }]}
//                 >
//                   <Input placeholder="Enter full name" />
//                 </Form.Item>
//                 <Form.Item
//                   name="email"
//                   label="Email"
//                   rules={[
//                     { required: true, message: "Please enter email" },
//                     { type: "email", message: "Invalid email format" },
//                   ]}
//                 >
//                   <Input placeholder="Enter email" />
//                 </Form.Item>
//                 <Form.Item
//                   name="phone"
//                   label="Phone Number"
//                   rules={[{ required: true, message: "Please enter phone" }]}
//                 >
//                   <Input placeholder="Enter phone number" />
//                 </Form.Item>
//               </Form>
//             </TabPane>

//             {/* Identification Details */}
//             <TabPane tab="Identification Details" key="2">
//               <Form form={form} layout="vertical">
//                 <Form.Item name="idType" label="ID Type">
//                   <Select placeholder="Select ID type">
//                     <Option value="aadhaar">Aadhaar</Option>
//                     <Option value="passport">Passport</Option>
//                     <Option value="pan">PAN</Option>
//                   </Select>
//                 </Form.Item>
//                 <Form.Item name="idNumber" label="ID Number">
//                   <Input placeholder="Enter ID number" />
//                 </Form.Item>
//               </Form>
//             </TabPane>

//             {/* Employment Data */}
//             <TabPane tab="Employment Data" key="3">
//               <Form form={form} layout="vertical">
//                 <Form.Item name="designation" label="Designation">
//                   <Input placeholder="Enter designation" />
//                 </Form.Item>
//                 <Form.Item name="department" label="Department">
//                   <Input placeholder="Enter department" />
//                 </Form.Item>
//               </Form>
//             </TabPane>

//             {/* Educational Details */}
//             <TabPane tab="Educational Details" key="4">
//               <Form form={form} layout="vertical">
//                 <Form.Item name="highestQualification" label="Highest Qualification">
//                   <Input placeholder="Enter highest qualification" />
//                 </Form.Item>
//                 <Form.Item name="university" label="University/College">
//                   <Input placeholder="Enter university/college" />
//                 </Form.Item>
//               </Form>
//             </TabPane>

//             {/* Financial Information */}
//             <TabPane tab="Financial Information" key="5">
//               <Form form={form} layout="vertical">
//                 <Form.Item name="bankName" label="Bank Name">
//                   <Input placeholder="Enter bank name" />
//                 </Form.Item>
//                 <Form.Item name="accountNumber" label="Account Number">
//                   <Input placeholder="Enter account number" />
//                 </Form.Item>
//                 <Form.Item name="ifsc" label="IFSC Code">
//                   <Input placeholder="Enter IFSC code" />
//                 </Form.Item>
//               </Form>
//             </TabPane>

//             {/* Emergency Contact */}
//             <TabPane tab="Emergency Contact" key="6">
//               <Form form={form} layout="vertical">
//                 <Form.Item name="emergencyName" label="Contact Name">
//                   <Input placeholder="Enter emergency contact name" />
//                 </Form.Item>
//                 <Form.Item name="emergencyPhone" label="Contact Phone">
//                   <Input placeholder="Enter emergency contact phone" />
//                 </Form.Item>
//               </Form>
//             </TabPane>

//             {/* Photo Upload */}
//             <TabPane tab="Photo Upload" key="7">
//               <Form form={form} layout="vertical">
//                 <Form.Item name="photo" label="Upload Photo">
//                   <Upload
//                     name="photo"
//                     listType="picture"
//                     maxCount={1}
//                     beforeUpload={(file) => false} // prevent auto upload
//                   >
//                     <Button icon={<UploadOutlined />}>Click to Upload</Button>
//                   </Upload>
//                 </Form.Item>
//               </Form>
//             </TabPane>
//           </Tabs>
//         </Modal>
//       </div>
//     </DefaultLayout>
//   );
// };

// export default EmployeePage;














// EmployeePage.js
import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Tabs,
  Form,
  Input,
  Select,
  Upload,
  message,
  Popconfirm,
  Space,
  Typography,
} from "antd";
import {
  PlusOutlined,
  UploadOutlined,
  DownloadOutlined,
  ReloadOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import Papa from "papaparse";
import axios from "axios";
import DefaultLayout from "../components/DefaultLayout";

const { TabPane } = Tabs;
const { Option } = Select;
const { Title } = Typography;

const EmployeePage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form] = Form.useForm();

  // upload fileList controlled for Ant Upload (for preview / remove)
  const [uploadFileList, setUploadFileList] = useState([]);

  // Save (in-flight) state to disable Save button
  const [saving, setSaving] = useState(false);

  // Load all employees from backend
  const loadEmployees = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/employees");
      setEmployees(data || []);
    } catch (err) {
      console.error(err);
      message.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // --- Helpers ---
  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const capitalizeWords = (str = "") =>
    (str || "")
      .toString()
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  // Map backend employee -> form fields
  const mapEmployeeToForm = (emp = {}) => {
    return {
      ...emp,
      designation: emp.position || "",
      emergencyName: emp.emergencyContact || "",
      emergencyPhone: emp.emergencyNumber || "",
      highestQualification: emp.qualName || "",
      university: emp.InstituteName || "",
      // photo is handled via uploadFileList separately
    };
  };

  // Map form values -> backend payload
  const mapFormToPayload = async (values) => {
    // determine photo base64:
    let photoBase64 = null;
    if (uploadFileList && uploadFileList.length) {
      const f = uploadFileList[0];
      // if originFileObj exists (new upload)
      if (f.originFileObj) {
        photoBase64 = await getBase64(f.originFileObj);
      } else if (f.url) {
        // existing preview (base64 or url)
        photoBase64 = f.url;
      } else if (f.thumbUrl) {
        photoBase64 = f.thumbUrl;
      }
    }

    const payload = {
      ...values,
      position: values.designation || "", // backend field
      department: values.department || "",
      emergencyContact: values.emergencyName || "",
      emergencyNumber: values.emergencyPhone || "",
      qualName: values.highestQualification || "",
      InstituteName: values.university || "",
      photo: photoBase64, // base64 or null
    };

    // small UX: capitalize name and department before save
    if (payload.name) payload.name = capitalizeWords(payload.name);
    if (payload.department) payload.department = capitalizeWords(payload.department);

    // remove frontend-only fields
    delete payload.designation;
    delete payload.emergencyName;
    delete payload.emergencyPhone;
    delete payload.highestQualification;
    delete payload.university;

    return payload;
  };

  // --- CRUD operations ---

  const saveEmployee = async (record) => {
    try {
      // record expected as payload mapped already
      if (!record) throw new Error("No data to save");
      if (record.isNew) {
        // POST
        await axios.post("/api/employees", record);
        message.success("Employee added");
      } else {
        // PUT
        const id = record._id;
        await axios.put(`/api/employees/${id}`, record);
        message.success("Employee updated");
      }
      await loadEmployees();
    } catch (e) {
      console.error("saveEmployee error:", e, e?.response?.data);
      const friendly = e?.response?.data?.message || e.message || "Save failed";
      message.error(friendly);
      throw e;
    }
  };

  const deleteEmployee = async (record) => {
    try {
      if (record.isNew) {
        setEmployees((prev) => prev.filter((e) => e.key !== record.key));
        return;
      }
      await axios.delete(`/api/employees/${record._id}`);
      message.success("Employee deleted");
      loadEmployees();
    } catch (e) {
      console.error("deleteEmployee error:", e);
      message.error("Delete failed");
    }
  };

  // --- CSV Export / Import (include photo base64) ---

  const exportToCSV = () => {
    if (!employees.length) {
      message.warning("No employee data to export");
      return;
    }
    // prepare rows - ensure photo is included (base64 string or empty)
    const rows = employees.map((emp) => {
      // include all keys except mongoose internals
      const { _id, __v, ...rest } = emp;
      // ensure photo field present
      return {
        ...rest,
        id: _id || "",
        photo: emp.photo || "", // base64 string or empty
      };
    });

    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "employees.csv";
    link.click();
    message.success("CSV exported successfully");
  };

  const importCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (result) => {
        const imported = result.data.filter((r) => r.name);
        if (!imported.length) {
          message.error("No valid employee data found in CSV");
          return;
        }
        try {
          // server expects backend field names; CSV may already contain photo (base64)
          // Ensure we map fields if CSV has frontend names - assume CSV matches backend keys or contains photo column
          await axios.post("/api/employees/bulk", imported);
          message.success("Employees imported successfully");
          loadEmployees();
        } catch (e) {
          console.error("importCSV error:", e, e?.response?.data);
          message.error("Import failed");
        }
      },
      error: (err) => {
        console.error("CSV parse error:", err);
        message.error("CSV parse failed");
      },
    });

    return false; // prevent Upload auto
  };

  // --- Modal / Form handlers ---

  const openModal = (employee = null) => {
    setEditingEmployee(employee);
    setUploadFileList([]); // reset upload list, will set below if editing

    if (employee) {
      const mapped = mapEmployeeToForm(employee);
      form.setFieldsValue(mapped);

      // if employee.photo exists (base64), prepare upload fileList for preview
      if (employee.photo) {
        const fileObj = {
          uid: "-1",
          name: "photo.png",
          status: "done",
          url: employee.photo, // base64 or URL
        };
        setUploadFileList([fileObj]);
      }
    } else {
      form.resetFields();
      setUploadFileList([]);
    }

    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingEmployee(null);
    form.resetFields();
    setUploadFileList([]);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const values = await form.validateFields();
      const payload = await mapFormToPayload(values);

      if (editingEmployee) {
        // update
        const updated = { ...editingEmployee, ...payload };
        // ensure _id present
        updated._id = editingEmployee._id;
        await saveEmployee(updated);
      } else {
        // add new
        const newRecord = { ...payload, isNew: true };
        await saveEmployee(newRecord);
      }

      handleCancel();
    } catch (err) {
      // errors already handled/logged in saveEmployee
      console.log("handleSave error:", err);
    } finally {
      setSaving(false);
    }
  };

  // Upload handlers (controlled fileList)
  const uploadProps = {
    accept: "image/*",
    listType: "picture",
    multiple: false,
    fileList: uploadFileList,
    beforeUpload: (file) => {
      // prevent auto upload, but add to fileList for preview
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("Only images allowed");
        return Upload.LIST_IGNORE;
      }
      // add file to fileList (as originFileObj); preview will be created by browser using thumbUrl if needed
      setUploadFileList([
        {
          uid: file.uid,
          name: file.name,
          status: "done",
          originFileObj: file,
        },
      ]);
      return false; // prevent auto upload
    },
    onRemove: () => {
      setUploadFileList([]);
    },
  };

  // Table columns
  const columns = [
    { title: "Name", dataIndex: "name", width: 200 },
    { title: "Email", dataIndex: "email", width: 220 },
    { title: "Phone", dataIndex: "phone", width: 140 },
    { title: "Designation", dataIndex: "position", width: 160 },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      fixed: "right",
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            size="small"
            onClick={() => openModal(record)}
            icon={<EditOutlined />}
          />
          <Popconfirm
            title="Are you sure to delete?"
            onConfirm={() => deleteEmployee(record)}
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <DefaultLayout>
      <div style={{ padding: 20 }}>
        <Space
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 15,
            width: "100%",
          }}
        >
          <Title level={3}>Employee Management</Title>
          <Space>
            <Upload accept=".csv" showUploadList={false} beforeUpload={importCSV}>
              <Button icon={<UploadOutlined />}>Import CSV</Button>
            </Upload>

            <Button icon={<DownloadOutlined />} onClick={exportToCSV}>
              Export CSV
            </Button>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal(null)}
            >
              Add Employee
            </Button>

            <Button icon={<ReloadOutlined />} onClick={loadEmployees}>
              Refresh
            </Button>
          </Space>
        </Space>

        <Table
          columns={columns}
          dataSource={employees}
          rowKey={(record) => record._id || record.key}
          bordered
          size="middle"
          loading={loading}
          scroll={{ x: true }}
        />

        <Modal
          title={editingEmployee ? "Edit Employee" : "Add Employee"}
          visible={isModalVisible}
          onOk={handleSave}
          onCancel={handleCancel}
          width={900}
          okText={saving ? "Saving..." : "Save"}
          okButtonProps={{ disabled: saving }}
          cancelButtonProps={{ disabled: saving }}
        >
          {/* Single form for all tabs */}
          <Form form={form} layout="vertical">
            <Tabs defaultActiveKey="1" type="card" destroyInactiveTabPane={false}>
              {/* Contact Information */}
              <TabPane tab="Contact Information" key="1">
                <Form.Item
                  name="name"
                  label="Full Name"
                  rules={[{ required: true, message: "Please enter name" }]}
                >
                  <Input placeholder="Enter full name" />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Please enter email" },
                    { type: "email", message: "Invalid email format" },
                  ]}
                >
                  <Input placeholder="Enter email" />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[{ required: false }]}
                >
                  <Input placeholder="Enter phone number" />
                </Form.Item>
              </TabPane>

              {/* Identification Details */}
              <TabPane tab="Identification Details" key="2">
                <Form.Item name="idType" label="ID Type">
                  <Select placeholder="Select ID type" allowClear>
                    <Option value="aadhaar">Aadhaar</Option>
                    <Option value="passport">Passport</Option>
                    <Option value="pan">PAN</Option>
                  </Select>
                </Form.Item>

                <Form.Item name="idNumber" label="ID Number">
                  <Input placeholder="Enter ID number" />
                </Form.Item>

                <Form.Item name="dob" label="Date of Birth">
                  <Input type="date" />
                </Form.Item>
              </TabPane>

              {/* Employment Data */}
              <TabPane tab="Employment Data" key="3">
                <Form.Item name="designation" label="Designation">
                  <Input placeholder="Enter designation" />
                </Form.Item>

                <Form.Item name="department" label="Department">
                  <Input placeholder="Enter department" />
                </Form.Item>

                <Form.Item name="startDate" label="Start Date">
                  <Input type="date" />
                </Form.Item>
              </TabPane>

              {/* Educational Details */}
              <TabPane tab="Educational Details" key="4">
                <Form.Item name="highestQualification" label="Highest Qualification">
                  <Input placeholder="Enter highest qualification" />
                </Form.Item>

                <Form.Item name="university" label="University/College">
                  <Input placeholder="Enter university/college" />
                </Form.Item>

                <Form.Item name="completion" label="Year of completion">
                  <Input placeholder="e.g. 2020" />
                </Form.Item>
              </TabPane>

              {/* Financial Information */}
              <TabPane tab="Financial Information" key="5">
                <Form.Item name="bankName" label="Bank Name">
                  <Input placeholder="Enter bank name" />
                </Form.Item>

                <Form.Item name="accountNumber" label="Account Number">
                  <Input placeholder="Enter account number" />
                </Form.Item>

                <Form.Item name="ifsc" label="IFSC Code">
                  <Input placeholder="Enter IFSC code" />
                </Form.Item>

                <Form.Item name="taxId" label="Tax ID">
                  <Input placeholder="Enter tax id" />
                </Form.Item>
              </TabPane>

              {/* Emergency Contact */}
              <TabPane tab="Emergency Contact" key="6">
                <Form.Item name="emergencyName" label="Contact Name">
                  <Input placeholder="Enter emergency contact name" />
                </Form.Item>

                <Form.Item name="emergencyPhone" label="Contact Phone">
                  <Input placeholder="Enter emergency contact phone" />
                </Form.Item>
              </TabPane>

              {/* Photo Upload */}
              <TabPane tab="Photo Upload" key="7">
                <Form.Item label="Upload Photo">
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />}>Click to Upload</Button>
                  </Upload>

                  {uploadFileList && uploadFileList.length > 0 && (
                    <div style={{ marginTop: 10, textAlign: "center" }}>
                      {/* show thumbnail from url or generated thumb */}
                      <img
                        alt="preview"
                        src={uploadFileList[0].url || uploadFileList[0].thumbUrl}
                        style={{ maxHeight: 120, objectFit: "contain" }}
                      />
                    </div>
                  )}
                </Form.Item>
              </TabPane>
            </Tabs>
          </Form>
        </Modal>
      </div>
    </DefaultLayout>
  );
};

export default EmployeePage;
