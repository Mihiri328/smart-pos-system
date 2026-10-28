
import { useMemo, useState } from "react";
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
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  Store,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
} from "lucide-react";

import logo from "../img/black logo.png";
import "./Dashboard.css";
import "./SalesHistory.css";

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
  { date: "25/10/2026", id: "POS-10219", amount: 1500, payment: "QR Pay", items: 2, status: "Completed" },
  { date: "25/10/2026", id: "POS-10218", amount: 3900, payment: "Cash", items: 4, status: "Completed" },
  { date: "25/10/2026", id: "POS-10217", amount: 4800, payment: "Card", items: 5, status: "Completed" },
  { date: "24/10/2026", id: "POS-10216", amount: 2600, payment: "Cash", items: 3, status: "Completed" },
  { date: "24/10/2026", id: "POS-10215", amount: 5600, payment: "Card", items: 7, status: "Completed" },
  { date: "23/10/2026", id: "POS-10214", amount: 2200, payment: "Cash", items: 2, status: "Completed" },
  { date: "23/10/2026", id: "POS-10213", amount: 3100, payment: "QR Pay", items: 4, status: "Completed" },
  { date: "22/10/2026", id: "POS-10212", amount: 6100, payment: "Card", items: 6, status: "Completed" },
  { date: "22/10/2026", id: "POS-10211", amount: 1700, payment: "Cash", items: 2, status: "Completed" },
  { date: "21/10/2026", id: "POS-10210", amount: 4500, payment: "Card", items: 5, status: "Completed" },
  { date: "21/10/2026", id: "POS-10209", amount: 2900, payment: "Cash", items: 3, status: "Completed" },
  { date: "20/10/2026", id: "POS-10208", amount: 5200, payment: "QR Pay", items: 5, status: "Completed" },
  { date: "20/10/2026", id: "POS-10207", amount: 3400, payment: "Card", items: 4, status: "Completed" },
  { date: "19/10/2026", id: "POS-10206", amount: 2400, payment: "Cash", items: 3, status: "Completed" },
  { date: "19/10/2026", id: "POS-10205", amount: 3900, payment: "Card", items: 5, status: "Completed" },
];

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "POS Billing", icon: ShoppingCart },
  { label: "Products Management", icon: Package },
  { label: "Inventory", icon: Warehouse },
  { label: "Suppliers Management", icon: Truck },
  { label: "Purchase Orders", icon: ClipboardList },
  { label: "Customer Management", icon: Users },
  { label: "Sales History", icon: History },
  { label: "Reports", icon: ChartNoAxesCombined },
  { label: "Settings", icon: Settings },
];

const pageMap = {
  Dashboard: "dashboard",
  "POS Billing": "billing",
  "Products Management": "products",
  Inventory: "inventory",
  "Suppliers Management": "suppliers",
  "Purchase Orders": "purchase-orders",
  "Customer Management": "customers",
  "Sales History": "sales-history",
  Reports: "reports",
  Settings: "settings",
};

