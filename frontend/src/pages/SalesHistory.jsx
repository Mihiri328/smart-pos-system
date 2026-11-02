import { useMemo, useState } from "react";
import {
  LayoutDashboard, ShoppingCart, Package, Warehouse, Truck, ClipboardList,
  Users, History, ChartNoAxesCombined, Settings, LogOut, Search, Bell,
  ChevronDown, Menu, X, Store, ChevronLeft, ChevronRight, Download, Eye
} from "lucide-react";

import logo from "../img/black logo.png";

const salesData = [
  { date: "27/10/2026", id: "POS-10234", amount: 2500, payment: "Cash", items: 4, status: "Completed" },
  { date: "27/10/2026", id: "POS-10233", amount: 3500, payment: "Card", items: 5, status: "Completed" },
  { date: "27/10/2026", id: "POS-10232", amount: 4500, payment: "Cash", items: 3, status: "Completed" },
  { date: "27/10/2026", id: "POS-10231", amount: 5500, payment: "Card", items: 4, status: "Completed" },
  { date: "27/10/2026", id: "POS-10230", amount: 6500, payment: "Cash", items: 4, status: "Completed" },
  { date: "27/10/2026", id: "POS-10229", amount: 5500, payment: "Card", items: 7, status: "Completed" },
  { date: "27/10/2026", id: "POS-10228", amount: 6500, payment: "Cash", items: 5, status: "Completed" },
  { date: "27/10/2026", id: "POS-10227", amount: 6500, payment: "Cash", items: 4, status: "Completed" },
  { date: "27/10/2026", id: "POS-10226", amount: 5500, payment: "Card", items: 8, status: "Completed" },
  { date: "27/10/2026", id: "POS-10225", amount: 6500, payment: "Cash", items: 4, status: "Completed" },
  { date: "26/10/2026", id: "POS-10224", amount: 3200, payment: "QR Pay", items: 3, status: "Completed" },
  { date: "26/10/2026", id: "POS-10223", amount: 1800, payment: "Cash", items: 2, status: "Completed" },
  { date: "26/10/2026", id: "POS-10222", amount: 4200, payment: "Card", items: 6, status: "Completed" },
  { date: "26/10/2026", id: "POS-10221", amount: 2800, payment: "Cash", items: 3, status: "Completed" },
  { date: "26/10/2026", id: "POS-10220", amount: 7200, payment: "Card", items: 9, status: "Completed" },
];

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, page: "dashboard" },
  { label: "POS Billing", icon: ShoppingCart, page: "billing" },
  { label: "Products Management", icon: Package, page: "products" },
  { label: "Inventory", icon: Warehouse, page: "inventory", count: 5 },
  { label: "Suppliers Management", icon: Truck, page: "suppliers" },
  { label: "Purchase Orders", icon: ClipboardList, page: "purchase-orders" },
  { label: "Customer Management", icon: Users, page: "customers" },
  { label: "Sales History", icon: History, page: "sales_history" },
  { label: "Reports", icon: ChartNoAxesCombined, page: "reports" },
  { label: "Settings", icon: Settings, page: "settings" },
];

