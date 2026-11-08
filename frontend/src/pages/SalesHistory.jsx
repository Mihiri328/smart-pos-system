import { useEffect, useState } from "react";

import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  Truck,
  ClipboardList,
  Users,
  History,
  ChartNoAxesCombined,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Store
} from "lucide-react";

import logo from "../img/black logo.png";

// Backend API URL
const API_URL = `${
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
}/sales`;

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, page: "dashboard" },
  { label: "POS Billing", icon: ShoppingCart, page: "billing" },
  { label: "Products Management", icon: Package, page: "products" },
  { label: "Inventory", icon: Warehouse, page: "inventory", count: 5 },
  { label: "Suppliers Management", icon: Truck, page: "suppliers" },
  { label: "Purchase Orders", icon: ClipboardList, page: "purchase_orders" },
  { label: "Customer Management", icon: Users, page: "customers" },
  { label: "Sales History", icon: History, page: "sales_history" },
  { label: "Reports", icon: ChartNoAxesCombined, page: "reports" },
  { label: "Settings", icon: Settings, page: "settings" }
];

// Format currency
const formatMoney = (amount) =>
  `${Number(amount || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;

// Format database date as DD/MM/YYYY
const formatDate = (dateValue) => {
  if (!dateValue) return "-";

  let year, month, day;

  if (typeof dateValue === "string") {
    // Handle YYYY-MM-DD and YYYY/MM/DD
    const match = dateValue.trim().match(/^(\d{4})[-/](\d{2})[-/](\d{2})/);

    if (match) {
      [, year, month, day] = match;
    } else {
      return dateValue;
    }
  } else {
    const date = new Date(dateValue);

    if (isNaN(date.getTime())) return "-";

    year = date.getFullYear();
    month = String(date.getMonth() + 1).padStart(2, "0");
    day = String(date.getDate()).padStart(2, "0");
  }

  return `${day}/${month}/${year}`;
};

// Format date for CSV
const escapeCSV = (value) =>
  `"${String(value ?? "").replace(/"/g, '""')}"`;

