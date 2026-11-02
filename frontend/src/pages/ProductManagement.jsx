
import React, { useMemo, useState } from "react";
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
  Menu,
  X,
  AlertCircle,
} from "lucide-react";

const initialProducts = [
  { id: 1, name: "Samba Rice (1kg)", sku: "PRD001", category: "Grains & Rice", unit: "Pack", price: 220, stock: 50, status: "In Stock" },
  { id: 2, name: "Kothmale fresh milk", sku: "PRD002", category: "Dairy Products", unit: "Bottle", price: 450, stock: 40, status: "Low Stock" },
  { id: 3, name: "White Sugar", sku: "PRD003", category: "Grains & Rice", unit: "Kg", price: 280, stock: 100, status: "In Stock" },
  { id: 4, name: "Cooking oil (1L)", sku: "PRD004", category: "Dairy Products", unit: "Bottle", price: 650, stock: 10, status: "Low Stock" },
  { id: 5, name: "Tea Bags (200g)", sku: "PRD005", category: "Dairy Products", unit: "Pack", price: 550, stock: 200, status: "In Stock" },
  { id: 6, name: "Prima Noodles", sku: "PRD006", category: "Snacks", unit: "Pack", price: 120, stock: 0, status: "Out of Stock" },
  { id: 7, name: "Salt (400g)", sku: "PRD007", category: "Spices & Masala", unit: "Pack", price: 100, stock: 120, status: "In Stock" },
  { id: 8, name: "Surf Excel (500g)", sku: "PRD008", category: "Cleaning Items", unit: "Pack", price: 390, stock: 87, status: "Low Stock" },
  { id: 9, name: "Marie Biscuits", sku: "PRD009", category: "Snacks", unit: "Pack", price: 150, stock: 75, status: "In Stock" },
  { id: 10, name: "Fresh Milk 500ml", sku: "PRD010", category: "Dairy Products", unit: "Bottle", price: 280, stock: 5, status: "Low Stock" },
];

const initialCategories = [
  "Grains & Rice",
  "Beverages",
  "Snacks",
  "Dairy Products",
  "HouseHold",
  "Personal Care",
  "Spices & Masala",
  "Cleaning Items",
  "Other Items",
];