const formatMoney = (amount) =>
  `Rs. ${Number(amount).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function SalesHistory({ onNavigate }) {
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

  function chooseNav(label) {
    setMobileMenu(false);

    if (onNavigate && pageMap[label]) {
      onNavigate(pageMap[label]);
    } else if (label !== "Sales History") {
      setNotice(`${label} page is not connected yet.`);
    }
  }

  function exportCSV() {
    const headings = [
      "Date",
      "Order ID",
      "Amount (LKR)",
      "Payment",
      "Items",
      "Status",
    ];

    const rows = filteredSales.map((sale) => [
      sale.date,
      sale.id,
      sale.amount,
      sale.payment,
      sale.items,
      sale.status,
    ]);

    const csv = [headings, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

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
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`sp-nav-item ${
                label === "Sales History" ? "selected" : ""
              }`}
              onClick={() => chooseNav(label)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sp-sidebar-bottom">
          <div className="sp-help-card">
            <strong>Need help?</strong>
            <p>
              Check your stock and sales insights to make better decisions.
            </p>
          </div>

          <button
            className="sp-nav-item"
            onClick={() => setNotice("Connect this button to your logout function.")}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {mobileMenu && (
        <button
          className="sp-backdrop"
          onClick={() => setMobileMenu(false)}
          aria-label="Close navigation"
        />
      )}

      <main className="sp-main sh-main">
        <header className="sp-topbar sh-topbar">
          <button
            className="sp-mobile-menu"
            onClick={() => setMobileMenu(true)}
            aria-label="Open menu"
          >
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
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search sales..."
                aria-label="Search sales"
              />
              {search && (
                <button
                  type="button"
                  className="sh-clear-search"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </label>

            <div className="sp-notification-wrap">
              <button
                className="sp-icon-button"
                onClick={() => setShowNotifications((value) => !value)}
                aria-label="Notifications"
              >
                <Bell size={19} />
                <i>4</i>
              </button>

              {showNotifications && (
                <div className="sp-notification-pop">
                  <strong>Notifications</strong>
                  <p>3 products have critical stock.</p>
                  <p>5 products are expiring soon.</p>
                  <p>2 purchase orders are pending.</p>
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
              <Download size={15} />
              Export CSV
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
                      <td>
                        <span className="sh-status">{sale.status}</span>
                      </td>
                      <td>
                        <button
                          className="sh-view-button"
                          onClick={() => setSelectedSale(sale)}
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}

                  {visibleSales.length === 0 && (
                    <tr>
                      <td colSpan="7" className="sh-empty">
                        No sales found. Try another search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="sh-table-footer">
              <span className="sh-results">
                Showing{" "}
                {filteredSales.length === 0
                  ? 0
                  : (currentPage - 1) * rowsPerPage + 1}
                {"–"}
                {Math.min(currentPage * rowsPerPage, filteredSales.length)} of{" "}
                {filteredSales.length} transactions
              </span>

              <div className="sh-pagination">
                <button
                  aria-label="Previous page"
                  disabled={currentPage === 1}
                  onClick={() => setPage((value) => Math.max(1, value - 1))}
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .filter(
                    (number) =>
                      number === 1 ||
                      number === totalPages ||
                      Math.abs(number - currentPage) <= 1
                  )
                  .map((number, index, numbers) => (
                    <span className="sh-page-number-wrap" key={number}>
                      {index > 0 && numbers[index - 1] !== number - 1 && (
                        <span className="sh-ellipsis">…</span>
                      )}
                      <button
                        className={currentPage === number ? "active" : ""}
                        onClick={() => setPage(number)}
                        aria-label={`Page ${number}`}
                        aria-current={currentPage === number ? "page" : undefined}
                      >
                        {number}
                      </button>
                    </span>
                  ))}

                <button
                  aria-label="Next page"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setPage((value) => Math.min(totalPages, value + 1))
                  }
                >
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
        <div
          className="sh-modal-backdrop"
          onClick={() => setSelectedSale(null)}
        >
          <section
            className="sh-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sh-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sh-modal-heading">
              <div>
                <h2 id="sh-modal-title">Transaction Details</h2>
                <p>{selectedSale.id}</p>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                aria-label="Close details"
              >
                <X size={19} />
              </button>
            </div>

            <div className="sh-detail-row">
              <span>Date</span>
              <strong>{selectedSale.date}</strong>
            </div>
            <div className="sh-detail-row">
              <span>Order ID</span>
              <strong>{selectedSale.id}</strong>
            </div>
            <div className="sh-detail-row">
              <span>Payment method</span>
              <strong>{selectedSale.payment}</strong>
            </div>
            <div className="sh-detail-row">
              <span>Number of items</span>
              <strong>{selectedSale.items}</strong>
            </div>
            <div className="sh-detail-row">
              <span>Status</span>
              <strong className="sh-modal-completed">
                {selectedSale.status}
              </strong>
            </div>
            <div className="sh-detail-total">
              <span>Total amount</span>
              <strong>{formatMoney(selectedSale.amount)}</strong>
            </div>

            <button
              className="sh-close-details"
              onClick={() => setSelectedSale(null)}
            >
              Close
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