export default function SalesHistory({ onNavigate, onLogout }) {
  // Sales data
  const [sales, setSales] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const rowsPerPage = 10;

  // Filters
  const [dateFilter, setDateFilter] = useState("");
  const [orderFilter, setOrderFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");

  // UI states
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notice, setNotice] = useState("");

  // Selected transaction
  const [selectedSale, setSelectedSale] = useState(null);

  // Fetch sales from backend
  useEffect(() => {
    const controller = new AbortController();

    const fetchSales = async () => {
      try {
        setLoading(true);
        setNotice("");

        const params = new URLSearchParams();

        params.append("page", page);
        params.append("limit", rowsPerPage);

        if (dateFilter) {
          params.append("date", dateFilter);
        }

        if (orderFilter.trim()) {
          params.append("orderNo", orderFilter.trim());
        }

        if (paymentFilter) {
          params.append("paymentMethod", paymentFilter);
        }

        const response = await fetch(
          `${API_URL}?${params.toString()}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json"
            },
            signal: controller.signal
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to retrieve sales."
          );
        }

        setSales(result.data || []);

        setTotalRecords(
          Number(result.pagination?.totalRecords || 0)
        );

        setTotalPages(
          Math.max(
            1,
            Number(result.pagination?.totalPages || 1)
          )
        );

      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Fetch sales error:", error);

          setSales([]);
          setTotalRecords(0);
          setTotalPages(1);

          setNotice(
            error.message || "Unable to load sales history."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchSales();

    return () => {
      controller.abort();
    };
  }, [page, dateFilter, orderFilter, paymentFilter]);

  // Fetch individual transaction details
  async function handleViewSale(orderId) {
    try {
      setDetailLoading(true);
      setSelectedSale(null);
      setNotice("");

      const response = await fetch(`${API_URL}/${orderId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json"
        }
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to retrieve transaction details."
        );
      }

      setSelectedSale(result.data);

    } catch (error) {
      console.error("Fetch sale details error:", error);

      setNotice(
        error.message || "Unable to load transaction details."
      );
    } finally {
      setDetailLoading(false);
    }
  }

  // Clear filters
  function clearFilters() {
    setDateFilter("");
    setOrderFilter("");
    setPaymentFilter("");
    setPage(1);
  }

  // Export current page sales to CSV
  function exportCSV() {
    if (sales.length === 0) {
      setNotice("No sales records available to export.");
      return;
    }

    const headings = [
      "Date",
      "Order No",
      "Payment Method",
      "Items",
      "Amount (LKR)"
    ];

    const rows = sales.map((sale) => [
      formatDate(sale.date),
      sale.order_no,
      sale.payment_method,
      sale.item_count,
      sale.amount
    ]);

    const csv = [
      headings.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(","))
    ].join("\n");

    const blob = new Blob(
      ["\uFEFF" + csv],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "smart-pos-sales-history.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);

    setNotice("Sales history CSV exported successfully.");
  }

  // Navigation
  function chooseNav(pageKey) {
    setMobileMenu(false);

    if (pageKey === "sales_history") return;

    if (onNavigate) {
      onNavigate(pageKey);
    } else {
      setNotice(`${pageKey} page is not connected yet.`);
    }
  }

  // Logout
  function handleLogout() {
    setMobileMenu(false);

    if (onLogout) {
      onLogout();
    } else if (onNavigate) {
      onNavigate("login");
    }
  }

  return (
    <div className="sp-dashboard sh-page">

      {/* Sidebar */}
      <aside
        className={`sp-sidebar ${
          mobileMenu ? "sp-sidebar-open" : ""
        }`}
      >
        <div className="sp-brand">
          <img
            src={logo}
            alt="Smart POS Logo"
            className="brand-logo"
          />

          <button
            className="sp-close-menu"
            onClick={() => setMobileMenu(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sp-nav-label">MAIN MENU</div>

        <nav className="sp-nav">
          {navItems.map(
            ({ label, icon: Icon, page: pageKey, count }) => (
              <button
                key={pageKey}
                className={`sp-nav-item ${
                  pageKey === "sales_history" ? "selected" : ""
                }`}
                onClick={() => chooseNav(pageKey)}
              >
                <Icon size={18} />

                <span>{label}</span>

                {count && (
                  <span className="sp-nav-count">
                    {count}
                  </span>
                )}
              </button>
            )
          )}
        </nav>

        <div className="sp-sidebar-bottom">
          <div className="sp-help-card">
            <strong>Need help?</strong>

            <p>
              Check your stock and sales insights to make
              better decisions.
            </p>
          </div>

          <button
            className="sp-nav-item"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {mobileMenu && (
        <button
          className="sp-backdrop"
          onClick={() => setMobileMenu(false)}
          aria-label="Close navigation"
        />
      )}

      {/* Main content */}
      <main className="sp-main sh-main">

        {/* Topbar */}
        <header className="sp-topbar sh-topbar">

          <button
            className="sp-mobile-menu"
            onClick={() => setMobileMenu(true)}
            aria-label="Open menu"
          >
            <Menu size={21} />
          </button>

          <div className="sp-page-heading sh-heading">
            <h1>Sales History</h1>
            <p>Review and manage your store sales.</p>
          </div>

          <div className="sp-top-actions">

            <div className="sp-notification-wrap">
              <button
                className="sp-icon-button"
                onClick={() =>
                  setShowNotifications((value) => !value)
                }
              >
                <Bell size={19} />
                <i>4</i>
              </button>

              {showNotifications && (
                <div className="sp-notification-pop">
                  <strong>Notifications</strong>
                  <p>3 products have critical stock.</p>
                  <p>5 products are expiring soon.</p>
                </div>
              )}
            </div>

            <div className="sp-profile">
              <div className="sp-avatar">O</div>

              <div>
                <strong>Owner</strong>
                <small>Store Owner</small>
              </div>
            </div>

          </div>
        </header>

        {/* Notification message */}
        {notice && (
          <div className="sp-notice">
            <span>{notice}</span>

            <button
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Sales content */}
        <section className="sh-content">

          {/* Table heading and filters */}
          <div className="sh-table-heading">

            <div>
              <h2>All Transactions</h2>
              <p>View and track your completed sales.</p>
            </div>

            <div className="sh-filters">

              {/* Date filter */}
              <div className="sh-filter-group">
                <label>Date</label>

                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              {/* Order number filter */}
              <div className="sh-filter-group">
                <label>Order No</label>

                <input
                  type="text"
                  placeholder="Search order no..."
                  value={orderFilter}
                  onChange={(e) => {
                    setOrderFilter(e.target.value);
                    setPage(1);
                  }}
                />
              </div>

              {/* Payment method filter */}
              <div className="sh-filter-group">
                <label>Payment Method</label>

                <select
                  value={paymentFilter}
                  onChange={(e) => {
                    setPaymentFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="">All Payments</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                </select>
              </div>

              {/* Clear filters */}
              <button
                type="button"
                className="sh-clear-button"
                onClick={clearFilters}
              >
                Clear
              </button>

              {/* Export CSV */}
              <button
                type="button"
                className="sh-export-button"
                onClick={exportCSV}
                disabled={loading || sales.length === 0}
              >
                <Download size={15} />
                Export
              </button>

            </div>
          </div>

          {/* Sales table */}
          <div className="sh-table-container">

            <div className="sh-table-scroll">

              <table className="sh-table">

                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Order No</th>
                    <th>Payment</th>
                    <th style={{ textAlign: "right" }}>Items</th>
                    <th style={{ textAlign: "right" }}>Amount</th>
                    <th style={{ textAlign: "right" }}>Details</th>
                  </tr>
                </thead>

                <tbody>

                  {/* Loading */}
                  {loading && (
                    <tr>
                      <td colSpan="6" className="sh-empty">
                        Loading sales records...
                      </td>
                    </tr>
                  )}

                  {/* Sales records */}
              
                  {!loading && sales.map((sale) => (
                    
                    <tr key={sale.order_id}>

                      <td>
                        {formatDate(sale.date)}
                      </td>

                      <td className="sh-order-id">
                        {sale.order_no}
                      </td>

                      <td>
                        {sale.payment_method}
                      </td>

                      <td style={{ textAlign: "right" }}>
                        {Number(sale.item_count).toFixed(2)}
                      </td>

                      <td style={{ textAlign: "right" }}className="sh-amount">
                        {formatMoney(sale.amount)}
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <button
                          className="sh-view-button"
                          onClick={() =>
                            handleViewSale(sale.order_id)
                          }
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>

                    </tr>
                  ))}

                  {/* Empty state */}
                  {!loading && sales.length === 0 && (
                    <tr>
                      <td colSpan="6" className="sh-empty">
                        No sales found. Try another search.
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>

            </div>

            {/* Table footer */}
            <div className="sh-table-footer">

              <span className="sh-results">
                Showing{" "}
                {totalRecords === 0
                  ? 0
                  : (page - 1) * rowsPerPage + 1}
                –
                {Math.min(
                  page * rowsPerPage,
                  totalRecords
                )}{" "}
                of {totalRecords} transactions
              </span>

              <div className="sh-pagination">

                <button
                  disabled={page === 1 || loading}
                  onClick={() =>
                    setPage((value) => Math.max(1, value - 1))
                  }
                >
                  <ChevronLeft size={16} />
                </button>

                <span>
                  {page} / {totalPages}
                </span>

                <button
                  disabled={page >= totalPages || loading}
                  onClick={() =>
                    setPage((value) =>
                      Math.min(totalPages, value + 1)
                    )
                  }
                >
                  <ChevronRight size={16} />
                </button>

              </div>
            </div>

          </div>

          <div className="sh-bottom-note">
            <span>
              © Smart POS · FoodCity Smart POS System
            </span>
          </div>

        </section>
      </main>

      {/* Transaction details modal */}
      {(selectedSale || detailLoading) && (
        <div
          className="sh-modal-backdrop"
          onClick={() => {
            if (!detailLoading) {
              setSelectedSale(null);
            }
          }}
        >

          <section
            className="sh-modal"
            onClick={(e) => e.stopPropagation()}
          >

            {detailLoading ? (
              <div className="sh-empty">
                Loading transaction details...
              </div>
            ) : (
              <>
                {/* Modal heading */}
                <div className="sh-modal-heading">

                  <div>
                    <h2>Transaction Details</h2>
                    <p>{selectedSale.order_no}</p>
                  </div>

                  <button
                    onClick={() => setSelectedSale(null)}
                  >
                    <X size={19} />
                  </button>

                </div>

                {/* Order information */}
                <div className="sh-detail-row">
                  <span>Date</span>
                  <strong>
                    {formatDate(selectedSale.date)}
                  </strong>
                </div>

                <div className="sh-detail-row">
                  <span>Order No</span>
                  <strong>{selectedSale.order_no}</strong>
                </div>

                <div className="sh-detail-row">
                  <span>Payment Method</span>
                  <strong>
                    {selectedSale.payment_method}
                  </strong>
                </div>

                {/* Ordered items */}
                <div className="sh-order-items">

                  <h3>Ordered Items</h3>

                  <div className="sh-table-scroll">
                    <table className="sh-table">

                      <thead>
                        <tr>
                          <th>Item</th>
                          <th style={{ textAlign: "right" }}>Qty</th>
                          <th style={{ textAlign: "right" }}>Unit Price</th>
                          <th style={{ textAlign: "right" }}>Amount</th>
                        </tr>
                      </thead>

                      <tbody>

                        {selectedSale.items &&
                          selectedSale.items.map((item) => (
                            <tr key={item.order_detail_id}>

                              <td>
                                {item.item_name}
                              </td>

                              <td style={{ textAlign: "right" }}>
                                {Number(item.quantity).toFixed(2)}
                                </td>

                              <td style={{ textAlign: "right" }}>
                                {formatMoney(item.unit_price)}
                              </td>

                              <td style={{ textAlign: "right" }} className="sh-amount">
                                {formatMoney(item.amount)}
                              </td>

                            </tr>
                          ))}

                        {(!selectedSale.items ||
                          selectedSale.items.length === 0) && (
                          <tr>
                            <td colSpan="4" className="sh-empty">
                              No items found.
                            </td>
                          </tr>
                        )}

                      </tbody>

                    </table>
                  </div>

                </div>

                {/* Amount summary */}
                <div className="sh-detail-row">
                  <span>Subtotal</span>
                  <strong>
                    {formatMoney(
                      Number(selectedSale.amount || 0) +
                      Number(selectedSale.discount_price || 0)
                    )}
                  </strong>
                </div>

                <div className="sh-detail-row">
                  <span>Discount</span>
                  <strong>
                    {formatMoney(selectedSale.discount_price)}
                  </strong>
                </div>
                <div className="sh-detail-total">
                  <span>Received Amount</span>
                  <strong>
                    {formatMoney(selectedSale.amount_paid)}
                  </strong>
                </div>

                <div className="sh-detail-total">
                  <span>Total Amount</span>
                  <strong>
                    {formatMoney(selectedSale.amount)}
                  </strong>
                </div>
                
                <div className="sh-detail-total">
                  <span>Balance Amount</span>
                  <strong>
                    {formatMoney(selectedSale.change_amount)}
                  </strong>
                </div>

              </>
            )}

          </section>

        </div>
      )}

    </div>
  );
}