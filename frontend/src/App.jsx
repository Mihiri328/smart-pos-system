import { useState } from "react";

import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
import ProductManagement from "./pages/ProductManagement";
import Inventory from "./pages/Inventory";
import SupplierManagement from "./pages/SupplierManagement";
import LoginPage from "./pages/LoginPage";

import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  // Normalize the URL path
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";

  // IMPORTANT: Reset password must be accessible without login
  if (pathname === "/reset-password") {
    return <ResetPassword />;
  }

  // Show login page if the user is not logged in
  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }
  return (
    <div>
      {currentPage === "dashboard" && (<Dashboard onNavigate={setCurrentPage} />)}
      {currentPage === "billing" && (<Billing onNavigate={setCurrentPage} onLogout={() => setIsLoggedIn(false)}/>)}
      {currentPage === "products" && <ProductManagement />}
      {currentPage === "inventory" && <Inventory />}
      {currentPage === "suppliers" && <SupplierManagement />}

      {["dashboard", "products", "inventory", "suppliers"].includes(
  currentPage
) && (
  <div className="page-navigation">
    <button
      className={currentPage === "dashboard" ? "active" : ""}
      onClick={() => setCurrentPage("dashboard")}
    >
      Dashboard
    </button>

    <button
      className={currentPage === "billing" ? "active" : ""}
      onClick={() => setCurrentPage("billing")}
    >
      Billing
    </button>

    <button
      className={currentPage === "products" ? "active" : ""}
      onClick={() => setCurrentPage("products")}
    >
      Products
    </button>

    <button
      className={currentPage === "inventory" ? "active" : ""}
      onClick={() => setCurrentPage("inventory")}
    >
      Inventory
    </button>

    <button
      className={currentPage === "suppliers" ? "active" : ""}
      onClick={() => setCurrentPage("suppliers")}
    >
      Suppliers
    </button>

    <button onClick={() => setIsLoggedIn(false)}>
      Logout
    </button>
  </div>
)}
    </div>
  );
}

export default App;