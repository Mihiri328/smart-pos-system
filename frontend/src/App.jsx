import { useState } from "react";

import ResetPassword from "./pages/ResetPassword";
import ProductManagement from "./pages/ProductManagement";
import Inventory from "./pages/Inventory";
import SupplierManagement from "./pages/SupplierManagement";
import CustomerManagement from "./pages/CustomerManagement";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import LoginPage from "./pages/LoginPage";

import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState("products");

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
      {currentPage === "products" && <ProductManagement />}
      {currentPage === "inventory" && <Inventory />}
      {currentPage === "suppliers" && <SupplierManagement />}
      {currentPage === "customers" && <CustomerManagement />}
      {currentPage === "reports" && <Reports />}
      {currentPage === "settings" && <Settings />}

      <div className="page-navigation">
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
        <button onClick={() => setCurrentPage("customers")}>
  Customer Management
</button>

<button onClick={() => setCurrentPage("reports")}>
  Reports
</button>

<button onClick={() => setCurrentPage("settings")}>
  Settings
</button>

        <button onClick={() => setIsLoggedIn(false)}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default App;
