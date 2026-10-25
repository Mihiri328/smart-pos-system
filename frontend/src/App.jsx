import { useState } from "react";

import ProductManagement from "./pages/ProductManagement";
import Inventory from "./pages/Inventory";
import SupplierManagement from "./pages/SupplierManagement";
import LoginPage from "./pages/LoginPage";
import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState("products");

  // Show login page first
  if (!isLoggedIn) {
    return <LoginPage onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div>
      {currentPage === "products" && <ProductManagement />}
      {currentPage === "inventory" && <Inventory />}
      {currentPage === "suppliers" && <SupplierManagement />}

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

        <button onClick={() => setIsLoggedIn(false)}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default App;