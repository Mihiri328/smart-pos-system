
import { useState } from "react";

import ResetPassword from "./pages/ResetPassword";
import ProductManagement from "./pages/ProductManagement";
import Inventory from "./pages/Inventory";
import SupplierManagement from "./pages/SupplierManagement";
import LoginPage from "./pages/LoginPage";
import PurchaseOrder from "./pages/PurchaseOrder";

import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState("products");

  // Normalize the URL path
  const pathname =
    window.location.pathname.replace(/\/+$/, "") || "/";

  // Reset password page
  if (pathname === "/reset-password") {
    return <ResetPassword />;
  }

  // Login page
  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div>
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

      {currentPage === "Purchase Orders" && (
  <PurchaseOrder
    currentPage={currentPage}
    onNavigate={setCurrentPage}
    onLogout={() => setIsLoggedIn(false)}
  />
)}

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

        <button
          className={
            currentPage === "Purchase Orders" ? "active" : ""
          }
          onClick={() => setCurrentPage("Purchase Orders")}
        >
          Purchase Orders
        </button>

        <button onClick={() => setIsLoggedIn(false)}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default App;
