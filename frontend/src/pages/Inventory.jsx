
import React, { useMemo, useState } from "react";
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
  Download,
  ChevronLeft,
  ChevronRight,
  Pencil,
} from "lucide-react";

import logo from "../img/black logo.png";

const initialItems = [
  { id: "01", name: "Samba Rice (1kg)", category: "Grocery", sku: "SK000001", cost: 180, price: 220, stock: 75, status: "Active" },
  { id: "02", name: "Kothmale fresh milk", category: "Beverages", sku: "SK010002", cost: 380, price: 450, stock: 50, status: "Reorder" },
  { id: "03", name: "White Sugar", category: "Grocery", sku: "SK010003", cost: 230, price: 280, stock: 70, status: "Active" },
  { id: "04", name: "Cooking oil (1L)", category: "Grocery", sku: "SK010004", cost: 550, price: 650, stock: 57, status: "Active" },
  { id: "05", name: "Tea Bags (200g)", category: "Beverages", sku: "SK010005", cost: 450, price: 550, stock: 25, status: "Active" },
  { id: "06", name: "Prima Noodles", category: "Grocery", sku: "SK010010", cost: 85, price: 120, stock: 10, status: "Low Stock" },
  { id: "07", name: "Salt (400g)", category: "Grocery", sku: "SK010011", cost: 65, price: 100, stock: 10, status: "Low Stock" },
  { id: "08", name: "Surf Excel (500g)", category: "Cleaning", sku: "SK010012", cost: 280, price: 390, stock: 33, status: "Active" },
  { id: "09", name: "Chocolate Cream Biscuit", category: "Grocery", sku: "SK010006", cost: 90, price: 150, stock: 30, status: "Active" },
  { id: "10", name: "Mineral Water", category: "Beverages", sku: "SK010007", cost: 80, price: 120, stock: 0, status: "Out of Stock" },
  { id: "11", name: "Shampoo (180ml)", category: "Personal Care", sku: "SK010008", cost: 350, price: 450, stock: 42, status: "Active" },
  { id: "12", name: "Dishwash Liquid", category: "Cleaning", sku: "SK010009", cost: 180, price: 250, stock: 8, status: "Low Stock" },
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

const money = (value) =>
  Number(value).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function getStatus(item) {
  if (item.stock === 0) return "Out of Stock";
  if (item.status === "Reorder") return "Reorder";
  if (item.stock <= 10) return "Low Stock";
  return "Active";
}

function StockBar({ stock }) {
  const width = Math.min(100, Math.max(0, stock));

  let color = "#10b735";
  if (stock === 0) color = "#ef4035";
  else if (stock <= 15) color = "#ff991c";
  else if (stock <= 35) color = "#f1b52d";

  return (
    <div className="inv-stock-track" title={`${stock} items in stock`}>
      <div
        className="inv-stock-fill"
        style={{ width: `${width}%`, background: color }}
      />
    </div>
  );
}

function PieChart() {
  return (
    <svg
      className="inv-pie-svg"
      viewBox="0 0 190 115"
      role="img"
      aria-label="Top selling items and stock categories pie chart"
    >
      <path d="M56 58 L56 7 A51 51 0 0 1 104 75 Z" fill="#397cc1" stroke="#fff" />
      <path d="M56 58 L104 75 A51 51 0 0 1 25 94 Z" fill="#f4772d" stroke="#fff" />
      <path d="M56 58 L25 94 A51 51 0 0 1 11 36 Z" fill="#999" stroke="#fff" />
      <path d="M56 58 L11 36 A51 51 0 0 1 29 15 Z" fill="#ffb52b" stroke="#fff" />
      <path d="M56 58 L29 15 A51 51 0 0 1 56 7 Z" fill="#d7d7d7" stroke="#fff" />

      {[
        ["#397cc1", "Top Selling"],
        ["#f4772d", "Snacks"],
        ["#ffb52b", "Grocery"],
        ["#999", "Low Stock"],
      ].map(([color, label], i) => (
        <g key={label}>
          <rect x="120" y={20 + i * 17} width="9" height="9" fill={color} />
          <text x="134" y={28 + i * 17} fontSize="9" fill="#111">
            {label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function TrendChart() {
  return (
    <svg
      className="inv-trend-svg"
      viewBox="0 0 250 150"
      role="img"
      aria-label="Stock value trend from January to November"
    >
      {[20, 42, 64, 86, 108].map((y) => (
        <line
          key={y}
          x1="37"
          y1={y}
          x2="237"
          y2={y}
          stroke="#d7dce2"
          strokeDasharray="3 3"
        />
      ))}

      {[37, 77, 117, 157, 197, 237].map((x) => (
        <line
          key={x}
          x1={x}
          y1="15"
          x2={x}
          y2="110"
          stroke="#e5e8ec"
          strokeDasharray="2 3"
        />
      ))}

      {[1200, 900, 600, 300, 0].map((v, i) => (
        <text
          key={v}
          x="29"
          y={23 + i * 22}
          fontSize="9"
          textAnchor="end"
          fill="#444"
        >
          {v}
        </text>
      ))}

      <path
        d="M37 108 C52 96 60 88 77 82 S105 105 117 92 S142 51 157 55 S181 79 197 65 S223 39 237 25 L237 110 L37 110 Z"
        fill="#6ca9ef"
        fillOpacity=".28"
      />

      <path
        d="M37 108 C52 96 60 88 77 82 S105 105 117 92 S142 51 157 55 S181 79 197 65 S223 39 237 25"
        fill="none"
        stroke="#2477d4"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {["Jan", "Mar", "May", "Jul", "Sep", "Nov"].map((month, i) => (
        <text
          key={month}
          x={37 + i * 40}
          y="127"
          fontSize="10"
          textAnchor="middle"
          fill="#444"
        >
          {month}
        </text>
      ))}
    </svg>
  );
}

export default function Inventory({ onNavigate, onLogout }) {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState({ key: "id", direction: "asc" });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [modal, setModal] = useState("");
  const [notice, setNotice] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [reorderQuantity, setReorderQuantity] = useState("50");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [form, setForm] = useState({
    name: "",
    category: "Grocery",
    sku: "",
    cost: "",
    price: "",
    stock: "",
  });

  const pageSize = 10;

  const filteredItems = useMemo(() => {
    const query = `${search} ${globalSearch}`.trim().toLowerCase();

    let result = items.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query);

      const status = getStatus(item);

      const matchesFilter =
        filter === "All" ||
        (filter === "Low Stock" &&
          ["Low Stock", "Reorder"].includes(status)) ||
        (filter === "Active" && status === "Active") ||
        (filter === "Out of Stock" && status === "Out of Stock");

      return matchesSearch && matchesFilter;
    });

    result = [...result].sort((a, b) => {
      const first = a[sort.key];
      const second = b[sort.key];

      const comparison =
        typeof first === "number"
          ? first - second
          : String(first).localeCompare(String(second), undefined, {
              numeric: true,
            });

      return sort.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [items, search, globalSearch, filter, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPageNumber = Math.min(page, totalPages);

  const visibleItems = filteredItems.slice(
    (currentPageNumber - 1) * pageSize,
    currentPageNumber * pageSize
  );

  const lowStockCount = items.filter((item) =>
    ["Low Stock", "Reorder"].includes(getStatus(item))
  ).length;

  const attentionCount = items.filter(
    (item) => getStatus(item) !== "Active"
  ).length;

  const totalInventoryValue = items.reduce(
    (total, item) => total + item.cost * item.stock,
    0
  );

  function chooseNav(pageKey) {
    setMobileMenu(false);

    if (pageKey === "inventory") return;

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

  const openAdd = () => {
    setEditingItem(null);
    setForm({
      name: "",
      category: "Grocery",
      sku: "",
      cost: "",
      price: "",
      stock: "",
    });
    setModal("product");
  };

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category,
      sku: item.sku,
      cost: String(item.cost),
      price: String(item.price),
      stock: String(item.stock),
    });
    setModal("product");
  };

  const saveProduct = (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.sku.trim()) {
      setNotice("Enter a product name and SKU.");
      return;
    }

    if (
      items.some(
        (item) =>
          item.sku.toLowerCase() === form.sku.trim().toLowerCase() &&
          item.id !== editingItem?.id
      )
    ) {
      setNotice("This SKU already exists.");
      return;
    }

    const stock = Math.max(0, Number(form.stock) || 0);

    const product = {
      ...form,
      name: form.name.trim(),
      sku: form.sku.trim(),
      cost: Math.max(0, Number(form.cost) || 0),
      price: Math.max(0, Number(form.price) || 0),
      stock,
      status: stock === 0 ? "Out of Stock" : "Active",
    };

    if (editingItem) {
      setItems((previous) =>
        previous.map((item) =>
          item.id === editingItem.id ? { ...item, ...product } : item
        )
      );
      setNotice("Product updated successfully.");
    } else {
      const newId = String(
        Math.max(0, ...items.map((item) => Number(item.id))) + 1
      ).padStart(2, "0");

      setItems((previous) => [...previous, { ...product, id: newId }]);
      setNotice("Product added successfully.");
    }

    setModal("");
  };

  const toggleSort = (key) => {
    setSort((previous) => ({
      key,
      direction:
        previous.key === key && previous.direction === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  };

  const toggleSelected = (id) => {
    setSelected((previous) =>
      previous.includes(id)
        ? previous.filter((itemId) => itemId !== id)
        : [...previous, id]
    );
  };

  const exportCSV = () => {
    const headers = [
      "ID",
      "Product Name",
      "Category",
      "SKU",
      "Unit Cost",
      "Unit Price",
      "Current Stock",
      "Status",
    ];

    const rows = filteredItems.map((item) => [
      item.id,
      item.name,
      item.category,
      item.sku,
      item.cost,
      item.price,
      item.stock,
      getStatus(item),
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "smart-pos-inventory.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setNotice("Inventory exported successfully.");
  };

  const handleBatchEdit = () => {
    if (!selected.length) {
      setNotice("Select products from the table first.");
      return;
    }

    setForm({
      name: "",
      category: "",
      sku: "",
      cost: "",
      price: "",
      stock: "",
    });

    setModal("batch");
  };

  const applyBatchEdit = (event) => {
    event.preventDefault();

    const stockValue = form.stock.trim();
    const categoryValue = form.category.trim();

    setItems((previous) =>
      previous.map((item) => {
        if (!selected.includes(item.id)) return item;

        const updated = { ...item };

        if (stockValue !== "") {
          updated.stock = Math.max(0, Number(stockValue) || 0);
          updated.status =
            updated.stock === 0 ? "Out of Stock" : "Active";
        }

        if (categoryValue !== "") {
          updated.category = categoryValue;
        }

        return updated;
      })
    );

    setSelected([]);
    setModal("");
    setNotice("Selected products updated.");
  };

  const startReorder = () => {
    const lowItems = items.filter((item) =>
      ["Low Stock", "Reorder", "Out of Stock"].includes(getStatus(item))
    );

    if (lowItems.length === 0) {
      setNotice("No items currently require reordering.");
      return;
    }

    setModal("reorder");
  };

  const confirmReorder = () => {
    const quantity = Math.max(1, Number(reorderQuantity) || 50);

    setItems((previous) =>
      previous.map((item) => {
        if (
          !["Low Stock", "Reorder", "Out of Stock"].includes(getStatus(item))
        ) {
          return item;
        }

        return {
          ...item,
          stock: item.stock + quantity,
          status: "Active",
        };
      })
    );

    setModal("");
    setNotice(
      `Demo reorder completed. ${quantity} units added to each low-stock item.`
    );
  };

  return (
    <div className="sp-dashboard sh-page inv-page">
      {/* Sidebar - same navigation layout as Sales History */}
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
          {navItems.map(({ label, icon: Icon, page: pageKey, count }) => (
            <button
              type="button"
              key={pageKey}
              className={`sp-nav-item ${
                pageKey === "inventory" ? "selected" : ""
              }`}
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
            <p>
              Check your stock levels and inventory insights to manage your
              store efficiently.
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
          className="sp-backdrop"
          onClick={() => setMobileMenu(false)}
          aria-label="Close navigation"
        />
      )}

      {/* Main content */}
      <main className="sp-main sh-main inv-main">
        <header className="sp-topbar sh-topbar inv-topbar">
          <button
            className="sp-mobile-menu"
            onClick={() => setMobileMenu(true)}
            aria-label="Open menu"
          >
            <Menu size={21} />
          </button>

          <div className="sp-page-heading sh-heading">
            <h1>Inventory</h1>
            <p>Add, Edit and manage your store products</p>
          </div>

          <div className="sp-top-actions">
            <label className="sp-search sh-search">
              <Search size={17} />
              <input
                value={globalSearch}
                onChange={(event) => {
                  setGlobalSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search inventory..."
              />
              {globalSearch && (
                <button
                  type="button"
                  className="inv-clear-search"
                  onClick={() => {
                    setGlobalSearch("");
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
                <i>{attentionCount}</i>
              </button>

              {showNotifications && (
                <div className="sp-notification-pop">
                  <strong>Inventory Notifications</strong>
                  <p>{lowStockCount} products have low stock.</p>
                  <p>
                    {items.filter((item) => item.stock === 0).length} products
                    are out of stock.
                  </p>
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

        <section className="inv-content">
          <div className="inv-page-heading">
            <div>
              <h2>Inventory Overview</h2>
              <p>Monitor your products and manage available stock.</p>
            </div>

            <button className="inv-primary" onClick={openAdd}>
              + Add New Product
            </button>
          </div>

          {/* Summary cards */}
          <section className="inv-stat-cards">
            <div className="inv-stat-card">
              <div className="inv-stat-circle inv-blue-circle" />
              <div>
                <strong>Total Products</strong>
                <h2>{items.length}</h2>
              </div>
            </div>

            <div className="inv-stat-card">
              <div className="inv-stat-circle inv-orange-circle" />
              <div>
                <strong>Low Stock Items</strong>
                <h2>{lowStockCount}</h2>
              </div>
            </div>

            <div className="inv-stat-card">
              <div className="inv-stat-circle inv-red-circle" />
              <div>
                <strong>Out of Stock</strong>
                <h2>{items.filter((item) => item.stock === 0).length}</h2>
              </div>
            </div>
          </section>

          {/* Filters */}
          <div className="inv-filter-tabs">
            {["All", "Active", "Low Stock", "Out of Stock"].map((name) => (
              <button
                type="button"
                key={name}
                className={filter === name ? "selected" : ""}
                onClick={() => {
                  setFilter(name);
                  setPage(1);
                }}
              >
                {name === "All" ? "All Products" : name}
              </button>
            ))}
          </div>

          <section className="inv-content-grid">
            <div className="inv-table-section">
              <div className="inv-table-heading">
                <div>
                  <h2>Product Inventory</h2>
                  <p>View, search and manage your available products.</p>
                </div>

                <div className="inv-table-tools">
                  <label className="inv-table-search">
                    <Search size={16} />
                    <input
                      value={search}
                      onChange={(event) => {
                        setSearch(event.target.value);
                        setPage(1);
                      }}
                      placeholder="Search products..."
                      aria-label="Search products"
                    />
                  </label>

                  <button className="inv-secondary" onClick={exportCSV}>
                    <Download size={15} />
                    Export CSV
                  </button>
                </div>
              </div>

              {selected.length > 0 && (
                <div className="inv-selection-bar">
                  <span>{selected.length} products selected</span>
                  <button className="inv-secondary" onClick={handleBatchEdit}>
                    Batch Edit
                  </button>
                  <button
                    className="inv-secondary"
                    onClick={() => setSelected([])}
                  >
                    Clear Selection
                  </button>
                </div>
              )}

              <div className="inv-table-card">
                <div className="inv-table-scroll">
                  <table className="inv-table">
                    <thead>
                      <tr>
                        <th className="inv-select-col">
                          <input
                            type="checkbox"
                            aria-label="Select all products on this page"
                            checked={
                              visibleItems.length > 0 &&
                              visibleItems.every((item) =>
                                selected.includes(item.id)
                              )
                            }
                            onChange={() => {
                              const allSelected = visibleItems.every((item) =>
                                selected.includes(item.id)
                              );

                              setSelected((previous) =>
                                allSelected
                                  ? previous.filter(
                                      (id) =>
                                        !visibleItems.some(
                                          (item) => item.id === id
                                        )
                                    )
                                  : [
                                      ...new Set([
                                        ...previous,
                                        ...visibleItems.map(
                                          (item) => item.id
                                        ),
                                      ]),
                                    ]
                              );
                            }}
                          />
                        </th>

                        {[
                          ["id", "ID"],
                          ["name", "Product Name"],
                          ["category", "Category"],
                          ["sku", "SKU"],
                          ["cost", "Unit Cost"],
                          ["price", "Unit Price"],
                          ["stock", "Current Stock"],
                          ["status", "Status"],
                        ].map(([key, label]) => (
                          <th key={key}>
                            <button
                              className="inv-sort-btn"
                              onClick={() => toggleSort(key)}
                            >
                              {label}
                              <span className="inv-sort-icon">
                                {sort.key === key
                                  ? sort.direction === "asc"
                                    ? "▲"
                                    : "▼"
                                  : "↕"}
                              </span>
                            </button>
                          </th>
                        ))}

                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {visibleItems.map((item) => {
                        const status = getStatus(item);

                        return (
                          <tr key={item.id}>
                            <td>
                              <input
                                type="checkbox"
                                aria-label={`Select ${item.name}`}
                                checked={selected.includes(item.id)}
                                onChange={() => toggleSelected(item.id)}
                              />
                            </td>

                            <td>{item.id}</td>
                            <td className="inv-product-name">{item.name}</td>
                            <td>{item.category}</td>
                            <td>{item.sku}</td>
                            <td>{money(item.cost)}</td>
                            <td>{money(item.price)}</td>

                            <td>
                              <div className="inv-stock-cell">
                                <span>{item.stock}</span>
                                <StockBar stock={item.stock} />
                              </div>
                            </td>

                            <td>
                              <span
                                className={`inv-status ${
                                  status === "Active"
                                    ? "inv-status-active"
                                    : status === "Out of Stock"
                                    ? "inv-status-out"
                                    : "inv-status-low"
                                }`}
                              >
                                {status}
                              </span>
                            </td>

                            <td>
                              <button
                                className="inv-edit-btn"
                                onClick={() => openEdit(item)}
                                title="Edit product"
                                aria-label={`Edit ${item.name}`}
                              >
                                <Pencil size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}

                      {visibleItems.length === 0 && (
                        <tr>
                          <td colSpan="10" className="inv-empty">
                            No inventory items found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="inv-pagination">
                  <span className="inv-results">
                    Showing{" "}
                    {filteredItems.length === 0
                      ? 0
                      : (currentPageNumber - 1) * pageSize + 1}
                    {"–"}
                    {Math.min(
                      currentPageNumber * pageSize,
                      filteredItems.length
                    )}{" "}
                    of {filteredItems.length} products
                  </span>

                  <div className="inv-pagination-buttons">
                    <button
                      disabled={currentPageNumber === 1}
                      onClick={() =>
                        setPage((previous) => Math.max(1, previous - 1))
                      }
                      aria-label="Previous page"
                    >
                      <ChevronLeft size={17} />
                    </button>

                    <button
                      disabled={currentPageNumber === totalPages}
                      onClick={() =>
                        setPage((previous) =>
                          Math.min(totalPages, previous + 1)
                        )
                      }
                      aria-label="Next page"
                    >
                      <ChevronRight size={17} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics */}
            <aside className="inv-analytics">
              <h3>Quick Actions &amp; Analytics</h3>

              <div className="inv-analytics-card">
                <h4>Top Selling Items</h4>
                <PieChart />
              </div>

              <div className="inv-analytics-card">
                <h4>Stock Value Trend</h4>
                <TrendChart />
                <div className="inv-chart-total">
                  Inventory cost value: Rs. {money(totalInventoryValue)}
                </div>
              </div>

              <div className="inv-quick-actions">
                <button className="inv-primary" onClick={startReorder}>
                  Initiate Reorder
                </button>
                <button className="inv-primary" onClick={handleBatchEdit}>
                  Batch Edit Products
                </button>
              </div>

              <div className="inv-alert-card">
                <h4>Inventory Alerts &amp; To-Do List</h4>
                <p>
                  <span>•</span> Reorder required for: {attentionCount} items
                </p>
                <p>
                  <span>•</span> New items to add: 5
                </p>
                <p>
                  <span>•</span> Suppliers with late deliveries: 1
                </p>

                <button
                  className="inv-alert-link"
                  onClick={() => {
                    setFilter("Low Stock");
                    setPage(1);
                    setNotice("Showing items that need stock attention.");
                  }}
                >
                  View low-stock items →
                </button>
              </div>
            </aside>
          </section>
        </section>
      </main>

      {/* Add / Edit / Batch / Reorder modal */}
      {modal && (
        <div
          className="inv-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModal("");
          }}
        >
          <div className="inv-modal">
            <div className="inv-modal-heading">
              <h2>
                {modal === "product"
                  ? editingItem
                    ? "Edit Inventory Item"
                    : "Add New Product"
                  : modal === "batch"
                  ? "Batch Edit Products"
                  : "Initiate Reorder"}
              </h2>

              <button
                type="button"
                onClick={() => setModal("")}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {modal === "product" && (
              <form onSubmit={saveProduct}>
                <div className="inv-form-grid">
                  <label>
                    Product Name *
                    <input
                      required
                      value={form.name}
                      onChange={(event) =>
                        setForm({ ...form, name: event.target.value })
                      }
                    />
                  </label>

                  <label>
                    SKU *
                    <input
                      required
                      value={form.sku}
                      onChange={(event) =>
                        setForm({ ...form, sku: event.target.value })
                      }
                    />
                  </label>

                  <label>
                    Category
                    <select
                      value={form.category}
                      onChange={(event) =>
                        setForm({ ...form, category: event.target.value })
                      }
                    >
                      <option>Grocery</option>
                      <option>Beverages</option>
                      <option>Cleaning</option>
                      <option>Personal Care</option>
                      <option>Snacks</option>
                      <option>Dairy Products</option>
                    </select>
                  </label>

                  <label>
                    Unit Cost (Rs.)
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.cost}
                      onChange={(event) =>
                        setForm({ ...form, cost: event.target.value })
                      }
                    />
                  </label>

                  <label>
                    Unit Price (Rs.)
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(event) =>
                        setForm({ ...form, price: event.target.value })
                      }
                    />
                  </label>

                  <label>
                    Current Stock
                    <input
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={(event) =>
                        setForm({ ...form, stock: event.target.value })
                      }
                    />
                  </label>
                </div>

                <div className="inv-modal-actions">
                  <button
                    type="button"
                    className="inv-secondary"
                    onClick={() => setModal("")}
                  >
                    Cancel
                  </button>

                  <button className="inv-primary" type="submit">
                    {editingItem ? "Save Changes" : "Add Product"}
                  </button>
                </div>
              </form>
            )}

            {modal === "batch" && (
              <form onSubmit={applyBatchEdit}>
                <p>
                  Update {selected.length} selected products. Leave stock or
                  category unchanged by leaving its field empty.
                </p>

                <div className="inv-form-grid">
                  <label>
                    New Category
                    <input
                      placeholder="Leave blank to keep current"
                      value={form.category}
                      onChange={(event) =>
                        setForm({ ...form, category: event.target.value })
                      }
                    />
                  </label>

                  <label>
                    Set Stock Quantity
                    <input
                      type="number"
                      min="0"
                      placeholder="Leave blank to keep current"
                      value={form.stock}
                      onChange={(event) =>
                        setForm({ ...form, stock: event.target.value })
                      }
                    />
                  </label>
                </div>

                <div className="inv-modal-actions">
                  <button
                    type="button"
                    className="inv-secondary"
                    onClick={() => setModal("")}
                  >
                    Cancel
                  </button>

                  <button className="inv-primary" type="submit">
                    Apply Changes
                  </button>
                </div>
              </form>
            )}

            {modal === "reorder" && (
              <div>
                <p>
                  This demo will add the selected quantity to each item
                  currently marked for reorder or low stock. In a real POS
                  system, this action should create a purchase order.
                </p>

                <label className="inv-reorder-label">
                  Quantity to add per item
                  <input
                    type="number"
                    min="1"
                    value={reorderQuantity}
                    onChange={(event) =>
                      setReorderQuantity(event.target.value)
                    }
                  />
                </label>

                <div className="inv-modal-actions">
                  <button
                    type="button"
                    className="inv-secondary"
                    onClick={() => setModal("")}
                  >
                    Cancel
                  </button>

                  <button className="inv-primary" onClick={confirmReorder}>
                    Confirm Demo Reorder
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
