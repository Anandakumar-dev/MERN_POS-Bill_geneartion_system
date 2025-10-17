// -------------------------------------------
// App.js
// Central routing and layout configuration
// -------------------------------------------

import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// -------------------- Pages --------------------
import Homepage from "./pages/Homepage";
import CartPage from "./pages/CartPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ItemPage from "./pages/itemPage";
import BillsPage from "./pages/billsPage";
import CustomerPage from "./pages/customerPage";
import InventoryPage from "./pages/InventoryPage";
import Dashboard from "./pages/Dashboard";
import QuickAccess from "./pages/QuickAccess";
import CloneBillForm from "./pages/CloneBillForm";
import InvoicePage from "./pages/InvoicePage";
import MyAccountPage from "./pages/MyAccountPage";
import EmployeePage from "./pages/EmployeePage";

// -------------------- Purchase Module Pages --------------------
import PurchaseDashboardTab from "./pages/Purchase/PurchaseDashboardTab";
import PurchaseOrderTab from "./pages/Purchase/PurchaseOrderTab";
import PurchaseChallanTab from "./pages/Purchase/PurchaseChallanTab";
import PurchaseReturnTab from "./pages/Purchase/PurchaseReturnTab";
import PurchaseReturnChallanTab from "./pages/Purchase/PurchaseReturnChallanTab";
import Vendor from "./pages/Purchase/Vendor";
import PurchaseBillingTab from "./pages/Purchase/PurchaseBillingTab";

// -------------------- Sales Module Pages --------------------
import SalesPage from "./pages/Sales/SalesPage";
import SalesOrderTab from "./pages/Sales/SalesOrderTab";
import SalesChallanTab from "./pages/Sales/SalesChallanTab";
import SalesReturnTab from "./pages/Sales/SalesReturnTab";
import SalesReturnChallanTab from "./pages/Sales/SalesReturnChallanTab";
import SalesDashboardTab from "./pages/Sales/SalesDashboardTab";

// -------------------------------------------
// Protected Route Wrapper
// Ensures only authenticated users can access inner routes
// -------------------------------------------
export function ProtectedRoute({ children }) {
  if (localStorage.getItem("auth")) {
    return children;
  } else {
    return <Navigate to="/login" replace />;
  }
}

// -------------------------------------------
// Main App Component
// -------------------------------------------
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* -------------------- Home -------------------- */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Homepage />
            </ProtectedRoute>
          }
        />

        {/* -------------------- Dashboard -------------------- */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* -------------------- Quick Access -------------------- */}
        <Route
          path="/quick-access"
          element={
            <ProtectedRoute>
              <QuickAccess />
            </ProtectedRoute>
          }
        />

        {/* -------------------- Invoice Page -------------------- */}
        <Route
          path="/invoice/:id"
          element={
            <ProtectedRoute>
              <InvoicePage />
            </ProtectedRoute>
          }
        />

        {/* -------------------- Clone Bill Form -------------------- */}
        <Route
          path="/quickaccess/clone/:billId"
          element={<CloneBillForm />}
        />

        {/* -------------------- Standard Pages -------------------- */}
        <Route
          path="/items"
          element={
            <ProtectedRoute>
              <ItemPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bills"
          element={
            <ProtectedRoute>
              <BillsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <CustomerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <InventoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee"
          element={
            <ProtectedRoute>
              <EmployeePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-account"
          element={
            <ProtectedRoute>
              <MyAccountPage />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
           PURCHASE MODULE ROUTES
        ===================================================== */}
        <Route
          path="/purchase/dashboard"
          element={
            <ProtectedRoute>
              <PurchaseDashboardTab />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase/order"
          element={
            <ProtectedRoute>
              <PurchaseOrderTab />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase/challan"
          element={
            <ProtectedRoute>
              <PurchaseChallanTab />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase/return"
          element={
            <ProtectedRoute>
              <PurchaseReturnTab />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase/return-challan"
          element={
            <ProtectedRoute>
              <PurchaseReturnChallanTab />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase/vendor"
          element={
            <ProtectedRoute>
              <Vendor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase/purchase-billing"
          element={
            <ProtectedRoute>
              <PurchaseBillingTab />
            </ProtectedRoute>
          }
        />

        {/* =====================================================
           SALES MODULE ROUTES
        ===================================================== */}
        {/* Parent Page with all tabs */}
        <Route
          path="/sales"
          element={
            <ProtectedRoute>
              <SalesPage />
            </ProtectedRoute>
          }
        />

        {/* Individual Sales Sub-pages */}
        <Route
          path="/sales/order"
          element={
            <ProtectedRoute>
              <SalesOrderTab />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/challan"
          element={
            <ProtectedRoute>
              <SalesChallanTab />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/return"
          element={
            <ProtectedRoute>
              <SalesReturnTab />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/return-challan"
          element={
            <ProtectedRoute>
              <SalesReturnChallanTab />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sales/dashboard"
          element={
            <ProtectedRoute>
              <SalesDashboardTab />
            </ProtectedRoute>
          }
        />

        {/* -------------------- Authentication -------------------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* -------------------- Fallback Route -------------------- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