const formatMoney = (amount) =>
  `Rs. ${Number(amount).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function SalesHistory({ onNavigate, onLogout }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notice, setNotice] = useState("");
  const [selectedSale, setSelectedSale] = useState(null);

  const rowsPerPage = 10;

  const filteredSales = useMemo(() => {
    const query = search.trim().toLowerCase();
    return salesData.filter((sale) =>
      `${sale.date} ${sale.id} ${sale.amount} ${sale.payment} ${sale.status}`
        .toLowerCase()
        .includes(query)
    );
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filteredSales.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const visibleSales = filteredSales.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  function chooseNav(pageKey) {
    setMobileMenu(false);
    if (pageKey === "sales_history") return;

    if (onNavigate) {
      onNavigate(pageKey);
    } else {
      setNotice(`${pageKey} page is not connected yet.`);
    }
  }

  function handleLogout() {
    setMobileMenu(false);
    if (onLogout) {
      onLogout();
    } else if (onNavigate) {
      onNavigate("login");
    }
  }

  function exportCSV() {
    const headings = ["Date", "Order ID", "Amount (LKR)", "Payment", "Items", "Status"];
    const rows = filteredSales.map((sale) => [
      sale.date, sale.id, sale.amount, sale.payment, sale.items, sale.status,
    ]);
    const csv = [headings, ...rows].map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
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

  return (
    <div className="sp-dashboard sh-page">
      <aside className={`sp-sidebar ${mobileMenu ? "sp-sidebar-open" : ""}`}>
        <div className="sp-brand">
          <img src={logo} alt="Smart POS Logo" className="brand-logo" />
          <button className="sp-close-menu" onClick={() => setMobileMenu(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <div className="sp-nav-label">MAIN MENU</div>

        <nav className="sp-nav">
          {navItems.map(({ label, icon: Icon, page: pageKey, count }) => (
            <button
              key={pageKey}
              className={`sp-nav-item ${pageKey === "sales_history" ? "selected" : ""}`}
              onClick={() => chooseNav(pageKey)}
            >
              <Icon size={18} />
              <span>{label}</span>
              {count && <span className="sp-nav-count">{count}</span>}
            </button>
          ))}
        </nav>

        <div className="sp-sidebar-bottom">
          <div className="sp-help-card">
            <strong>Need help?</strong>
            <p>Check your stock and sales insights to make better decisions.</p>
          </div>

          <button className="sp-nav-item" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {mobileMenu && (
        <button className="sp-backdrop" onClick={() => setMobileMenu(false)} aria-label="Close navigation" />
      )}

      <main className="sp-main sh-main">
        <header className="sp-topbar sh-topbar">
          <button className="sp-mobile-menu" onClick={() => setMobileMenu(true)} aria-label="Open menu">
            <Menu size={21} />
          </button>

          <div className="sp-page-heading sh-heading">
            <span>TRANSACTIONS</span>
            <h1>Sales History</h1>
            <p>Review and manage your store sales.</p>
          </div>

          <div className="sp-top-actions">
            <label className="sp-search sh-search">
              <Search size={17} />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search sales..." />
              {search && (
                <button type="button" className="sh-clear-search" onClick={() => { setSearch(""); setPage(1); }}>
                  <X size={14} />
                </button>
              )}
            </label>

            <div className="sp-notification-wrap">
              <button className="sp-icon-button" onClick={() => setShowNotifications((v) => !v)}>
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
              <ChevronDown size={14} />
            </div>
          </div>
        </header>

        {notice && (
          <div className="sp-notice">
            <span>{notice}</span>
            <button onClick={() => setNotice("")} aria-label="Dismiss message">
              <X size={15} />
            </button>
          </div>
        )}

        <section className="sh-content">
          <div className="sh-table-heading">
            <div>
              <h2>All Transactions</h2>
              <p>View and track your completed sales.</p>
            </div>
            <button className="sh-export-button" onClick={exportCSV}>
              <Download size={15} /> Export CSV
            </button>
          </div>

          <div className="sh-table-container">
            <div className="sh-table-scroll">
              <table className="sh-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Order ID</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Items</th>
                    <th>Status</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleSales.map((sale) => (
                    <tr key={sale.id}>
                      <td>{sale.date}</td>
                      <td className="sh-order-id">{sale.id}</td>
                      <td className="sh-amount">{formatMoney(sale.amount)}</td>
                      <td>{sale.payment}</td>
                      <td>{sale.items}</td>
                      <td><span className="sh-status">{sale.status}</span></td>
                      <td>
                        <button className="sh-view-button" onClick={() => setSelectedSale(sale)}>
                          <Eye size={14} /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                  {visibleSales.length === 0 && (
                    <tr>
                      <td colSpan="7" className="sh-empty">No sales found. Try another search.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="sh-table-footer">
              <span className="sh-results">
                Showing {filteredSales.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}–{Math.min(currentPage * rowsPerPage, filteredSales.length)} of {filteredSales.length} transactions
              </span>

              <div className="sh-pagination">
                <button disabled={currentPage === 1} onClick={() => setPage((v) => Math.max(1, v - 1))}>
                  <ChevronLeft size={16} />
                </button>
                <button disabled={currentPage === totalPages} onClick={() => setPage((v) => Math.min(totalPages, v + 1))}>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="sh-bottom-note">
            <Store size={15} />
            <span>Smart POS · Food City Management</span>
            <span className="sh-demo-label">Sample data</span>
          </div>
        </section>
      </main>

      {selectedSale && (
        <div className="sh-modal-backdrop" onClick={() => setSelectedSale(null)}>
          <section className="sh-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sh-modal-heading">
              <div>
                <h2>Transaction Details</h2>
                <p>{selectedSale.id}</p>
              </div>
              <button onClick={() => setSelectedSale(null)}><X size={19} /></button>
            </div>
            <div className="sh-detail-row"><span>Date</span><strong>{selectedSale.date}</strong></div>
            <div className="sh-detail-row"><span>Order ID</span><strong>{selectedSale.id}</strong></div>
            <div className="sh-detail-row"><span>Payment method</span><strong>{selectedSale.payment}</strong></div>
            <div className="sh-detail-row"><span>Number of items</span><strong>{selectedSale.items}</strong></div>
            <div className="sh-detail-row"><span>Status</span><strong className="sh-modal-completed">{selectedSale.status}</strong></div>
            <div className="sh-detail-total"><span>Total amount</span><strong>{formatMoney(selectedSale.amount)}</strong></div>
            <button className="sh-close-details" onClick={() => setSelectedSale(null)}>Close</button>
          </section>
        </div>
      )}
    </div>
  );
}