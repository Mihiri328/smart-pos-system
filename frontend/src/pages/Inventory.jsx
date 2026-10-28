
import React, { useMemo, useState } from "react";
import logo from "../img/Dark logo.jpeg";

const initialItems = [
  { id: "01", name: "Samba Rice (1kg)", category: "Grocery", sku: "SK000001", cost: 180, price: 220, stock: 75, status: "Active" },
  { id: "02", name: "Kothmale fresh milk", category: "Beverages", sku: "SK010002", cost: 380, price: 450, stock: 50, status: "Reorder" },
  { id: "03", name: "White Sugar", category: "Grocery", sku: "SK010003", cost: 230, price: 280, stock: 70, status: "Active" },
  { id: "04", name: "Cooking oil (1L)", category: "Grocery", sku: "SK010004", cost: 550, price: 650, stock: 57, status: "Active" },
  { id: "05", name: "Tea Bags (200g)", category: "Beverages", sku: "SK010005", cost: 450, price: 550, stock: 25, status: "Active" },
  { id: "06", name: "Prima Noodles", category: "Grocery", sku: "SK010004", cost: 85, price: 120, stock: 10, status: "Low Stock" },
  { id: "07", name: "Salt (400g)", category: "Grocery", sku: "SK000001", cost: 65, price: 100, stock: 10, status: "Low Stock" },
  { id: "08", name: "Surf Excel (500g)", category: "Cleaning", sku: "SK010005", cost: 280, price: 390, stock: 33, status: "Active" },
  { id: "09", name: "Chocolate Cream Biscuit", category: "Grocery", sku: "SK010006", cost: 90, price: 150, stock: 30, status: "Active" },
  { id: "10", name: "Mineral Water", category: "Beverages", sku: "SK010007", cost: 80, price: 120, stock: 0, status: "Out of Stock" },
  { id: "11", name: "Shampoo (180ml)", category: "Personal Care", sku: "SK010008", cost: 350, price: 450, stock: 42, status: "Active" },
  { id: "12", name: "Dishwash Liquid", category: "Cleaning", sku: "SK010009", cost: 180, price: 250, stock: 8, status: "Low Stock" },
];

const navItems = [
  ["▦", "Dashboard"],
  ["🛒", "POS Billing"],
  ["▣", "Products Management"],
  ["⌂", "Inventory"],
  ["♟", "Suppliers Management"],
  ["▤", "Purchase Orders"],
  ["♟", "Customer Management"],
  ["▥", "Sales History"],
  ["◕", "Reports"],
  ["⚙", "Settings"],
  ["⇥", "Logout"],
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

      {["Jan", "Mar", "May", "Jul", "Sep", "Nov"].map((m, i) => (
        <text
          key={m}
          x={37 + i * 40}
          y="127"
          fontSize="10"
          textAnchor="middle"
          fill="#444"
        >
          {m}
        </text>
      ))}
    </svg>
  );
}

