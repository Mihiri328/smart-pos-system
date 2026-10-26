
import { useState } from "react";

import ProductManagement from "./pages/ProductManagement";
import Inventory from "./pages/Inventory";
import SupplierManagement from "./pages/SupplierManagement";

import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("products");

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
    </div>
  );
}

export default App;
