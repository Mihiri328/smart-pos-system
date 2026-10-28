
import { useMemo, useState } from "react";
import "./SupplierManagement.css";
import logo from "../img/Dark logo.jpeg";

const initialSuppliers = [
  {
    id: 1,
    initials: "LB",
    company: "Lanka Beverages PLC",
    contact: "Manish Perera",
    phone: "0712345678",
    email: "orders@lankabev.lk",
    balance: 145000,
    due: "Due in 3 days",
    status: "Active",
  },
  {
    id: 2,
    initials: "MF",
    company: "Milo Foods Distributors",
    contact: "Saman Kumara",
    phone: "0114567890",
    email: "saman@milofoods.com",
    balance: 82450,
    due: "Paid on May 15",
    status: "Active",
  },
  {
    id: 3,
    initials: "LB",
    company: "Lanka Beverages PLC",
    contact: "Manish Perera",
    phone: "0712345678",
    email: "orders@lankabev.lk",
    balance: 145000,
    due: "Due in 3 days",
    status: "On hold",
  },
  {
    id: 4,
    initials: "MF",
    company: "Milo Foods Distributors",
    contact: "Saman Kumara",
    phone: "0114567890",
    email: "saman@milofoods.com",
    balance: 145000,
    due: "Due in 3 days",
    status: "Active",
  },
  ...Array.from({ length: 6 }, (_, i) => ({
    id: i + 5,
    initials: i % 2 === 0 ? "LB" : "MF",
    company:
      i % 2 === 0 ? "Lanka Beverages PLC" : "Milo Foods Distributors",
    contact: i % 2 === 0 ? "Manish Perera" : "Saman Kumara",
    phone: i % 2 === 0 ? "0712345678" : "0114567890",
    email: i % 2 === 0 ? "orders@lankabev.lk" : "saman@milofoods.com",
    balance: 145000,
    due: "Due in 3 days",
    status: "Active",
  })),
];

const money = (amount) =>
  Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const menuItems = [
  ["▦", "Dashboard"],
  ["🛒", "POS Billing"],
  ["▣", "Products Management"],
  ["⌂", "Inventory"],
  ["♟", "Suppliers Management"],
  ["▤", "Purchase Orders"],
  ["♧", "Customer Management"],
  ["◕", "Sales History"],
  ["◷", "Reports"],
  ["⚙", "Settings"],
  ["⇥", "Logout"],
];

