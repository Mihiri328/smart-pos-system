
import React, { useMemo, useState } from "react";

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
  { icon: "▦", label: "Dashboard" },
  { icon: "🛒", label: "POS Billing" },
  { icon: "▣", label: "Products Management" },
  { icon: "⌂", label: "Inventory" },
  { icon: "♟", label: "Suppliers Management" },
  { icon: "▤", label: "Purchase Orders" },
  { icon: "♟", label: "Customer Management" },
  { icon: "▥", label: "Sales History" },
  { icon: "◕", label: "Reports" },
  { icon: "⚙", label: "Settings" },
  { icon: "⇥", label: "Logout" },
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

export default function ProductManagement() {
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

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
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
    <div className="pm-app">
      <style>{styles}</style>

      <aside className="pm-sidebar">
        <div className="pm-brand">
          <div className="pm-brand-icon">
            <span>🛒</span>
          </div>
          <div>
            <h2>Smart POS</h2>
            <p>AI Powered System</p>
          </div>
        </div>

        <nav className="pm-navigation">
          {navigation.map((item) => (
            <button
              type="button"
              key={item.label}
              className={`pm-nav-item ${
                item.label === "Products Management" ? "active" : ""
              }`}
              onClick={() => {
                if (item.label !== "Products Management") {
                  setNotice(`${item.label} page is not connected yet.`);
                }
              }}
            >
              <span className="pm-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pm-sidebar-footer">
          <span className="pm-avatar">A</span>
          <div>
            <strong>Admin User</strong>
            <small>Store Administrator</small>
          </div>
        </div>
      </aside>

      <main className="pm-main">
        <header className="pm-header">
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

            <button
              type="button"
              className="pm-notification"
              title="Notifications"
              onClick={() => setNotice("You have 4 notifications.")}
            >
              ♟<span>4</span>
            </button>

            <div className="pm-date">October 21, 2026</div>
          </div>
        </header>

        <section className="pm-stats">
          <div className="pm-stat-card">
            <div className="pm-stat-icon blue">▤</div>
            <div className="pm-stat-content">
              <strong>Today’s Sales</strong>
              <h2>236</h2>
              <p><span className="green-text">12</span> New this month</p>
            </div>
          </div>

          <div className="pm-stat-card">
            <div className="pm-stat-icon green">✓</div>
            <div className="pm-stat-content">
              <strong>Action Products</strong>
              <h2>{products.length}</h2>
              <p><span className="green-text">14%</span> of total</p>
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
            <button className="pm-primary pm-add-top" onClick={openAddModal}>
              + Add New Products
            </button>
          </div>
        </section>

        <section className="pm-workspace">
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
                    {products.filter(
                      (product) => product.category === category
                    ).length}
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
                      <label htmlFor="pm-stock-filter">Stock status</label>
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

                <button className="pm-outline-btn" onClick={exportProducts}>
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
                      <td className="pm-product-name">{product.name}</td>
                      <td className="pm-small-cell">{product.sku}</td>
                      <td>
                        <span
                          className={`pm-category-tag tag-${categories.indexOf(
                            product.category
                          ) % 6}`}
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

            <footer className="pm-table-footer">
              <div className="pm-pagination-info">
                Showing{" "}
                {filteredProducts.length === 0 ? 0 : startIndex + 1} to{" "}
                {Math.min(startIndex + pageSize, filteredProducts.length)} of{" "}
                {filteredProducts.length} products

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
                  &lt;
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .filter(
                    (number) =>
                      number === 1 ||
                      number === totalPages ||
                      Math.abs(number - currentPage) <= 1
                  )
                  .map((number, index, array) => (
                    <React.Fragment key={number}>
                      {index > 0 && number - array[index - 1] > 1 && (
                        <span className="pm-page-dots">…</span>
                      )}
                      <button
                        className={currentPage === number ? "current" : ""}
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
                  &gt;
                </button>
              </div>
            </footer>
          </section>
        </section>
      </main>

      {showModal && (
        <div
          className="pm-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowModal(false);
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

      {notice && (
        <div className="pm-toast" role="status">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss message">
            ×
          </button>
        </div>
      )}
    </div>
  );
}

const styles = `
* {
  box-sizing: border-box;
}

.pm-app {
  --pm-navy: #061d40;
  --pm-blue: #2257b5;
  --pm-bright-blue: #4965f6;
  --pm-border: #d1d1d1;
  --pm-text: #101010;
  display: flex;
  min-height: 100vh;
  width: 100%;
  background: #fff;
  color: var(--pm-text);
  font-family: Arial, Helvetica, sans-serif;
  font-size: 14px;
}

.pm-sidebar {
  background: var(--pm-navy);
  color: #fff;
  width: 322px;
  min-width: 260px;
  min-height: 100vh;
  padding: 43px 24px 22px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.pm-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  margin-bottom: 51px;
}

.pm-brand-icon {
  width: 76px;
  height: 65px;
  display: grid;
  place-items: center;
  color: #ff9c27;
  font-size: 49px;
}

.pm-brand-icon span {
  filter: saturate(1.1);
}

.pm-brand h2 {
  font-size: 28px;
  letter-spacing: -.7px;
  margin: 0 0 4px;
  white-space: nowrap;
}

.pm-brand p {
  color: #6285ff;
  margin: 0;
  font-size: 12px;
  white-space: nowrap;
}

.pm-navigation {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pm-nav-item {
  border: 0;
  color: #fff;
  background: transparent;
  min-height: 49px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  gap: 25px;
  padding: 0 21px;
  text-align: left;
  font-family: inherit;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background .18s;
}

.pm-nav-item:hover {
  background: #142f5c;
}

.pm-nav-item.active {
  background: var(--pm-bright-blue);
}

.pm-nav-icon {
  font-size: 26px;
  width: 37px;
  text-align: center;
  flex-shrink: 0;
}

.pm-sidebar-footer {
  margin-top: auto;
  border-top: 1px solid #294163;
  padding: 19px 5px 0;
  display: flex;
  align-items: center;
  gap: 11px;
}

.pm-avatar {
  width: 39px;
  height: 39px;
  display: grid;
  place-items: center;
  background: #4965f6;
  border-radius: 50%;
  font-weight: 700;
  font-size: 17px;
}

.pm-sidebar-footer strong,
.pm-sidebar-footer small {
  display: block;
}

.pm-sidebar-footer small {
  margin-top: 5px;
  color: #b9c8df;
}

.pm-main {
  flex: 1;
  min-width: 0;
  padding: 43px 21px 24px;
}

.pm-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 22px;
  margin-bottom: 42px;
}

.pm-heading h1 {
  font-size: clamp(25px, 2.2vw, 34px);
  letter-spacing: -.8px;
  line-height: 1.15;
  margin: 0 0 7px;
}

.pm-heading p {
  margin: 0;
  font-size: 15px;
  color: #202020;
}

.pm-header-actions {
  display: flex;
  align-items: center;
  gap: 29px;
}

.pm-global-search,
.pm-table-search {
  height: 41px;
  display: flex;
  align-items: center;
  border: 1px solid var(--pm-border);
  border-radius: 17px;
  padding: 0 14px 0 25px;
  background: #fff;
}

.pm-global-search {
  width: 280px;
}

.pm-global-search input,
.pm-table-search input {
  border: 0;
  outline: 0;
  width: 100%;
  min-width: 0;
  font: inherit;
  background: transparent;
}

.pm-global-search input::placeholder,
.pm-table-search input::placeholder {
  color: #929292;
}

.pm-global-search span,
.pm-table-search span {
  font-size: 31px;
  line-height: 1;
  transform: rotate(-20deg);
  color: #000;
}

.pm-notification {
  position: relative;
  flex-shrink: 0;
  width: 43px;
  height: 43px;
  border: 1px solid #ddd;
  border-radius: 50%;
  background: #fff;
  font-size: 24px;
  cursor: pointer;
}

.pm-notification span {
  position: absolute;
  right: -9px;
  top: -7px;
  border-radius: 50%;
  background: #f04432;
  color: #fff;
  font-size: 13px;
  display: grid;
  place-items: center;
  width: 25px;
  height: 25px;
}

.pm-date {
  border: 1px solid var(--pm-border);
  border-radius: 16px;
  height: 55px;
  min-width: 210px;
  padding: 0 20px;
  display: grid;
  place-items: center;
  font-weight: 600;
  font-size: 18px;
  white-space: nowrap;
}

.pm-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 21px;
  margin-bottom: 31px;
}

.pm-stat-card {
  min-height: 101px;
  border: 1px solid #ccc;
  border-radius: 21px;
  padding: 14px 11px;
  display: flex;
  align-items: center;
  gap: 15px;
  min-width: 0;
}

.pm-stat-icon {
  width: 56px;
  height: 56px;
  min-width: 56px;
  border: 4px solid rgba(255,255,255,.7);
  outline: 1px solid #e5e5e5;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 31px;
  font-weight: 700;
}

.pm-stat-icon.blue { background: #4b9df5; }
.pm-stat-icon.green { background: #0cbb35; }
.pm-stat-icon.orange { background: #ff9e22; }
.pm-stat-icon.red { background: #f71924; }

.pm-stat-content {
  min-width: 0;
}

.pm-stat-content strong {
  display: block;
  font-size: 14px;
  white-space: nowrap;
}

.pm-stat-content h2 {
  margin: 8px 0 6px;
  font-size: 25px;
  line-height: 1;
}

.pm-stat-content p {
  font-size: 12px;
  margin: 0;
  white-space: nowrap;
}

.green-text { color: #00b532; }
.orange-text { color: #ff941e; }
.red-text { color: #ff3039; }

.pm-stat-out {
  gap: 12px;
}

.pm-stat-out .pm-stat-content {
  flex: 1;
}

.pm-primary {
  border: 1px solid var(--pm-blue);
  border-radius: 11px;
  background: var(--pm-blue);
  color: #fff;
  font-family: inherit;
  font-weight: 600;
  font-size: 14px;
  padding: 11px 17px;
  cursor: pointer;
  transition: background .15s;
}

.pm-primary:hover {
  background: #17469b;
}

.pm-add-top {
  white-space: nowrap;
  padding: 9px 15px;
  font-size: 13px;
}

.pm-workspace {
  display: grid;
  grid-template-columns: 256px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.pm-category-panel,
.pm-products-panel {
  border: 1px solid #777;
  border-radius: 16px;
  min-width: 0;
  background: #fff;
  overflow: visible;
}

.pm-category-panel {
  display: flex;
  flex-direction: column;
}

.pm-category-header {
  margin: 0 2px;
  min-height: 47px;
  padding: 7px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #ddd;
}

.pm-category-header h3,
.pm-table-toolbar h3 {
  margin: 0;
  font-size: 16px;
}

.pm-square-btn {
  width: 31px;
  height: 31px;
  border: 1px solid #ccc;
  border-radius: 10px;
  background: #fff;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
}

.pm-add-category {
  padding: 10px;
  display: flex;
  gap: 5px;
  border-bottom: 1px solid #ddd;
}

.pm-add-category input {
  width: 100%;
  min-width: 0;
  border: 1px solid #ccc;
  border-radius: 6px;
  padding: 8px;
}

.pm-add-category .pm-primary {
  padding: 7px 9px;
}

.pm-category-list {
  padding: 8px 11px 15px;
}

.pm-category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 42px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  padding: 0 13px;
  font: inherit;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
}

.pm-category-item span:first-child {
  overflow-wrap: anywhere;
}

.pm-category-item:hover:not(.selected) {
  background: #f0f3f9;
}

.pm-category-item.selected {
  background: var(--pm-blue);
  color: #fff;
}

.pm-category-item span:last-child {
  flex-shrink: 0;
}

.pm-category-footer {
  margin-top: auto;
  padding: 21px 19px 15px;
  border-top: 1px solid #ccc;
}

.pm-manage-btn {
  width: 100%;
  min-height: 45px;
  font-size: 15px;
}

.pm-products-panel {
  overflow: visible;
}

.pm-table-toolbar {
  min-height: 78px;
  padding: 13px 15px 13px 19px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  border-bottom: 1px solid #ccc;
}

.pm-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.pm-outline-btn {
  min-height: 40px;
  border: 1px solid #ccc;
  border-radius: 12px;
  background: #fff;
  color: #111;
  font: inherit;
  font-weight: 600;
  padding: 0 18px;
  cursor: pointer;
  white-space: nowrap;
}

.pm-outline-btn:hover {
  background: #f5f7fa;
}

.pm-danger-btn {
  color: #d92727;
}

.pm-table-search {
  width: 240px;
  height: 40px;
  padding-left: 19px;
}

.pm-table-search span {
  display: none;
}

.pm-filter-wrap {
  position: relative;
}

.pm-filter-menu {
  position: absolute;
  top: 47px;
  right: 0;
  width: 220px;
  z-index: 10;
  background: #fff;
  border: 1px solid #ddd;
  box-shadow: 0 8px 22px #00000015;
  border-radius: 12px;
  padding: 15px;
  display: grid;
  gap: 10px;
}

.pm-filter-menu label {
  font-weight: 600;
}

.pm-filter-menu select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: white;
}

.pm-selection-info {
  display: block;
  margin-top: 5px;
  color: #2257b5;
}

.pm-table-scroll {
  width: 100%;
  overflow-x: auto;
}

.pm-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: auto;
}

.pm-table thead {
  background: #f5f6ff;
}

.pm-table th {
  height: 45px;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  padding: 10px 7px;
  text-align: center;
}

.pm-table td {
  height: 61px;
  padding: 8px 7px;
  border-top: 1px solid #ccc;
  text-align: center;
  vertical-align: middle;
}

.pm-table tbody tr:hover {
  background: #fafbff;
}

.pm-table .pm-check-cell {
  width: 43px;
  padding: 7px 8px;
}

.pm-check-cell input {
  width: 19px;
  height: 19px;
  margin: 0;
  accent-color: var(--pm-blue);
  cursor: pointer;
}

.pm-product-name {
  min-width: 115px;
  max-width: 155px;
  text-align: left !important;
  font-size: 15px;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.pm-small-cell {
  font-size: 12px;
  white-space: nowrap;
}

.pm-price {
  min-width: 83px;
}

.pm-category-tag {
  display: inline-block;
  padding: 3px 6px;
  border-radius: 5px;
  border: 1px solid #c6c6c6;
  font-size: 12px;
  white-space: nowrap;
  max-width: 130px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag-0 { background: #fff6be; color: #8a6300; }
.tag-1 { background: #d8e7ff; color: #194f9b; }
.tag-2 { background: #f3d6eb; color: #9a3278; }
.tag-3 { background: #d8c0f3; color: #44315e; }
.tag-4 { background: #d2eed9; color: #246b3a; }
.tag-5 { background: #ffddb8; color: #8d4d05; }

.pm-status {
  display: inline-block;
  min-width: 79px;
  padding: 4px 7px;
  border: 1px solid transparent;
  border-radius: 5px;
  font-size: 12px;
  white-space: nowrap;
}

.status-in {
  background: #d4efda;
  color: #23813a;
  border-color: #a5c7ad;
}

.status-low {
  background: #ffdbad;
  color: #99590b;
  border-color: #e6b36e;
}

.status-out {
  background: #ffbfc1;
  color: #e31924;
  border-color: #ff7b80;
}

.pm-row-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
}

.pm-action-btn {
  width: 31px;
  height: 31px;
  padding: 0;
  border: 1px solid #ccc;
  border-radius: 11px;
  background: #fff;
  display: grid;
  place-items: center;
  cursor: pointer;
  font-family: inherit;
}

.pm-action-btn:hover {
  background: #f0f2f8;
}

.pm-action-btn.edit {
  color: #003dff;
  font-size: 29px;
  font-weight: 700;
}

.pm-action-btn.delete {
  color: #f32222;
  font-size: 22px;
}

.pm-action-btn.more {
  color: #111;
  font-weight: 700;
  font-size: 16px;
}

.pm-empty {
  height: 100px !important;
  color: #777;
  text-align: center !important;
}

.pm-table-footer {
  min-height: 72px;
  border-top: 1px solid #ccc;
  padding: 12px 14px 12px 39px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.pm-pagination-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
}

.pm-page-size {
  border: 1px solid #ddd;
  border-radius: 7px;
  padding: 6px;
  background: #fff;
  font: inherit;
}

.pm-pagination {
  display: flex;
  align-items: center;
  gap: 10px;
}

.pm-pagination button {
  min-width: 33px;
  height: 41px;
  border: 1px solid #aaa;
  border-radius: 9px;
  background: #fffafa;
  font: inherit;
  font-size: 18px;
  cursor: pointer;
}

.pm-pagination button.current {
  color: #fff;
  background: var(--pm-blue);
}

.pm-pagination button:disabled {
  opacity: .4;
  cursor: not-allowed;
}

.pm-page-dots {
  font-size: 18px;
}

.pm-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  padding: 20px;
  background: #06152d80;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
}

.pm-modal {
  width: min(560px, 100%);
  background: #fff;
  border-radius: 18px;
  padding: 25px;
  box-shadow: 0 20px 70px #00000030;
}

.pm-modal-header {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 25px;
}

.pm-modal-header h2 {
  margin: 0 0 8px;
  font-size: 24px;
}

.pm-modal-header p {
  margin: 0;
  color: #777;
}

.pm-modal-close {
  align-self: flex-start;
  border: 0;
  background: transparent;
  font-size: 30px;
  cursor: pointer;
}

.pm-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.pm-form-grid label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-weight: 600;
}

.pm-form-grid input,
.pm-form-grid select {
  width: 100%;
  height: 43px;
  border: 1px solid #ccc;
  border-radius: 9px;
  padding: 0 11px;
  font: inherit;
  font-weight: 400;
  background: #fff;
}

.pm-form-grid input:focus,
.pm-form-grid select:focus {
  outline: 2px solid #b5c9ff;
  border-color: var(--pm-blue);
}

.pm-modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 26px;
}

.pm-toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 200;
  max-width: min(420px, calc(100vw - 32px));
  padding: 15px 17px;
  background: #fff;
  color: #163c27;
  border: 1px solid #b8dfc5;
  border-left: 5px solid #20a653;
  border-radius: 10px;
  box-shadow: 0 5px 25px #0000001a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.pm-toast button {
  border: 0;
  background: transparent;
  font-size: 22px;
  cursor: pointer;
}

@media (min-width: 1600px) {
  .pm-main {
    padding-left: 26px;
    padding-right: 29px;
  }

  .pm-workspace {
    grid-template-columns: 270px minmax(0, 1fr);
    gap: 17px;
  }

  .pm-table td {
    height: 64px;
  }
}

@media (max-width: 1350px) {
  .pm-sidebar {
    width: 255px;
    min-width: 225px;
    padding-left: 16px;
    padding-right: 16px;
  }

  .pm-brand {
    padding: 0 2px;
    gap: 6px;
  }

  .pm-brand-icon {
    width: 48px;
    font-size: 36px;
  }

  .pm-brand h2 {
    font-size: 23px;
  }

  .pm-nav-item {
    gap: 12px;
    padding: 0 12px;
    font-size: 14px;
  }

  .pm-header {
    align-items: flex-start;
    flex-wrap: wrap;
    margin-bottom: 25px;
  }

  .pm-header-actions {
    gap: 12px;
    flex-wrap: wrap;
  }

  .pm-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .pm-workspace {
    grid-template-columns: 215px minmax(0, 1fr);
  }

  .pm-table-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .pm-toolbar-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .pm-table-search {
    flex: 1;
    min-width: 145px;
  }
}

@media (max-width: 900px) {
  .pm-sidebar {
    width: 76px;
    min-width: 76px;
    padding: 22px 9px;
  }

  .pm-brand {
    justify-content: center;
    padding: 0;
    margin-bottom: 32px;
  }

  .pm-brand > div:last-child,
  .pm-nav-item > span:last-child,
  .pm-sidebar-footer > div {
    display: none;
  }

  .pm-brand-icon {
    width: 49px;
    height: 45px;
  }

  .pm-nav-item {
    justify-content: center;
    padding: 0;
    gap: 0;
  }

  .pm-nav-icon {
    width: auto;
  }

  .pm-sidebar-footer {
    justify-content: center;
  }

  .pm-workspace {
    grid-template-columns: 1fr;
  }

  .pm-category-panel {
    max-height: 330px;
    overflow-y: auto;
  }

  .pm-category-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 4px;
  }

  .pm-category-footer {
    padding: 12px;
  }
}

@media (max-width: 600px) {
  .pm-main {
    padding: 22px 12px;
  }

  .pm-header-actions {
    width: 100%;
  }

  .pm-global-search {
    flex: 1;
    width: auto;
    min-width: 0;
  }

  .pm-date {
    display: none;
  }

  .pm-heading h1 {
    font-size: 25px;
  }

  .pm-stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .pm-stat-card {
    min-height: 88px;
  }

  .pm-stat-out {
    flex-wrap: wrap;
  }

  .pm-add-top {
    margin-left: auto;
  }

  .pm-toolbar-actions > .pm-outline-btn {
    padding: 0 10px;
  }

  .pm-table-toolbar {
    padding: 13px;
  }

  .pm-table-search {
    width: 100%;
    flex-basis: 100%;
  }

  .pm-table-footer {
    padding: 15px;
    flex-direction: column;
    align-items: flex-start;
  }

  .pm-pagination {
    gap: 6px;
    flex-wrap: wrap;
  }

  .pm-form-grid {
    grid-template-columns: 1fr;
  }

  .pm-modal {
    padding: 20px;
  }

  .pm-category-list {
    grid-template-columns: 1fr;
  }
}
`;
