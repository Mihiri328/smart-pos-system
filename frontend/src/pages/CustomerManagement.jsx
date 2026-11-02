import { useMemo, useState } from "react";
import "./CustomerManagement.css";

const initialCustomers = [
  {
    id: 1,
    name: "Kasun Perera",
    phone: "0712345678",
    email: "kasun@gmail.com",
    spent: 24500,
    joined: "2026-09-02",
    status: "Active",
  },
  {
    id: 2,
    name: "Nimali Fernando",
    phone: "0774567890",
    email: "nimali@gmail.com",
    spent: 18750,
    joined: "2026-09-05",
    status: "Active",
  },
  {
    id: 3,
    name: "Amal Silva",
    phone: "0751234567",
    email: "amal@gmail.com",
    spent: 12500,
    joined: "2026-08-20",
    status: "Inactive",
  },
  {
    id: 4,
    name: "Tharushi Jayawardena",
    phone: "0769876543",
    email: "tharushi@gmail.com",
    spent: 32400,
    joined: "2026-09-12",
    status: "Active",
  },
  {
    id: 5,
    name: "Sahan Kumara",
    phone: "0723456789",
    email: "sahan@gmail.com",
    spent: 9800,
    joined: "2026-10-03",
    status: "Active",
  },
  {
    id: 6,
    name: "Dilani Perera",
    phone: "0709876543",
    email: "dilani@gmail.com",
    spent: 15600,
    joined: "2026-10-10",
    status: "Inactive",
  },
  {
    id: 7,
    name: "Ravindu Silva",
    phone: "0781234567",
    email: "ravindu@gmail.com",
    spent: 28900,
    joined: "2026-10-15",
    status: "Active",
  },
  {
    id: 8,
    name: "Ishara Fernando",
    phone: "0745678901",
    email: "ishara@gmail.com",
    spent: 7600,
    joined: "2026-10-18",
    status: "Active",
  },
];

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

const money = (amount) =>
  Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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