export default function SupplierManagement({ onNavigate, currentPage }) {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [notice, setNotice] = useState("");
  const [newSupplier, setNewSupplier] = useState({
    company: "",
    contact: "",
    phone: "",
    email: "",
    balance: "0",
  });

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      const text = `${supplier.company} ${supplier.contact} ${supplier.phone} ${supplier.email}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesFilter =
        filter === "All" || supplier.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [suppliers, search, filter]);

  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(filteredSuppliers.length / pageSize));
  const visibleSuppliers = filteredSuppliers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const totalPayable = suppliers.reduce(
    (sum, supplier) => sum + Number(supplier.balance || 0),
    0
  );

  function addSupplier(event) {
    event.preventDefault();

    const supplier = {
      ...newSupplier,
      id: Date.now(),
      initials: newSupplier.company
        .split(" ")
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase())
        .join(""),
      balance: Number(newSupplier.balance) || 0,
      due: "New supplier",
      status: "Active",
    };

    setSuppliers((current) => [supplier, ...current]);
    setNewSupplier({
      company: "",
      contact: "",
      phone: "",
      email: "",
      balance: "0",
    });
    setPage(1);
    setShowModal(false);
    setNotice("Supplier added successfully!");
    setTimeout(() => setNotice(""), 3000);
  }

  return (
    <div className="supplier-app">
      <aside className="supplier-sidebar">
        <div className="brand">
          <img src={logo} alt="Smart POS Logo" className="brand-logo" />
          
        </div>

        <nav className="side-menu">
          {menuItems.map(([icon, label]) => {
  const pageMap = {
    "Products Management": "products",
    Inventory: "inventory",
    "Suppliers Management": "suppliers",
  };

  const activeLabel = {
    products: "Products Management",
    inventory: "Inventory",
    suppliers: "Suppliers Management",
  }[currentPage];

  return (
    <button
      type="button"
      key={label}
      className={`side-link ${
        label === activeLabel ? "selected" : ""
      }`}
      onClick={() => {
        if (pageMap[label] && onNavigate) {
          onNavigate(pageMap[label]);
        } else {
          setNotice(`${label} page navigation is not connected yet.`);
          setTimeout(() => setNotice(""), 2500);
        }
      }}
    >
      <span className="side-icon">{icon}</span>
      <span>{label}</span>
    </button>
  );
})}
        </nav>
      </aside>

      <main className="supplier-main">
        <header className="supplier-topbar">
          <h1>Supplier Management</h1>

          <div className="global-search">
            <input
              aria-label="Search suppliers"
              placeholder="Search anything ..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <span>⌕</span>
          </div>

          <button
            type="button"
            className="notification"
            aria-label="Notifications"
            onClick={() => setNotice("You have 4 notifications.")}
          >
            ♟<span>4</span>
          </button>

          <div className="date-display">
            <span>2026/ 09 / 13</span>
            <span className="calendar-icon">▦</span>
          </div>
        </header>

        {notice && <div className="supplier-toast">{notice}</div>}

        <section className="summary-grid">
          <article className="summary-card">
            <div className="summary-top">
              <div className="summary-icon blue">▣</div>
              <span className="green-text">12.5%</span>
            </div>
            <p>Total Accounts Payable</p>
            <h2>Rs. {money(totalPayable)}</h2>
          </article>

          <article className="summary-card">
            <div className="summary-top">
              <div className="summary-icon green">♟</div>
              <span className="green-text">2 New</span>
            </div>
            <p>Active Suppliers</p>
            <h2>{suppliers.filter((s) => s.status === "Active").length + 38}</h2>
          </article>

          <article className="summary-card">
            <div className="summary-top">
              <div className="summary-icon red">🚚</div>
              <span className="red-text">! &nbsp;5 Pending</span>
            </div>
            <p>Pending Deliveries</p>
            <h2>12</h2>
          </article>

          <article className="summary-card">
            <div className="summary-top">
              <div className="summary-icon red">▤</div>
              <span className="red-text">Overdue</span>
            </div>
            <p>Overdue Invoices</p>
            <h2>Rs. 124,000.00</h2>
          </article>
        </section>

        <section className="supplier-content">
          <div className="directory-panel">
            <div className="directory-heading">
              <div>
                <h2>Supplier Directory</h2>
                <p>Manage your supplier relationships and balances</p>
              </div>

              <div className="directory-actions">
                <button
                  className="filter-button"
                  type="button"
                  onClick={() => setShowFilter((current) => !current)}
                >
                  Filter
                </button>
                <button
                  className="add-button"
                  type="button"
                  onClick={() => setShowModal(true)}
                >
                  + &nbsp; Add Supplier
                </button>
              </div>
            </div>

            {showFilter && (
              <div className="filter-row">
                <label htmlFor="supplier-status">Supplier status</label>
                <select
                  id="supplier-status"
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setPage(1);
                  }}
                >
                  <option>All</option>
                  <option>Active</option>
                  <option>On hold</option>
                </select>
                <button type="button" onClick={() => setFilter("All")}>
                  Clear
                </button>
              </div>
            )}

            <div className="supplier-table-wrap">
              <table className="supplier-table">
                <thead>
                  <tr>
                    <th>COMPANY &amp;<br /> CONTACT</th>
                    <th>COMMUNICATION</th>
                    <th>PAYABLE<br /> BALANCE</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleSuppliers.map((supplier) => (
                    <tr key={supplier.id}>
                      <td>
                        <div className="company-cell">
                          <div className="company-avatar">
                            {supplier.initials}
                          </div>
                          <div className="company-details">
                            <strong>{supplier.company}</strong>
                            <span>{supplier.contact}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="communication-cell">
                          <span>{supplier.phone}</span>
                          <span>{supplier.email}</span>
                        </div>
                      </td>

                      <td>
                        <div className="balance-cell">
                          <strong>Rs. {money(supplier.balance)}</strong>
                          <span className={supplier.due.startsWith("Due") ? "due-red" : "due-green"}>
                            {supplier.due}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`status-pill ${
                            supplier.status === "Active" ? "active" : "hold"
                          }`}
                        >
                          {supplier.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {visibleSuppliers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="empty-row">
                        No suppliers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <footer className="directory-footer">
              <span>
                Showing{" "}
                {filteredSuppliers.length === 0
                  ? 0
                  : (page - 1) * pageSize + 1}
                -
                {Math.min(page * pageSize, filteredSuppliers.length)} of{" "}
                {filteredSuppliers.length} suppliers
              </span>

              <div className="pagination">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  &lt;
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (number) => (
                    <button
                      type="button"
                      key={number}
                      className={page === number ? "current-page" : ""}
                      onClick={() => setPage(number)}
                    >
                      {number}
                    </button>
                  )
                )}

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() =>
                    setPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  &gt;
                </button>
              </div>
            </footer>
          </div>

          <aside className="grn-panel">
            <div className="grn-heading">
              <h3>Recent GRNs</h3>
              <button type="button" onClick={() => setNotice("All GRNs view is not connected yet.")}>
                View All
              </button>
            </div>

            {[1, 2, 3].map((item) => (
              <article className="grn-card" key={item}>
                <div className={`grn-icon grn-${item}`}>▤</div>
                <div className="grn-name">
                  <strong>Name 123</strong>
                  <span>sri lanka</span>
                  <span>PLC</span>
                </div>
                <div className="grn-amount">
                  <strong>Rs. 400.00</strong>
                  <span>Today, 10.45</span>
                  <span>AM</span>
                </div>
              </article>
            ))}
          </aside>
        </section>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <section
            className="supplier-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-supplier-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-heading">
              <h2 id="add-supplier-title">Add Supplier</h2>
              <button type="button" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={addSupplier}>
              <label>
                Company name *
                <input
                  required
                  value={newSupplier.company}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, company: e.target.value })
                  }
                  placeholder="Enter company name"
                />
              </label>

              <label>
                Contact person *
                <input
                  required
                  value={newSupplier.contact}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, contact: e.target.value })
                  }
                  placeholder="Enter contact person"
                />
              </label>

              <label>
                Phone number
                <input
                  value={newSupplier.phone}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, phone: e.target.value })
                  }
                  placeholder="Enter phone number"
                />
              </label>

              <label>
                Email address
                <input
                  type="email"
                  value={newSupplier.email}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, email: e.target.value })
                  }
                  placeholder="Enter email"
                />
              </label>

              <label>
                Payable balance (Rs.)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newSupplier.balance}
                  onChange={(e) =>
                    setNewSupplier({ ...newSupplier, balance: e.target.value })
                  }
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="add-button">
                  Save Supplier
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
