import { useMemo, useState, useEffect } from "react";
import logo from "../img/black logo.png";
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
  CalendarDays,
  Plus,
  Filter,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Crown,
  UserRound,
  UserPlus,
  CheckCircle2,
} from "lucide-react";

import "../style.css";

const initialCustomers = [
  { id: 1, name: "Kasun Perera", phone: "0712345678", email: "kasun@gmail.com", spent: 24500, joined: "2026-09-02", status: "Active" },
  { id: 2, name: "Nimali Fernando", phone: "0774567890", email: "nimali@gmail.com", spent: 18750, joined: "2026-09-05", status: "Active" },
  { id: 3, name: "Amal Silva", phone: "0751234567", email: "amal@gmail.com", spent: 12500, joined: "2026-08-20", status: "Inactive" },
  { id: 4, name: "Tharushi Jayawardena", phone: "0769876543", email: "tharushi@gmail.com", spent: 32400, joined: "2026-09-12", status: "Active" },
  { id: 5, name: "Sahan Kumara", phone: "0723456789", email: "sahan@gmail.com", spent: 9800, joined: "2026-10-03", status: "Active" },
  { id: 6, name: "Dilani Perera", phone: "0709876543", email: "dilani@gmail.com", spent: 15600, joined: "2026-10-10", status: "Inactive" },
  { id: 7, name: "Ravindu Silva", phone: "0781234567", email: "ravindu@gmail.com", spent: 28900, joined: "2026-10-15", status: "Active" },
  { id: 8, name: "Ishara Fernando", phone: "0745678901", email: "ishara@gmail.com", spent: 7600, joined: "2026-10-18", status: "Active" },
];

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, page: "dashboard" },
  { label: "POS Billing", icon: ShoppingCart, page: "billing" },
  { label: "Products Management", icon: Package, page: "products" },
  { label: "Inventory", icon: Warehouse, page: "inventory", count: 5 },
  { label: "Suppliers Management", icon: Truck, page: "suppliers" },
  { label: "Purchase Orders", icon: ClipboardList, page: "Purchase Orders" },
  { label: "Customer Management", icon: Users, page: "customers" },
  { label: "Sales History", icon: History, page: "sales_history" },
  { label: "Reports", icon: ChartNoAxesCombined, page: "reports" },
  { label: "Settings", icon: Settings, page: "settings" },
];

const emptyCustomer = {
  name: "",
  phone: "",
  email: "",
  spent: "0",
  status: "Active",
};

const loyaltyInfo = {
  1: { points: 245, level: "Silver" },
  2: { points: 390, level: "Gold" },
  4: { points: 520, level: "Platinum" },
  7: { points: 310, level: "Gold" },
};