const navigation = [
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

const getStatus = (stock) => {
  if (Number(stock) === 0) return "Out of Stock";
  if (Number(stock) <= 40) return "Low Stock";
  return "In Stock";
};

const money = (value) =>
  Number(value).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function ProductManagement({ onNavigate, onLogout }) {
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [search, setSearch] = useState("");
  const [globalSearch, setGlobalSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [stockFilter, setStockFilter] = useState("All");
  const [notice, setNotice] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: initialCategories[0],
    unit: "Pack",
    price: "",
    stock: "",
  });

  const filteredProducts = useMemo(() => {
    const query = `${search} ${globalSearch}`.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === "All Categories" ||
        product.category === selectedCategory;

      const matchesStock =
        stockFilter === "All" ||
        (stockFilter === "In Stock" && product.stock > 40) ||
        (stockFilter === "Low Stock" &&
          product.stock > 0 &&
          product.stock <= 40) ||
        (stockFilter === "Out of Stock" && product.stock === 0);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, globalSearch, selectedCategory, stockFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;

  const visibleProducts = filteredProducts.slice(
    startIndex,
    startIndex + pageSize
  );

  const lowStockCount = products.filter(
    (product) => product.stock > 0 && product.stock <= 40
  ).length;

  const outOfStockCount = products.filter(
    (product) => product.stock === 0
  ).length;

  const openAddModal = () => {
    setEditingProduct(null);

    setForm({
      name: "",
      sku: "",
      category: categories[0] || "Other Items",
      unit: "Pack",
      price: "",
      stock: "",
    });

    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);

    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      unit: product.unit,
      price: String(product.price),
      stock: String(product.stock),
    });

    setShowModal(true);
  };

  const handleSave = (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const sku = form.sku.trim();

    if (!name || !sku || form.price === "" || form.stock === "") {
      setNotice("Please fill in all required fields.");
      return;
    }

    const duplicateSku = products.some(
      (product) =>
        product.sku.toLowerCase() === sku.toLowerCase() &&
        product.id !== editingProduct?.id
    );

    if (duplicateSku) {
      setNotice("This SKU already exists. Please use another SKU.");
      return;
    }

    const stock = Math.max(0, Number(form.stock));

    const productData = {
      ...form,
      name,
      sku,
      price: Math.max(0, Number(form.price)),
      stock,
      status: getStatus(stock),
    };

    if (editingProduct) {
      setProducts((previous) =>
        previous.map((product) =>
          product.id === editingProduct.id
            ? { ...product, ...productData }
            : product
        )
      );

      setNotice("Product updated successfully.");
    } else {
      setProducts((previous) => [
        ...previous,
        { id: Date.now(), ...productData },
      ]);

      setNotice("New product added successfully.");
    }

    setShowModal(false);
  };

  const handleDelete = (product) => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;

    setProducts((previous) =>
      previous.filter((item) => item.id !== product.id)
    );

    setSelectedIds((previous) =>
      previous.filter((id) => id !== product.id)
    );

    setNotice("Product deleted successfully.");
  };

  const exportProducts = () => {
    const headers = [
      "Product Name",
      "SKU",
      "Category",
      "Unit",
      "Price (Rs.)",
      "Stock",
      "Status",
    ];

    const rows = filteredProducts.map((product) => [
      product.name,
      product.sku,
      product.category,
      product.unit,
      product.price,
      product.stock,
      getStatus(product.stock),
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
    link.download = "smart-pos-products.csv";
    link.click();

    URL.revokeObjectURL(url);

    setNotice("Products exported successfully.");
  };

  const addCategory = () => {
    const name = newCategory.trim();

    if (!name) return;

    if (
      categories.some(
        (category) => category.toLowerCase() === name.toLowerCase()
      )
    ) {
      setNotice("This category already exists.");
      return;
    }

    setCategories((previous) => [...previous, name]);
    setNewCategory("");
    setNotice("Category added successfully.");
  };

  const toggleProduct = (id) => {
    setSelectedIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  };

  const toggleAllVisible = () => {
    const allSelected = visibleProducts.every((product) =>
      selectedIds.includes(product.id)
    );

    if (allSelected) {
      setSelectedIds((previous) =>
        previous.filter(
          (id) => !visibleProducts.some((product) => product.id === id)
        )
      );
    } else {
      setSelectedIds((previous) => [
        ...new Set([
          ...previous,
          ...visibleProducts.map((product) => product.id),
        ]),
      ]);
    }
  };

  const deleteSelected = () => {
    if (selectedIds.length === 0) return;

    if (!window.confirm(`Delete ${selectedIds.length} selected products?`))
      return;

    setProducts((previous) =>
      previous.filter((product) => !selectedIds.includes(product.id))
    );

    setSelectedIds([]);
    setNotice("Selected products deleted.");
  };

  return (
    <div className="sh-page pm-app">

      {/* Shared Sales History Navigation */}
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
            type="button"
            onClick={() => setMobileMenu(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sp-nav-label">MAIN MENU</div>

        <nav className="sp-nav">
          {navigation.map(({ label, icon: Icon, page, count }) => (
            <button
              type="button"
              key={page}
              className={`sp-nav-item ${
                page === "products" ? "active" : ""
              }`}
              onClick={() => {
                setMobileMenu(false);

                if (page === "products") return;

                if (onNavigate) {
                  onNavigate(page);
                } else {
                  setNotice(`${label} page is not connected yet.`);
                }
              }}
            >
              <Icon size={18} />

              <span>{label}</span>

              {count && (
                <span className="sp-nav-count">{count}</span>
              )}
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
            onClick={() => {
              setMobileMenu(false);

              if (onLogout) {
                onLogout();
              } else if (onNavigate) {
                onNavigate("login");
              } else {
                setNotice("Logout is not connected yet.");
              }
            }}
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

      {/* Product Management Content */}
      <main className="sp-main pm-main">

        <header className="pm-header">
          <button
            className="sp-mobile-menu pm-mobile-menu"
            type="button"
            onClick={() => setMobileMenu(true)}
            aria-label="Open navigation"
          >
            <Menu size={21} />
          </button>

          <div className="pm-heading">
            <h1>Product Management</h1>
            <p>Add, Edit and manage your store products</p>
          </div>

          <div className="pm-header-actions">
            <label className="pm-global-search">
              <input
                value={globalSearch}
                onChange={(event) => {
                  setGlobalSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search anything ..."
                aria-label="Search all products"
              />
              <span>⌕</span>
            </label>

            <div className="pm-notification-wrap">
              <button
                type="button"
                className="pm-notification"
                title="Notifications"
                aria-label="Notifications"
                onClick={() =>
                  setShowNotifications((current) => !current)
                }
              >
                <AlertCircle size={19} />
                <span>4</span>
              </button>

              {showNotifications && (
                <div className="pm-notification-pop">
                  <strong>Notifications</strong>
                  <p>3 products have critical stock.</p>
                  <p>5 products are expiring soon.</p>
                  <p>2 purchase orders pending.</p>
                </div>
              )}
            </div>

            <div className="pm-date">October 21, 2026</div>
          </div>
        </header>

        {/* Statistics */}
        <section className="pm-stats">
          <div className="pm-stat-card">
            <div className="pm-stat-icon blue">▤</div>

            <div className="pm-stat-content">
              <strong>Today’s Sales</strong>
              <h2>236</h2>
              <p>
                <span className="green-text">12</span> New this month
              </p>
            </div>
          </div>

          <div className="pm-stat-card">
            <div className="pm-stat-icon green">✓</div>

            <div className="pm-stat-content">
              <strong>Action Products</strong>
              <h2>{products.length}</h2>
              <p>
                <span className="green-text">14%</span> of total
              </p>
            </div>
          </div>

          <div className="pm-stat-card">
            <div className="pm-stat-icon orange">▰</div>

            <div className="pm-stat-content">
              <strong>Low Stock Items</strong>
              <h2>{lowStockCount}</h2>
              <p className="orange-text">Need Attention</p>
            </div>
          </div>

          <div className="pm-stat-card pm-stat-out">
            <div className="pm-stat-icon red">▦</div>

            <div className="pm-stat-content">
              <strong>Out of Stock</strong>
              <h2>{outOfStockCount}</h2>
              <p className="red-text">Urgent restock</p>
            </div>

            
          </div>
        </section>

        {/* Product Workspace */}
        <section className="pm-workspace">

          {/* Categories */}
          <aside className="pm-category-panel">
            <div className="pm-category-header">
              <h3>Categories</h3>

              <button
                className="pm-square-btn"
                title="Add category"
                onClick={() => setShowCategories(!showCategories)}
              >
                +
              </button>
            </div>

            {showCategories && (
              <div className="pm-add-category">
                <input
                  value={newCategory}
                  onChange={(event) => setNewCategory(event.target.value)}
                  placeholder="Category name"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") addCategory();
                  }}
                />

                <button className="pm-primary" onClick={addCategory}>
                  Add
                </button>
              </div>
            )}

            <div className="pm-category-list">
              <button
                className={`pm-category-item ${
                  selectedCategory === "All Categories" ? "selected" : ""
                }`}
                onClick={() => {
                  setSelectedCategory("All Categories");
                  setPage(1);
                }}
              >
                <span>All Categories</span>
                <span>{products.length}</span>
              </button>

              {categories.map((category) => (
                <button
                  key={category}
                  className={`pm-category-item ${
                    selectedCategory === category ? "selected" : ""
                  }`}
                  onClick={() => {
                    setSelectedCategory(category);
                    setPage(1);
                  }}
                >
                  <span>{category}</span>

                  <span>
                    {
                      products.filter(
                        (product) => product.category === category
                      ).length
                    }
                  </span>
                </button>
              ))}
            </div>

            <div className="pm-category-footer">
              <button
                className="pm-primary pm-manage-btn"
                onClick={() => setShowCategories(!showCategories)}
              >
                Manage Categories
              </button>
            </div>
          </aside>

          {/* Products Table */}
          <section className="pm-products-panel">
            <div className="pm-table-toolbar">
              <div>
                <h3>All Products</h3>

                {selectedIds.length > 0 && (
                  <small className="pm-selection-info">
                    {selectedIds.length} selected
                  </small>
                )}
              </div>

              <div className="pm-toolbar-actions">
                  {/* Add New Product Button */}
  <button
    type="button"
    className="pm-primary pm-add-top"
    onClick={openAddModal}
  >
    + Add New Product
  </button>
                {selectedIds.length > 0 && (
                  <button
                    className="pm-outline-btn pm-danger-btn"
                    onClick={deleteSelected}
                  >
                    Delete Selected
                  </button>
                )}

                <div className="pm-filter-wrap">
                  <button
                    className="pm-outline-btn"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    Filter
                  </button>

                  {showFilters && (
                    <div className="pm-filter-menu">
                      <label htmlFor="pm-stock-filter">
                        Stock status
                      </label>

                      <select
                        id="pm-stock-filter"
                        value={stockFilter}
                        onChange={(event) => {
                          setStockFilter(event.target.value);
                          setPage(1);
                        }}
                      >
                        <option value="All">All Products</option>
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                      </select>

                      <button
                        className="pm-primary"
                        onClick={() => {
                          setStockFilter("All");
                          setShowFilters(false);
                          setPage(1);
                        }}
                      >
                        Reset
                      </button>
                    </div>
                  )}
                </div>

                <button
                  className="pm-outline-btn"
                  onClick={exportProducts}
                >
                  Export
                </button>

                <label className="pm-table-search">
                  <input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search Products..."
                  />
                  <span>⌕</span>
                </label>
              </div>
            </div>

            <div className="pm-table-scroll">
              <table className="pm-table">
                <thead>
                  <tr>
                    <th className="pm-check-cell">
                      <input
                        type="checkbox"
                        aria-label="Select all visible products"
                        checked={
                          visibleProducts.length > 0 &&
                          visibleProducts.every((product) =>
                            selectedIds.includes(product.id)
                          )
                        }
                        onChange={toggleAllVisible}
                      />
                    </th>

                    <th>Products</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Unit</th>
                    <th>Price (Rs.)</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleProducts.map((product) => (
                    <tr key={product.id}>
                      <td className="pm-check-cell">
                        <input
                          type="checkbox"
                          aria-label={`Select ${product.name}`}
                          checked={selectedIds.includes(product.id)}
                          onChange={() => toggleProduct(product.id)}
                        />
                      </td>

                      <td className="pm-product-name">
                        {product.name}
                      </td>

                      <td className="pm-small-cell">{product.sku}</td>

                      <td>
                        <span
                          className={`pm-category-tag tag-${
                            categories.indexOf(product.category) % 6
                          }`}
                        >
                          {product.category}
                        </span>
                      </td>

                      <td className="pm-small-cell">{product.unit}</td>

                      <td className="pm-small-cell pm-price">
                        {money(product.price)}
                      </td>

                      <td className="pm-small-cell">{product.stock}</td>

                      <td>
                        <span
                          className={`pm-status ${
                            product.stock === 0
                              ? "status-out"
                              : product.stock <= 40
                              ? "status-low"
                              : "status-in"
                          }`}
                        >
                          {getStatus(product.stock)}
                        </span>
                      </td>

                      <td>
                        <div className="pm-row-actions">
                          <button
                            className="pm-action-btn edit"
                            title="Edit product"
                            aria-label={`Edit ${product.name}`}
                            onClick={() => openEditModal(product)}
                          >
                            ✎
                          </button>

                          <button
                            className="pm-action-btn delete"
                            title="Delete product"
                            aria-label={`Delete ${product.name}`}
                            onClick={() => handleDelete(product)}
                          >
                            ▣
                          </button>

                          <button
                            className="pm-action-btn more"
                            title="More options"
                            onClick={() => openEditModal(product)}
                          >
                            •••
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {visibleProducts.length === 0 && (
                    <tr>
                      <td colSpan="9" className="pm-empty">
                        No products found. Try a different search or category.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <footer className="pm-table-footer">
              <div className="pm-pagination-info">
                Showing{" "}
                {filteredProducts.length === 0 ? 0 : startIndex + 1} to{" "}
                {Math.min(
                  startIndex + pageSize,
                  filteredProducts.length
                )}{" "}
                of {filteredProducts.length} products

                <select
                  className="pm-page-size"
                  value={pageSize}
                  aria-label="Products per page"
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setPage(1);
                  }}
                >
                  <option value={5}>5 / page</option>
                  <option value={10}>10 / page</option>
                  <option value={20}>20 / page</option>
                </select>
              </div>

              <div className="pm-pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setPage((previous) => previous - 1)}
                >
                  {"<"}
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                )
                  .filter(
                    (number) =>
                      number === 1 ||
                      number === totalPages ||
                      Math.abs(number - currentPage) <= 1
                  )
                  .map((number, index, array) => (
                    <React.Fragment key={number}>
                      {index > 0 &&
                        number - array[index - 1] > 1 && (
                          <span className="pm-page-dots">…</span>
                        )}

                      <button
                        className={
                          currentPage === number ? "current" : ""
                        }
                        onClick={() => setPage(number)}
                      >
                        {number}
                      </button>
                    </React.Fragment>
                  ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((previous) => previous + 1)}
                >
                  {">"}
                </button>
              </div>
            </footer>
          </section>
        </section>
      </main>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div
          className="pm-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowModal(false);
            }
          }}
        >
          <div
            className="pm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pm-modal-title"
          >
            <div className="pm-modal-header">
              <div>
                <h2 id="pm-modal-title">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>

                <p>Enter the product details below.</p>
              </div>

              <button
                className="pm-modal-close"
                onClick={() => setShowModal(false)}
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="pm-form-grid">
                <label>
                  Product Name *
                  <input
                    required
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="Enter product name"
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
                    placeholder="e.g. PRD011"
                  />
                </label>

                <label>
                  Category *
                  <select
                    value={form.category}
                    onChange={(event) =>
                      setForm({ ...form, category: event.target.value })
                    }
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Unit *
                  <select
                    value={form.unit}
                    onChange={(event) =>
                      setForm({ ...form, unit: event.target.value })
                    }
                  >
                    <option>Pack</option>
                    <option>Kg</option>
                    <option>Gram</option>
                    <option>Bottle</option>
                    <option>Piece</option>
                    <option>Box</option>
                    <option>Litre</option>
                  </select>
                </label>

                <label>
                  Price (Rs.) *
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) =>
                      setForm({ ...form, price: event.target.value })
                    }
                    placeholder="0.00"
                  />
                </label>

                <label>
                  Stock Quantity *
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(event) =>
                      setForm({ ...form, stock: event.target.value })
                    }
                    placeholder="Enter quantity"
                  />
                </label>
              </div>

              <div className="pm-modal-actions">
                <button
                  type="button"
                  className="pm-outline-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="pm-primary">
                  {editingProduct ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Message */}
      {notice && (
        <div className="pm-toast" role="status">
          <span>{notice}</span>

          <button
            onClick={() => setNotice("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