export default function Inventory({ onNavigate, currentPage }) {
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

  const lowStockCount = items.filter((item) => {
    const status = getStatus(item);
    return ["Low Stock", "Reorder"].includes(status);
  }).length;

  const totalInventoryValue = items.reduce(
    (total, item) => total + item.cost * item.stock,
    0
  );

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
    link.download = "inventory.csv";
    link.click();
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
      category: "Grocery",
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

    setItems((previous) =>
      previous.map((item) => {
        if (!selected.includes(item.id)) return item;

        const updated = { ...item };

        if (stockValue !== "") {
          updated.stock = Math.max(0, Number(stockValue) || 0);
          updated.status = updated.stock === 0 ? "Out of Stock" : "Active";
        }

        if (form.category.trim()) {
          updated.category = form.category.trim();
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

        const updatedStock = item.stock + quantity;

        return {
          ...item,
          stock: updatedStock,
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
    <div className="inv-app">
      <style>{inventoryStyles}</style>

      <aside className="inv-sidebar">
        <div className="inv-brand">
          <img src={logo} alt="Smart POS Logo" className="inv-brand-logo" />
          
        </div>

        <nav className="inv-nav">
  {navItems.map(([icon, label]) => {
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
        className={`inv-nav-item ${
          label === activeLabel ? "active" : ""
        }`}
        onClick={() => {
          if (pageMap[label] && onNavigate) {
            onNavigate(pageMap[label]);
          } else {
            setNotice(`${label} page is not connected yet.`);
          }
        }}
      >
        <span className="inv-nav-icon">{icon}</span>
        <span>{label}</span>
      </button>
    );
  })}
</nav>
      </aside>

      <main className="inv-main">
        <header className="inv-topbar">
          <label className="inv-global-search">
            <input
              value={globalSearch}
              onChange={(event) => {
                setGlobalSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search anything ..."
            />
            <span className="inv-search-icon">⌕</span>
          </label>

          <button
            className="inv-bell"
            title="Notifications"
            onClick={() => setNotice(`${lowStockCount} items need stock attention.`)}
          >
            ♟<span>4</span>
          </button>

          <div className="inv-owner">
            <div className="inv-owner-avatar">O</div>
            <div>
              <strong>Owner</strong>
              <small>Store Owner</small>
            </div>
          </div>
        </header>

        <div className="inv-page-heading">
          <div>
            <h1>Products</h1>
            <p>Manage stock procurement and track vendor deliveries.</p>
          </div>

          <button className="inv-primary" onClick={openAdd}>
            + Add New Products
          </button>
        </div>

        <section className="inv-stat-cards">
          <div className="inv-stat-card">
            <div className="inv-stat-circle inv-blue-circle" />
            <div>
              <strong>Total Items</strong>
              <h2>236</h2>
            </div>
          </div>

          <div className="inv-stat-card">
            <div className="inv-stat-circle inv-orange-circle" />
            <div>
              <strong>Low Stock Items</strong>
              <h2>14</h2>
            </div>
          </div>
        </section>

        <div className="inv-filter-tabs">
          {["All", "Active", "Low Stock", "Out of Stock"].map((name) => (
            <button
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
              <h2>Product Inventory Table</h2>
              <div className="inv-table-tools">
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search inventory..."
                  aria-label="Search inventory"
                />
                <button className="inv-secondary" onClick={exportCSV}>
                  Export
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
                  Clear
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
                                      ...visibleItems.map((item) => item.id),
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
                            >
                              ✎
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
                <button
                  disabled={currentPage === 1}
                  onClick={() => setPage((previous) => previous - 1)}
                >
                  Prev
                </button>

                <span>
                  Pages {filteredItems.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                  {" - "}
                  {Math.min(currentPage * pageSize, filteredItems.length)}
                  {" of "}
                  {filteredItems.length}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((previous) => previous + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>

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
                <span>•</span> Reorder required for:{" "}
                {items.filter((item) => getStatus(item) !== "Active").length} items
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
      </main>

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
              <button onClick={() => setModal("")}>×</button>
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
                  Update {selected.length} selected products. Leave stock
                  unchanged by leaving its field empty.
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

      {notice && (
        <div className="inv-toast" role="status">
          <span>{notice}</span>
          <button onClick={() => setNotice("")}>×</button>
        </div>
      )}
    </div>
  );
}

const inventoryStyles = `
.inv-app, .inv-app * {
  box-sizing: border-box;
}

.inv-app {
  --inv-navy: #061d40;
  --inv-blue: #2156b5;
  --inv-active: #4965f6;
  font-family: Arial, Helvetica, sans-serif;
  color: #111;
  background: #fff;
  width: 100%;
  min-height: 100vh;
  display: flex;
  font-size: 14px;
}

.inv-sidebar {
  width: 322px;
  min-width: 260px;
  min-height: 100vh;
  background: var(--inv-navy);
  color: #fff;
  padding: 43px 24px 25px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.inv-brand {
  width: 76px;
  height: 80px;
  display: grid;
  place-items: center;
  color: #ff9c27;
  font-size: 49px;
  margin-top: -10px;
}

.inv-brand-logo {
  width: 180px;
  height: 170px;
  object-fit: contain;
  display: block;
  transform: translate(20px, -50px);
}


.inv-brand h2 {
  font-size: 28px;
  margin: 0 0 4px;
  white-space: nowrap;
}

.inv-brand p {
  margin: 0;
  color: #6285ff;
  font-size: 12px;
  white-space: nowrap;
}

.inv-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.inv-nav-item {
  width: 100%;
  min-height: 49px;
  display: flex;
  align-items: center;
  gap: 25px;
  padding: 0 21px;
  border: none;
  border-radius: 11px;
  background: transparent;
  color: white;
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
}

.inv-nav-item:hover {
  background: #142f5c;
}

.inv-nav-item.active {
  background: var(--inv-active);
}

.inv-nav-icon {
  width: 37px;
  text-align: center;
  flex-shrink: 0;
  font-size: 25px;
}

.inv-main {
  flex: 1;
  min-width: 0;
  padding: 27px 21px 28px;
}

.inv-topbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 29px;
  margin-bottom: 20px;
}

.inv-global-search {
  height: 41px;
  max-width: 720px;
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 22px 0 70px;
  border: 1px solid #ccc;
  border-radius: 17px;
}

.inv-global-search input {
  min-width: 0;
  width: 100%;
  outline: none;
  border: none;
  background: transparent;
  font: inherit;
}

.inv-global-search input::placeholder {
  color: #999;
}

.inv-search-icon {
  font-size: 33px;
  line-height: 1;
  transform: rotate(-20deg);
}

.inv-bell {
  width: 43px;
  height: 43px;
  border: 1px solid #ddd;
  border-radius: 50%;
  background: white;
  font-size: 24px;
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
}

.inv-bell span {
  position: absolute;
  top: -6px;
  right: -8px;
  width: 25px;
  height: 25px;
  display: grid;
  place-items: center;
  background: #f04432;
  color: white;
  font-size: 13px;
  border-radius: 50%;
}

.inv-owner {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 150px;
}

.inv-owner-avatar {
  width: 43px;
  height: 43px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d2e2f6, #6884a3);
  color: #163354;
  border: 1px solid #b7c7d7;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 18px;
}

.inv-owner strong, .inv-owner small {
  display: block;
}

.inv-owner strong {
  font-size: 14px;
}

.inv-owner small {
  font-size: 11px;
  color: #666;
  margin-top: 3px;
}

.inv-page-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin: 0 0 24px;
  padding: 0 0 0 45px;
}

.inv-page-heading h1 {
  margin: 0 0 6px;
  font-size: 32px;
  letter-spacing: -.5px;
}

.inv-page-heading p {
  margin: 0;
  font-size: 15px;
}

.inv-primary {
  border: 1px solid var(--inv-blue);
  background: var(--inv-blue);
  color: white;
  padding: 9px 14px;
  border-radius: 10px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}

.inv-primary:hover {
  background: #174596;
}

.inv-stat-cards {
  display: flex;
  gap: 27px;
  margin: 0 0 23px 45px;
}

.inv-stat-card {
  width: 214px;
  min-height: 82px;
  border: 1px solid #ccc;
  border-radius: 21px;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 12px;
}

.inv-stat-circle {
  width: 55px;
  height: 55px;
  min-width: 55px;
  border-radius: 50%;
  border: 4px solid #d4e7ff;
}

.inv-blue-circle {
  background: #55a0f4;
}

.inv-orange-circle {
  background: #ff981f;
  border-color: #ffe0b7;
}

.inv-stat-card strong {
  font-size: 14px;
  white-space: nowrap;
}

.inv-stat-card h2 {
  font-size: 25px;
  margin: 7px 0 0;
}

.inv-filter-tabs {
  display: flex;
  gap: 8px;
  margin: 0 0 30px 59px;
  flex-wrap: wrap;
}

.inv-filter-tabs button {
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 9px 17px;
  font: inherit;
  font-weight: 600;
  background: transparent;
  cursor: pointer;
}

.inv-filter-tabs button.selected {
  background: var(--inv-navy);
  color: #fff;
}

.inv-filter-tabs button:not(.selected):hover {
  background: #edf1f7;
}

.inv-content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 205px;
  gap: 22px;
  align-items: start;
}

.inv-table-section {
  min-width: 0;
}

.inv-table-heading {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 12px;
  margin: 0 0 8px;
}

.inv-table-heading h2 {
  font-size: 32px;
  font-weight: 600;
  letter-spacing: -.4px;
  margin: 0;
  white-space: nowrap;
}

.inv-table-tools {
  display: flex;
  gap: 7px;
}

.inv-table-tools input {
  width: 170px;
  min-width: 0;
  border: 1px solid #ccc;
  border-radius: 9px;
  padding: 9px;
  font: inherit;
}

.inv-secondary {
  background: #fff;
  border: 1px solid #bbb;
  border-radius: 9px;
  padding: 9px 13px;
  font: inherit;
  cursor: pointer;
  white-space: nowrap;
}

.inv-secondary:hover {
  background: #f2f4f8;
}

.inv-selection-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: 0 0 8px;
  padding: 9px 12px;
  background: #eef3ff;
  border-radius: 8px;
}

.inv-selection-bar span {
  margin-right: auto;
  font-weight: 600;
}

.inv-table-card {
  border: 1px solid #aaa;
  border-radius: 20px;
  overflow: hidden;
  background: #fff;
}

.inv-table-scroll {
  overflow-x: auto;
  width: 100%;
}

.inv-table {
  border-collapse: collapse;
  width: 100%;
  min-width: 830px;
  table-layout: auto;
}

.inv-table th {
  height: 67px;
  padding: 10px 7px;
  border-bottom: 1px solid #aaa;
  text-align: center;
  font-size: 14px;
  white-space: nowrap;
}

.inv-table td {
  height: 50px;
  padding: 8px 7px;
  border-bottom: 1px solid #c0b8b8;
  text-align: center;
  font-size: 14px;
  vertical-align: middle;
}

.inv-table tbody tr:hover {
  background: #f7f9fd;
}

.inv-table th:first-child,
.inv-table td:first-child {
  padding-left: 13px;
  width: 34px;
}

.inv-table input[type="checkbox"] {
  width: 15px;
  height: 15px;
  accent-color: var(--inv-blue);
  cursor: pointer;
}

.inv-sort-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 0;
  background: transparent;
  padding: 0;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}

.inv-sort-icon {
  color: #777;
  font-size: 12px;
}

.inv-product-name {
  min-width: 118px;
  max-width: 165px;
  text-align: left !important;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.inv-stock-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-width: 105px;
}

.inv-stock-track {
  height: 10px;
  width: 85px;
  background: #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.inv-stock-fill {
  height: 100%;
  border-radius: inherit;
  transition: width .2s;
}

.inv-status {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 10px;
  white-space: nowrap;
  font-size: 13px;
}

.inv-status-active {
  background: #b9eac6;
  color: #111;
}

.inv-status-low {
  background: #ffd7a6;
  color: #111;
}

.inv-status-out {
  background: #ffbaba;
  color: #a40000;
}

.inv-edit-btn {
  width: 30px;
  height: 30px;
  border: 1px solid #ccc;
  border-radius: 8px;
  color: #2457ff;
  background: white;
  font-size: 24px;
  cursor: pointer;
}

.inv-empty {
  padding: 30px !important;
  color: #777;
  text-align: center !important;
}

.inv-pagination {
  min-height: 53px;
  padding: 8px 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.inv-pagination span {
  font-size: 17px;
  white-space: nowrap;
}

.inv-pagination button {
  min-width: 85px;
  height: 34px;
  border: 1px solid #aaa;
  border-radius: 10px;
  background: white;
  color: #333;
  font: inherit;
  font-size: 16px;
  cursor: pointer;
}

.inv-pagination button:last-child {
  background: var(--inv-blue);
  color: white;
  border-color: var(--inv-blue);
}

.inv-pagination button:disabled {
  opacity: .45;
  cursor: not-allowed;
}

.inv-analytics {
  min-width: 0;
  padding-top: 14px;
}

.inv-analytics > h3 {
  font-size: 15px;
  text-align: center;
  margin: 0 0 16px;
  white-space: nowrap;
}

.inv-analytics-card {
  border: 1px solid #ccc;
  border-radius: 16px;
  padding: 13px 11px 9px;
  margin-bottom: 16px;
  overflow: hidden;
}

.inv-analytics-card h4 {
  font-size: 11px;
  font-weight: 400;
  margin: 0 0 8px;
}

.inv-pie-svg {
  display: block;
  width: 100%;
  max-height: 112px;
}

.inv-trend-svg {
  display: block;
  width: 100%;
  height: auto;
}

.inv-chart-total {
  margin: 4px 0;
  font-size: 10px;
  color: #666;
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.inv-quick-actions {
  border: 1px solid #ccc;
  border-radius: 16px;
  padding: 11px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 9px;
}

.inv-quick-actions .inv-primary {
  font-size: 11px;
  padding: 7px 4px;
  border-radius: 8px;
}

.inv-alert-card {
  border: 1px solid #ccc;
  border-radius: 16px;
  padding: 12px 10px;
}

.inv-alert-card h4 {
  font-size: 12px;
  margin: 0 0 13px;
  white-space: nowrap;
}

.inv-alert-card p {
  font-size: 11px;
  line-height: 1.5;
  margin: 0 0 12px;
  overflow-wrap: anywhere;
}

.inv-alert-card p span {
  font-size: 14px;
  font-weight: 700;
}

.inv-alert-link {
  border: 0;
  padding: 5px 0;
  background: transparent;
  color: #2156b5;
  font-size: 11px;
  cursor: pointer;
  text-align: left;
}

.inv-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: #06152d80;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
}

.inv-modal {
  width: min(570px, 100%);
  padding: 24px;
  border-radius: 17px;
  background: #fff;
  box-shadow: 0 20px 70px #0003;
}

.inv-modal-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
}

.inv-modal-heading h2 {
  margin: 0;
  font-size: 23px;
}

.inv-modal-heading > button {
  border: 0;
  background: transparent;
  font-size: 29px;
  cursor: pointer;
}

.inv-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.inv-form-grid label,
.inv-reorder-label {
  display: flex;
  flex-direction: column;
  gap: 7px;
  font-weight: 600;
}

.inv-form-grid input,
.inv-form-grid select,
.inv-reorder-label input {
  width: 100%;
  height: 42px;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 0 10px;
  font: inherit;
  background: white;
}

.inv-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 25px;
}

.inv-modal > p,
.inv-modal form > p {
  line-height: 1.6;
  color: #555;
}

.inv-toast {
  position: fixed;
  z-index: 1100;
  right: 22px;
  bottom: 22px;
  max-width: min(420px, calc(100vw - 32px));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  padding: 14px 16px;
  background: white;
  border: 1px solid #b9dec5;
  border-left: 5px solid #21a653;
  border-radius: 10px;
  box-shadow: 0 5px 25px #0002;
}

.inv-toast button {
  border: 0;
  background: transparent;
  font-size: 22px;
  cursor: pointer;
}

@media (min-width: 1600px) {
  .inv-main {
    padding-left: 26px;
    padding-right: 29px;
  }

  .inv-content-grid {
    grid-template-columns: minmax(0, 1fr) 225px;
    gap: 22px;
  }

  .inv-table td {
    height: 53px;
  }
}

@media (max-width: 1250px) {
  .inv-sidebar {
    width: 255px;
    min-width: 225px;
    padding-left: 16px;
    padding-right: 16px;
  }

  .inv-brand {
    padding: 0;
    gap: 6px;
  }

  .inv-brand-cart {
    width: 49px;
    font-size: 35px;
  }

  .inv-brand h2 {
    font-size: 23px;
  }

  .inv-nav-item {
    gap: 12px;
    padding: 0 12px;
    font-size: 14px;
  }

  .inv-content-grid {
    grid-template-columns: minmax(0, 1fr) 190px;
    gap: 14px;
  }

  .inv-table-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .inv-table-heading h2 {
    font-size: 27px;
  }

  .inv-table-tools {
    width: 100%;
  }

  .inv-table-tools input {
    flex: 1;
  }

  .inv-page-heading,
  .inv-stat-cards {
    margin-left: 0;
    padding-left: 0;
  }

  .inv-filter-tabs {
    margin-left: 0;
  }
}

@media (max-width: 900px) {
  .inv-sidebar {
    width: 76px;
    min-width: 76px;
    padding: 22px 9px;
  }

  .inv-brand {
    justify-content: center;
    margin-bottom: 32px;
  }

  .inv-brand > div:last-child,
  .inv-nav-item > span:last-child {
    display: none;
  }

  .inv-brand-cart {
    width: 48px;
  }

  .inv-nav-item {
    justify-content: center;
    padding: 0;
  }

  .inv-nav-icon {
    width: auto;
  }

  .inv-content-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .inv-analytics {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .inv-analytics > h3 {
    grid-column: 1 / -1;
    margin-bottom: 0;
  }

  .inv-analytics-card,
  .inv-quick-actions {
    margin-bottom: 0;
  }

  .inv-alert-card {
    grid-column: 1 / -1;
  }
}

@media (max-width: 600px) {
  .inv-main {
    padding: 18px 10px;
  }

  .inv-topbar {
    gap: 10px;
  }

  .inv-global-search {
    padding-left: 12px;
  }

  .inv-owner {
    min-width: auto;
  }

  .inv-owner > div:last-child {
    display: none;
  }

  .inv-page-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 13px;
  }

  .inv-page-heading h1 {
    font-size: 28px;
  }

  .inv-stat-cards {
    flex-wrap: wrap;
    gap: 10px;
  }

  .inv-stat-card {
    flex: 1;
    min-width: 180px;
  }

  .inv-table-heading h2 {
    font-size: 23px;
    white-space: normal;
  }

  .inv-pagination {
    flex-wrap: wrap;
    gap: 10px;
  }

  .inv-pagination span {
    font-size: 14px;
    text-align: center;
  }

  .inv-analytics {
    grid-template-columns: 1fr;
  }

  .inv-analytics > h3,
  .inv-alert-card {
    grid-column: auto;
  }

  .inv-form-grid {
    grid-template-columns: 1fr;
  }

  .inv-modal {
    padding: 19px;
  }
}
`;