const money = (amount) =>
  Number(amount || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function CustomerManagement({ onNavigate, onLogout }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState(emptyCustomer);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const pageSize = 5;

  useEffect(() => {
    if (!notice) return;

    const timer = window.setTimeout(() => setNotice(""), 3000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const text =
        `${customer.name} ${customer.phone} ${customer.email}`.toLowerCase();

      return (
        text.includes(query) &&
        (filter === "All" || customer.status === filter)
      );
    });
  }, [customers, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const visibleCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const activeCount = customers.filter(
    (customer) => customer.status === "Active"
  ).length;

  const currentMonth = new Date().toISOString().slice(0, 7);

  const newThisMonth = customers.filter(
    (customer) => customer.joined.startsWith(currentMonth)
  ).length;

  const loyaltyCustomers = customers.filter(
    (customer) => loyaltyInfo[customer.id]
  );

  const totalPoints = loyaltyCustomers.reduce(
    (sum, customer) => sum + loyaltyInfo[customer.id].points,
    0
  );

  function showNotice(message) {
    setNotice(message);
  }

  function navigate(pageKey) {
    setMobileMenu(false);
    setNotice("");

    if (pageKey === "customers") return;

    onNavigate?.(pageKey);
  }

  function handleLogout() {
    setMobileMenu(false);

    if (onLogout) {
      onLogout();
    } else {
      onNavigate?.("login");
    }
  }

  function openAddModal() {
    setEditingId(null);
    setForm(emptyCustomer);
    setShowModal(true);
  }

  function openEditModal(customer) {
    setEditingId(customer.id);
    setForm({
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      spent: String(customer.spent),
      status: customer.status,
    });
    setShowModal(true);
  }

  function saveCustomer(event) {
    event.preventDefault();

    if (editingId !== null) {
      setCustomers((current) =>
        current.map((customer) =>
          customer.id === editingId
            ? {
                ...customer,
                ...form,
                spent: Number(form.spent) || 0,
              }
            : customer
        )
      );

      showNotice("Customer updated successfully!");
    } else {
      const customer = {
        ...form,
        id: Date.now(),
        spent: Number(form.spent) || 0,
        joined: new Date().toISOString().slice(0, 10),
      };

      setCustomers((current) => [customer, ...current]);
      setPage(1);
      showNotice("Customer added successfully!");
    }

    setShowModal(false);
    setForm(emptyCustomer);
    setEditingId(null);
  }

  function deleteCustomer(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this customer?"
    );

    if (!confirmed) return;

    const updatedCustomers = customers.filter(
      (customer) => customer.id !== id
    );

    setCustomers(updatedCustomers);

    setPage((current) =>
      Math.min(
        current,
        Math.max(1, Math.ceil(updatedCustomers.filter((customer) => {
          const query = search.trim().toLowerCase();
          const matchesSearch =
            `${customer.name} ${customer.phone} ${customer.email}`
              .toLowerCase()
              .includes(query);
          return matchesSearch && (filter === "All" || customer.status === filter);
        }).length / pageSize))
      )
    );

    showNotice("Customer deleted successfully!");
  }

  return (
    <div className="sp-dashboard customer-app">
      {/* Sidebar */}
      <aside className={`sp-sidebar ${mobileMenu ? "sp-sidebar-open" : ""}`}>
        <div className="sp-brand">
          <img src={logo} alt="Smart POS Logo" className="brand-logo" />

          <button
            type="button"
            className="sp-close-menu"
            onClick={() => setMobileMenu(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sp-nav-label">MAIN MENU</div>

        <nav className="sp-nav">
          {navigation.map(({ label, icon: Icon, page: pageKey, count }) => (
            <button
              type="button"
              key={pageKey}
              className={`sp-nav-item ${
                pageKey === "customers" ? "selected" : ""
              }`}
              onClick={() => navigate(pageKey)}
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
            <p>
              Check your stock and sales insights to make better decisions.
            </p>
          </div>

          <button
            type="button"
            className="sp-nav-item"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {mobileMenu && (
        <button
          type="button"
          className="sp-backdrop"
          onClick={() => setMobileMenu(false)}
          aria-label="Close navigation"
        />
      )}

      {/* Main */}
      <main className="sp-main customer-main">
        <header className="sp-topbar customer-header">
          <button
            type="button"
            className="sp-mobile-menu"
            onClick={() => setMobileMenu(true)}
            aria-label="Open menu"
          >
            <Menu size={21} />
          </button>

          <div className="sp-page-heading">
            <span>CUSTOMER MANAGEMENT</span>
            <h1>Customer Management</h1>
            <p>Manage your customers and their account details.</p>
          </div>

          <div className="sp-top-actions">
            <label className="sp-search customer-header-search">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search customers..."
              />
              {search && (
                <button
                  type="button"
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
                type="button"
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
                  <p>2 purchase orders pending.</p>
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
          <div className="sp-notice" role="status">
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
            >
              <X size={15} />
            </button>
          </div>
        )}

        <section className="customer-content">
          {/* Summary cards */}
          <section className="customer-summary-grid">
            <article className="customer-summary-card">
              <div className="customer-summary-top">
                <div className="customer-summary-icon blue">
                  <Users size={20} />
                </div>
                <span className="customer-green-text">Registered</span>
              </div>
              <p>Total Customers</p>
              <h2>{customers.length}</h2>
            </article>

            <article className="customer-summary-card">
              <div className="customer-summary-top">
                <div className="customer-summary-icon green">
                  <UserPlus size={20} />
                </div>
                <span className="customer-green-text">
                  +{newThisMonth} new
                </span>
              </div>
              <p>New This Month</p>
              <h2>{newThisMonth}</h2>
            </article>

            <article className="customer-summary-card">
              <div className="customer-summary-top">
                <div className="customer-summary-icon purple">
                  <CheckCircle2 size={20} />
                </div>
                <span className="customer-green-text">Active</span>
              </div>
              <p>Active Accounts</p>
              <h2>{activeCount}</h2>
            </article>
          </section>

          {/* Loyalty */}
          <section className="customer-loyalty-panel">
            <div className="customer-loyalty-heading">
              <div>
                <h2>
                  <Crown size={19} /> Loyalty Customers
                </h2>
                <p>Your valued customers and their reward points</p>
              </div>

              <span className="customer-loyalty-badge">
                {loyaltyCustomers.length} Members
              </span>
            </div>

            <div className="customer-loyalty-stats">
              <article>
                <span>Total Loyalty Members</span>
                <h3>{loyaltyCustomers.length}</h3>
              </article>

              <article>
                <span>Total Reward Points</span>
                <h3>{totalPoints.toLocaleString()}</h3>
              </article>
            </div>

            <div className="customer-loyalty-list">
              {loyaltyCustomers.map((customer) => (
                <div className="customer-loyalty-item" key={customer.id}>
                  <div className="customer-loyalty-avatar">
                    {customer.name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </div>

                  <div className="customer-loyalty-person">
                    <strong>{customer.name}</strong>
                    <span>{customer.phone}</span>
                  </div>

                  <div className="customer-loyalty-points">
                    <strong>{loyaltyInfo[customer.id].points} pts</strong>
                    <span>Reward points</span>
                  </div>

                  <span
                    className={`customer-loyalty-level ${loyaltyInfo[
                      customer.id
                    ].level.toLowerCase()}`}
                  >
                    {loyaltyInfo[customer.id].level}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Customer directory */}
          <section className="customer-directory-panel">
            <div className="customer-directory-heading">
              <div>
                <h2>Customer Directory</h2>
                <p>Manage your customers and their account details</p>
              </div>

              <div className="customer-directory-actions">
                <button
                  type="button"
                  className="customer-filter-button"
                  onClick={() => setShowFilter((current) => !current)}
                >
                  <Filter size={16} /> Filter
                </button>

                <button
                  type="button"
                  className="customer-add-button"
                  onClick={openAddModal}
                >
                  <Plus size={17} /> Add Customer
                </button>
              </div>
            </div>

            {showFilter && (
              <div className="customer-filter-row">
                <label htmlFor="customer-status-filter">
                  Customer status
                </label>

                <select
                  id="customer-status-filter"
                  value={filter}
                  onChange={(event) => {
                    setFilter(event.target.value);
                    setPage(1);
                  }}
                >
                  <option value="All">All customers</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <button
                  type="button"
                  onClick={() => {
                    setFilter("All");
                    setSearch("");
                    setPage(1);
                  }}
                >
                  Clear
                </button>
              </div>
            )}

            <div className="customer-table-wrap">
              <table className="customer-table">
                <thead>
                  <tr>
                    <th>CUSTOMER</th>
                    <th>CONTACT DETAILS</th>
                    <th>TOTAL SPENT</th>
                    <th>JOINED DATE</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <div className="customer-person-cell">
                          <div className="customer-avatar">
                            {customer.name
                              .split(" ")
                              .map((part) => part[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </div>

                          <div className="customer-person-details">
                            <strong>{customer.name}</strong>
                            <span>ID: #{String(customer.id).slice(-6)}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="customer-contact-cell">
                          <span>{customer.phone || "No phone"}</span>
                          <span>{customer.email || "No email"}</span>
                        </div>
                      </td>

                      <td>
                        <strong className="customer-spent">
                          Rs. {money(customer.spent)}
                        </strong>
                      </td>

                      <td>
                        <span className="customer-joined-date">
                          {customer.joined}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`customer-status-pill ${
                            customer.status === "Active"
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          <span className="customer-status-dot" />
                          {customer.status}
                        </span>
                      </td>

                      <td>
                        <div className="customer-action-buttons">
                          <button
                            type="button"
                            className="customer-edit-button"
                            aria-label={`Edit ${customer.name}`}
                            onClick={() => openEditModal(customer)}
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            type="button"
                            className="customer-delete-button"
                            aria-label={`Delete ${customer.name}`}
                            onClick={() => deleteCustomer(customer.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {visibleCustomers.length === 0 && (
                    <tr>
                      <td colSpan="6" className="customer-empty-row">
                        No customers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <footer className="customer-directory-footer">
              <span>
                Showing{" "}
                {filteredCustomers.length === 0
                  ? 0
                  : (currentPage - 1) * pageSize + 1}
                -
                {Math.min(
                  currentPage * pageSize,
                  filteredCustomers.length
                )}{" "}
                of {filteredCustomers.length} customers
              </span>

              <div className="customer-pagination">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setPage((current) => Math.max(1, current - 1))
                  }
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((number) => (
                  <button
                    type="button"
                    key={number}
                    className={
                      currentPage === number ? "current-page" : ""
                    }
                    onClick={() => setPage(number)}
                  >
                    {number}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setPage((current) =>
                      Math.min(totalPages, current + 1)
                    )
                  }
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </footer>
          </section>
        </section>
      </main>

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          className="customer-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <section
            className="customer-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="customer-modal-heading">
              <h2 id="customer-modal-title">
                {editingId !== null ? "Edit Customer" : "Add Customer"}
              </h2>

              <button
                type="button"
                aria-label="Close"
                onClick={() => setShowModal(false)}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={saveCustomer}>
              <label>
                Customer name *
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Enter customer name"
                />
              </label>

              <label>
                Phone number
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    setForm({ ...form, phone: event.target.value })
                  }
                  placeholder="Enter phone number"
                />
              </label>

              <label>
                Email address
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                  placeholder="Enter email address"
                />
              </label>

              <label>
                Total spent (Rs.)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.spent}
                  onChange={(event) =>
                    setForm({ ...form, spent: event.target.value })
                  }
                />
              </label>

              {editingId !== null && (
                <label>
                  Account status
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm({ ...form, status: event.target.value })
                    }
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>
              )}

              <div className="customer-modal-actions">
                <button
                  type="button"
                  className="customer-cancel-button"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="customer-add-button">
                  {editingId !== null ? "Update Customer" : "Save Customer"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}