export default function CustomerManagement({
  currentPage,
  onNavigate,
  onLogout,
}) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState(emptyCustomer);

  const pageSize = 5;

  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const text =
        `${customer.name} ${customer.phone} ${customer.email}`.toLowerCase();

      return (
        text.includes(search.toLowerCase()) &&
        (filter === "All" || customer.status === filter)
      );
    });
  }, [customers, search, filter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / pageSize)
  );

  const visibleCustomers = filteredCustomers.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const activeCount = customers.filter(
    (customer) => customer.status === "Active"
  ).length;

  const currentMonth = new Date().toISOString().slice(0, 7);

  const newThisMonth = customers.filter(
    (customer) => customer.joined.startsWith(currentMonth)
  ).length;

  const totalSpent = customers.reduce(
    (sum, customer) => sum + Number(customer.spent || 0),
    0
  );

  function showNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
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

    setCustomers((current) =>
      current.filter((customer) => customer.id !== id)
    );

    setPage((currentPage) =>
      Math.min(
        currentPage,
        Math.max(
          1,
          Math.ceil(
            customers.filter((customer) => customer.id !== id).length /
              pageSize
          )
        )
      )
    );

    showNotice("Customer deleted successfully!");
  }

  return (
    <div className="customer-app">
      <aside className="customer-sidebar">
        <div className="customer-brand">
          <img
            src="/src/img/Dark%20logo.jpeg"
            alt="Smart POS Food City Logo"
            className="customer-brand-logo"
          />
        </div>


        <nav className="customer-side-menu">
          {menuItems.map(([icon, label]) => (
            <button
              type="button"
              key={label}
              className={`customer-side-link ${
                label === "Customer Management" ? "selected" : ""
              }`}
              onClick={() => {
                const pageRoutes = {
                  Dashboard: "dashboard",
                  "POS Billing": "billing",
                  "Products Management": "products",
                  Inventory: "inventory",
                  "Suppliers Management": "suppliers",
                  "Purchase Orders": "Purchase Orders",
                  "Customer Management": "customers",
                  "Sales History": "sales_history",
                  Reports: "reports",
                  Settings: "settings",
                };

              if (label === "Logout") {
                onLogout?.();
                } else {
                onNavigate?.(pageRoutes[label]);
               }
            }}
            >
              <span className="customer-side-icon">{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="customer-main">
        <header className="customer-topbar">
          <h1>Customer Management</h1>

          <div className="customer-global-search">
            <input
              aria-label="Search customers"
              placeholder="Search anything ..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
            <span>⌕</span>
          </div>

          <button
            type="button"
            className="customer-notification"
            aria-label="Notifications"
            onClick={() => showNotice("You have 4 notifications.")}
          >
            ♟<span>4</span>
          </button>

          <div className="customer-date-display">
            <span>{new Date().toLocaleDateString("en-CA")}</span>
            <span className="customer-calendar-icon">▦</span>
          </div>
        </header>

        {notice && <div className="customer-toast">{notice}</div>}

        <section className="customer-summary-grid">
          <article className="customer-summary-card">
            <div className="customer-summary-top">
              <div className="customer-summary-icon blue">♧</div>
              <span className="customer-green-text">Registered</span>
            </div>
            <p>Total Customers</p>
            <h2>{customers.length}</h2>
          </article>

          <article className="customer-summary-card">
            <div className="customer-summary-top">
              <div className="customer-summary-icon green">✚</div>
              <span className="customer-green-text">
                +{newThisMonth} new
              </span>
            </div>
            <p>New This Month</p>
            <h2>{newThisMonth}</h2>
          </article>

          <article className="customer-summary-card">
            <div className="customer-summary-top">
              <div className="customer-summary-icon purple">✓</div>
              <span className="customer-green-text">Active</span>
            </div>
            <p>Active Accounts</p>
            <h2>{activeCount}</h2>
          </article>

          
        </section>

<section className="customer-loyalty-panel">
  <div className="customer-loyalty-heading">
    <div>
      <h2>♛ Loyalty Customers</h2>
      <p>Your valued customers and their reward points</p>
    </div>
    <span className="customer-loyalty-badge">
      {customers.filter((customer) => loyaltyInfo[customer.id]).length} Members
    </span>
  </div>

  <div className="customer-loyalty-stats">
    <article>
      <span>Total Loyalty Members</span>
      <h3>
        {customers.filter((customer) => loyaltyInfo[customer.id]).length}
      </h3>
    </article>

    <article>
      <span>Total Reward Points</span>
      <h3>
        {customers.reduce(
          (sum, customer) =>
            sum + (loyaltyInfo[customer.id]?.points || 0),
          0
        ).toLocaleString()}
      </h3>
    </article>
  </div>

  <div className="customer-loyalty-list">
    {customers
      .filter((customer) => loyaltyInfo[customer.id])
      .map((customer) => (
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

        <section className="customer-directory-panel">
          <div className="customer-directory-heading">
            <div>
              <h2>Customer Directory</h2>
              <p>Manage your customers and their account details</p>
            </div>

            <div className="customer-directory-actions">
              <button
                className="customer-filter-button"
                type="button"
                onClick={() => setShowFilter((current) => !current)}
              >
                ☷ &nbsp; Filter
              </button>

              <button
                className="customer-add-button"
                type="button"
                onClick={openAddModal}
              >
                + &nbsp; Add Customer
              </button>
            </div>
          </div>

          {showFilter && (
            <div className="customer-filter-row">
              <label htmlFor="customer-status-filter">Customer status</label>
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
                        <span>☎ {customer.phone || "No phone"}</span>
                        <span>✉ {customer.email || "No email"}</span>
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
                          customer.status === "Active" ? "active" : "inactive"
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
                          title="Edit customer"
                          onClick={() => openEditModal(customer)}
                        >
                          ✎
                        </button>

                        <button
                          type="button"
                          className="customer-delete-button"
                          aria-label={`Delete ${customer.name}`}
                          title="Delete customer"
                          onClick={() => deleteCustomer(customer.id)}
                        >
                          🗑
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
                : (page - 1) * pageSize + 1}
              -
              {Math.min(page * pageSize, filteredCustomers.length)} of{" "}
              {filteredCustomers.length} customers
            </span>

            <div className="customer-pagination">
              <button
                type="button"
                disabled={page === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                &lt;
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
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
                  setPage((current) => Math.min(totalPages, current + 1))
                }
              >
                &gt;
              </button>
            </div>
          </footer>
        </section>
      </main>

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
                ×
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
