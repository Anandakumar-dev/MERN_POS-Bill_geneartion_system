// import { } from "antd";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Homepage from "./pages/Homepage";
import ItemPage from "./pages/itemPage.js";
import CartPage from "./pages/CartPage.js";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import BillsPage from "./pages/billsPage.js";
import CustomerPage from "./pages/customerPage.js";
import InventoryPage from "./pages/InventoryPage";
import Dashboard from "./pages/Dashboard";
import QuickAccess from "./pages/QuickAccess";
import CloneBillForm from "./pages/CloneBillForm.js";
import InvoicePage from "./pages/InvoicePage";
import MyAccountPage from "./pages/MyAccountPage.js";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Homepage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quick-access"
          element={
            <ProtectedRoute>
              <QuickAccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoice/:id"
          element={
            <ProtectedRoute>
              <InvoicePage />
            </ProtectedRoute>
          }
        />

        <Route path="/quickaccess/clone/:billId" element={<CloneBillForm />} />


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
          path="/my-account"
          element={
            <ProtectedRoute>
              <MyAccountPage  />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

export function ProtectedRoute({ children }) {
  if (localStorage.getItem("auth")) {
    return children;
  } else {
    return <Navigate to="/login" />;
  }
}
