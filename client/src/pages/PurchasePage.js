// -------------------------------------------
// src/pages/PurchasePage.js
// -------------------------------------------
import React, { useState, useEffect } from "react";
import { Tabs, message } from "antd";
import axios from "axios";
import DefaultLayout from "../components/DefaultLayout";

// Import tabbed pages
import PurchaseDashboardTab from "./Purchase/PurchaseDashboardTab";
import PurchaseOrderTab from "./Purchase/PurchaseOrderTab";
import PurchaseChallanTab from "./Purchase/PurchaseChallanTab";
import PurchaseReturnTab from "./Purchase/PurchaseReturnTab";
import PurchaseReturnChallanTab from "./Purchase/PurchaseReturnChallanTab";

const PurchasePage = () => {
  const [inventory, setInventory] = useState([]);

  // Load inventory for all purchase tabs
  useEffect(() => {
    axios
      .get("/api/items/get-item")
      .then((res) => setInventory(res.data))
      .catch((err) => message.error("Failed to load inventory: " + err.message));
  }, []);

  return (
    <DefaultLayout>
      <div style={{ margin: 20 }}>
        <Tabs
          defaultActiveKey="dashboard"
          type="card"
          items={[
            {
              key: "dashboard",
              label: "Purchase Dashboard",
              children: <PurchaseDashboardTab inventory={inventory} />,
            },
            {
              key: "order",
              label: "Purchase Order",
              children: <PurchaseOrderTab inventory={inventory} />,
            },
            {
              key: "challan",
              label: "Purchase Challan",
              children: <PurchaseChallanTab inventory={inventory} />,
            },
            {
              key: "return",
              label: "Purchase Return",
              children: <PurchaseReturnTab inventory={inventory} />,
            },
            {
              key: "returnChallan",
              label: "Purchase Return Challan",
              children: (
                <PurchaseReturnChallanTab inventory={inventory} />
              ),
            },
          ]}
        />
      </div>
    </DefaultLayout>
  );
};

export default PurchasePage;
