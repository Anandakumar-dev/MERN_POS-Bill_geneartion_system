// -------------------------------------------
// PurchaseManagement.js
// Parent page integrating Orders + Billing
// -------------------------------------------

import React, { useRef } from "react";
import PurchaseOrderTab from "./PurchaseOrderTab";
import PurchaseBillingTab from "./PurchaseBillingTab";

const PurchaseManagement = () => {
  // We'll use a ref to call billing refresh from Order tab
  const billingRef = useRef();

  return (
    <div>
      {/* Purchase Order Tab */}
      <PurchaseOrderTab
        refreshBills={() => {
          if (billingRef.current) billingRef.current();
        }}
      />

      {/* Purchase Billing Tab */}
      <PurchaseBillingTab ref={billingRef} />
    </div>
  );
};

export default PurchaseManagement;
