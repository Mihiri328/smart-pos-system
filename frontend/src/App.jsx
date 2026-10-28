```jsx
import { useState } from "react";

import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
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
  const [currentPage, setCurrentPage] = useState("dashboard");

  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";

  if (pathname === "/reset-password") {
    return <ResetPassword />;
  }

  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div>
      {currentPage === "dashboard" && (
        <Dashboard onNavigate={setCurrentPage} />
      )}

      {currentPage === "billing" && (
        <Billing
          onNavigate={setCurrentPage}
          onLogout={() => setIsLoggedIn(false)}
        />
      )}

      {currentPage === "products" && (
        <ProductManagement
          currentPage={currentPage}
          onNavigate={setCurrentPage}
        />
      )}

      {currentPage === "inventory" && (
        <Inventory
          currentPage={currentPage}
          onNavigate={setCurrentPage}
        />
      )}

      {currentPage === "suppliers" && (
        <SupplierManagement
          currentPage={currentPage}
          onNavigate={setCurrentPage}
        />
      )}

      {currentPage === "customers" && <CustomerManagement />}
      {currentPage === "reports" && <Reports />}
      {currentPage === "settings" && <Settings />}

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
```