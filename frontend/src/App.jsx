import { useState } from "react";

import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
import ProductManagement from "./pages/ProductManagement";
import Inventory from "./pages/Inventory";
import SupplierManagement from "./pages/SupplierManagement";
import CustomerManagement from "./pages/CustomerManagement";
import SalesHistory from "./pages/SalesHistory";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import LoginPage from "./pages/LoginPage";

import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  const pathname =
    window.location.pathname.replace(/\/+$/, "") || "/";

  // Reset password page
  if (pathname === "/reset-password") {
    return <ResetPassword />;
  }

  // Login page
  if (!isLoggedIn) {
    return (
      <LoginPage
        onLogin={() => {
          setCurrentPage("dashboard");
          setIsLoggedIn(true);
        }}
      />
    );
  }

  // Main application pages
  const pageProps = {
    currentPage,
    onNavigate: setCurrentPage,
    onLogout: () => {
      setIsLoggedIn(false);
      setCurrentPage("dashboard");
    },
  };

  const pages = {
    dashboard: <Dashboard {...pageProps} />,
    billing: <Billing {...pageProps} />,
    products: <ProductManagement {...pageProps} />,
    inventory: <Inventory {...pageProps} />,
    suppliers: <SupplierManagement {...pageProps} />,
    customers: <CustomerManagement {...pageProps} />,
    sales_history: <SalesHistory {...pageProps} />,
    reports: <Reports {...pageProps} />,
    settings: <Settings {...pageProps} />,
  };

  const navigation = [
    ["dashboard", "Dashboard"],
    ["billing", "Billing"],
    ["products", "Products"],
    ["inventory", "Inventory"],
    ["suppliers", "Suppliers"],
    ["customers", "Customer Management"],
    ["sales_history", "SalesHistory"], 
    ["reports", "Reports"],
    ["settings", "Settings"],
  ];

  return (
    <div>
      {pages[currentPage] || pages.dashboard}

      <div className="page-navigation">
        {navigation.map(([page, label]) => (
          <button
            key={page}
            type="button"
            className={currentPage === page ? "active" : ""}
            onClick={() => setCurrentPage(page)}
          >
            {label}
          </button>
        ))}

        <button
          type="button"
          onClick={pageProps.onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default App;
