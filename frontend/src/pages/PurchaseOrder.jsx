
import { useMemo, useState } from "react";
import "./PurchaseOrder.css";
import logo from "../img/Dark logo.jpeg";

const initialOrders = [
  {
    id: "PO-2026-001",
    supplier: "Ceylon Wholesale Traders",
    amount: 76000,
    status: "Pending",
    orderDate: "2026-07-26",
    expectedDate: "2026-07-30",
  },
  {
    id: "PO-2026-002",
    supplier: "Ceylon Wholesale Traders",
    amount: 76000,
    status: "Pending",
    orderDate: "2026-07-26",
    expectedDate: "2026-07-30",
  },
  {
    id: "PO-2026-003",
    supplier: "Ceylon Wholesale Traders",
    amount: 76000,
    status: "Received",
    orderDate: "2026-07-26",
    expectedDate: "2026-07-30",
  },
  {
    id: "PO-2026-004",
    supplier: "Ceylon Wholesale Traders",
    amount: 26000,
    status: "Received",
    orderDate: "2026-07-26",
    expectedDate: "2026-07-30",
  },
  {
    id: "PO-2026-005",
    supplier: "Ceylon Wholesale Traders",
    amount: 35000,
    status: "Cancelled",
    orderDate: "2026-07-26",
    expectedDate: "2026-07-30",
  },
  {
    id: "PO-2026-006",
    supplier: "Ceylon Wholesale Traders",
    amount: 85000,
    status: "Cancelled",
    orderDate: "2026-07-26",
    expectedDate: "2026-07-30",
  },
];

const defaultProducts = [
  { name: "White Sugar (1kg)", qty: 100, price: 200 },
  { name: "Samba Rice (1kg)", qty: 200, price: 280 },
  { name: "White Sugar (1kg)", qty: 100, price: 200 },
  { name: "Believe Champier (19kg)", qty: 100, price: 200 },
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

const pageMap = {
  Dashboard: "dashboard",
  "POS Billing": "pos",
  "Products Management": "products",
  Inventory: "inventory",
  "Suppliers Management": "suppliers",
  "Purchase Orders": "Purchase Orders",
  "Customer Management": "customers",
  "Sales History": "sales",
  Reports: "reports",
  Settings: "settings",
};

const money = (amount) =>
  Number(amount || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatMoney = (amount) => `Rs. ${money(amount)}`;

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function PurchaseOrder({
  onNavigate,
  currentPage = "Purchase Orders",
  onLogout,
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedId, setSelectedId] = useState("PO-2026-006");
  const [editingId, setEditingId] = useState(null);

  const [supplier, setSupplier] = useState(
    "Ceylon Wholesale Traders"
  );
  const [poNumber, setPoNumber] = useState("PO-2026-007");
  const [orderDate, setOrderDate] = useState("2026-10-28");
  const [expectedDate, setExpectedDate] = useState("2026-10-31");

  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  const [products, setProducts] = useState(defaultProducts);

  const selectedOrder =
    orders.find((order) => order.id === selectedId) || orders[0];

  const subtotal = products.reduce(
    (sum, product) =>
      sum + Number(product.qty || 0) * Number(product.price || 0),
    0
  );

  const tax = subtotal * 0.118;
  const grandTotal = subtotal + tax;

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) =>
        `${order.id} ${order.supplier} ${order.status}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [orders, search]
  );

  const activeOrders = orders.filter(
    (order) => order.status === "Pending"
  ).length;

  const resetForm = () => {
    const nextNumber =
      Math.max(
        0,
        ...orders.map((order) =>
          Number(order.id.split("-").pop())
        )
      ) + 1;

    setSupplier("Ceylon Wholesale Traders");
    setPoNumber(
      `PO-2026-${String(nextNumber).padStart(3, "0")}`
    );
    setOrderDate("2026-10-28");
    setExpectedDate("2026-10-31");
    setEditingId(null);
  };

  const handleNavigation = (label) => {
    if (label === "Logout") {
      if (onLogout) {
        onLogout();
      } else {
        setNotice("Connect the Logout action in App.jsx.");
      }
      return;
    }

    const destination = pageMap[label];

    if (destination && onNavigate) {
      onNavigate(destination);
    } else {
      setNotice(`${label} page navigation is not connected yet.`);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (expectedDate < orderDate) {
      setNotice(
        "Expected date cannot be earlier than the order date."
      );
      return;
    }

    if (editingId) {
      setOrders((current) =>
        current.map((order) =>
          order.id === editingId
            ? {
                ...order,
                supplier,
                orderDate,
                expectedDate,
              }
            : order
        )
      );

      setSelectedId(editingId);
      setNotice("Purchase order updated successfully.");
    } else {
      if (orders.some((order) => order.id === poNumber)) {
        setNotice(
          "This PO number already exists. Please use another number."
        );
        return;
      }

      const newOrder = {
        id: poNumber,
        supplier,
        amount: grandTotal,
        status: "Pending",
        orderDate,
        expectedDate,
        products: products.map((product) => ({ ...product })),
      };

      setOrders((current) => [newOrder, ...current]);
      setSelectedId(newOrder.id);
      setNotice("Purchase order created successfully.");
    }

    resetForm();
  };

  const handleEdit = (order) => {
    setEditingId(order.id);
    setSupplier(order.supplier);
    setPoNumber(order.id);
    setOrderDate(order.orderDate);
    setExpectedDate(order.expectedDate);

    setProducts(
      order.products?.map((product) => ({ ...product })) ||
        defaultProducts.map((product) => ({ ...product }))
    );

    setNotice("");
  };

  const handleCancel = (order) => {
    if (order.status === "Received") {
      setNotice("Received orders cannot be cancelled.");
      return;
    }

    if (order.status === "Cancelled") {
      setNotice("This order is already cancelled.");
      return;
    }

    setOrders((current) =>
      current.map((item) =>
        item.id === order.id
          ? { ...item, status: "Cancelled" }
          : item
      )
    );

    setNotice(`${order.id} cancelled.`);
  };

  const handleReceiveStock = () => {
    if (!selectedOrder) return;

    if (selectedOrder.status === "Cancelled") {
      setNotice("Cancelled orders cannot receive stock.");
      return;
    }

    if (selectedOrder.status === "Received") {
      setNotice("This order has already been received.");
      return;
    }

    setOrders((current) =>
      current.map((order) =>
        order.id === selectedId
          ? { ...order, status: "Received" }
          : order
      )
    );

    setNotice(`${selectedId} marked as received.`);
  };

  const updateProduct = (index, field, value) => {
    setProducts((current) =>
      current.map((product, i) =>
        i === index
          ? {
              ...product,
              [field]:
                field === "name" ? value : Math.max(0, Number(value) || 0),
            }
          : product
      )
    );
  };

  const handleViewOrder = (order) => {
    setSelectedId(order.id);

    setProducts(
      order.products?.map((product) => ({ ...product })) ||
        defaultProducts.map((product) => ({ ...product }))
    );

    setNotice("");
  };

  const displayDate = new Date().toLocaleDateString("en-CA");

  return (
    <div className="supplier-app purchase-app">
      {/* SIDEBAR */}
      <aside className="supplier-sidebar">
        <div className="brand">
          <img
            src={logo}
            alt="Smart POS Logo"
            className="brand-logo"
          />
        </div>

        <nav className="side-menu">
          {menuItems.map(([icon, label]) => {
            const active =
              label === "Purchase Orders"
                ? currentPage === "Purchase Orders"
                : pageMap[label] === currentPage;

            return (
              <button
                type="button"
                key={label}
                className={`side-link ${active ? "selected" : ""}`}
                onClick={() => handleNavigation(label)}
              >
                <span className="side-icon">{icon}</span>
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="supplier-main purchase-main">
        {/* TOP HEADER */}
        <header className="supplier-topbar purchase-topbar">
          <h1>Purchase Orders</h1>

          <div className="global-search purchase-global-search">
            <input
              aria-label="Search purchase orders"
              placeholder="Search anything ..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <span>⌕</span>
          </div>

          <div className="purchase-notification-wrap">
            <button
              type="button"
              className="notification"
              aria-label="Notifications"
              onClick={() =>
                setShowNotifications((current) => !current)
              }
            >
              ♟<span>{activeOrders}</span>
            </button>

            {showNotifications && (
              <div className="purchase-notification-popover">
                <strong>Notifications</strong>
                <p>
                  {activeOrders} purchase order(s) are waiting for
                  receiving.
                </p>
              </div>
            )}
          </div>

          <div className="date-display">
            <span>{displayDate.replaceAll("-", " / ")}</span>
            <span className="calendar-icon">▦</span>
          </div>
        </header>

        {/* PAGE MESSAGE */}
        {notice && (
          <div className="purchase-toast" role="status">
            <span>{notice}</span>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss message"
            >
              ×
            </button>
          </div>
        )}

        {/* PURCHASE ORDER WORKSPACE */}
        <div className="purchase-page">
          <div className="purchase-workspace">
            {/* LEFT COLUMN */}
            <div className="purchase-main-column">
              {/* CREATE PURCHASE ORDER */}
              <section className="purchase-form-card">
                <form onSubmit={handleSubmit}>
                  <div className="purchase-form-grid">
                    <div className="purchase-field">
                      <label htmlFor="po-supplier">Supplier</label>

                      <select
                        id="po-supplier"
                        value={supplier}
                        onChange={(event) =>
                          setSupplier(event.target.value)
                        }
                        required
                      >
                        <option value="Ceylon Wholesale Traders">
                          Ceylon Wholesale Traders
                        </option>
                        <option value="Lanka Beverages PLC">
                          Lanka Beverages PLC
                        </option>
                        <option value="Milo Foods Distributors">
                          Milo Foods Distributors
                        </option>
                        <option value="Colombo Suppliers">
                          Colombo Suppliers
                        </option>
                        <option value="Lanka Distributors">
                          Lanka Distributors
                        </option>
                      </select>
                    </div>

                    <div className="purchase-field">
                      <label htmlFor="po-number">PO Number</label>
                      <input
                        id="po-number"
                        value={poNumber}
                        onChange={(event) =>
                          setPoNumber(event.target.value)
                        }
                        disabled={Boolean(editingId)}
                        required
                      />
                    </div>

                    <div className="purchase-field">
                      <label htmlFor="po-order-date">Order Date</label>
                      <input
                        id="po-order-date"
                        type="date"
                        value={orderDate}
                        onChange={(event) =>
                          setOrderDate(event.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="purchase-field">
                      <label htmlFor="po-expected-date">
                        Expected Date
                      </label>
                      <input
                        id="po-expected-date"
                        type="date"
                        min={orderDate}
                        value={expectedDate}
                        onChange={(event) =>
                          setExpectedDate(event.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="purchase-form-actions">
                    {editingId && (
                      <button
                        type="button"
                        className="purchase-cancel-edit"
                        onClick={resetForm}
                      >
                        Cancel Edit
                      </button>
                    )}

                    <button
                      type="submit"
                      className="purchase-create-button"
                    >
                      {editingId ? "Update Order" : "Create Order"}
                    </button>
                  </div>
                </form>
              </section>

              {/* ORDERS TABLE */}
              <section className="purchase-table-card">
                <div className="purchase-table-scroll">
                  <table className="purchase-table">
                    <thead>
                      <tr>
                        <th>PO Number</th>
                        <th>Supplier</th>
                        <th>Total Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr
                          key={order.id}
                          className={
                            selectedId === order.id
                              ? "purchase-selected-row"
                              : ""
                          }
                          onClick={() => handleViewOrder(order)}
                        >
                          <td className="purchase-po-id">{order.id}</td>

                          <td className="purchase-supplier-cell">
                            {order.supplier}
                          </td>

                          <td className="purchase-amount">
                            {formatMoney(order.amount)}
                          </td>

                          <td>
                            <span
                              className={`purchase-status ${order.status.toLowerCase()}`}
                            >
                              {order.status}
                            </span>
                          </td>

                          <td>
                            <div
                              className="purchase-row-actions"
                              onClick={(event) =>
                                event.stopPropagation()
                              }
                            >
                              <button
                                type="button"
                                onClick={() => handleViewOrder(order)}
                              >
                                View
                              </button>

                              <span>|</span>

                              <button
                                type="button"
                                onClick={() => handleEdit(order)}
                              >
                                Edit
                              </button>

                              {order.status !== "Cancelled" &&
                                order.status !== "Received" && (
                                  <>
                                    <span>|</span>
                                    <button
                                      type="button"
                                      className="purchase-cancel-action"
                                      onClick={() =>
                                        handleCancel(order)
                                      }
                                    >
                                      Cancel
                                    </button>
                                  </>
                                )}
                            </div>
                          </td>
                        </tr>
                      ))}

                      {filteredOrders.length === 0 && (
                        <tr>
                          <td
                            colSpan="5"
                            className="purchase-empty"
                          >
                            No purchase orders found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {/* RIGHT ORDER DETAILS PANEL */}
            <aside className="purchase-details-card">
              {selectedOrder && (
                <>
                  <div className="purchase-details-heading">
                    <h2>Active {selectedOrder.id}</h2>
                    <p>{selectedOrder.supplier}</p>
                  </div>

                  <div className="purchase-products-heading">
                    <span>Products</span>
                    <span>Qty</span>
                  </div>

                  <div className="purchase-products-list">
                    {products.map((product, index) => (
                      <div
                        className="purchase-product"
                        key={`${product.name}-${index}`}
                      >
                        <div className="purchase-product-info">
                          <strong>{product.name}</strong>
                          <span>
                            {product.qty} Qty -{" "}
                            {formatMoney(product.price)}
                          </span>
                        </div>

                        <strong>
                          {formatMoney(product.qty * product.price)}
                        </strong>
                      </div>
                    ))}
                  </div>

                  <div className="purchase-totals">
                    <div>
                      <span>Subtotal</span>
                      <strong>{formatMoney(subtotal)}</strong>
                    </div>

                    <div>
                      <span>Tax (11.8%)</span>
                      <strong>{formatMoney(tax)}</strong>
                    </div>

                    <div className="purchase-grand-total">
                      <span>Grand Total</span>
                      <strong>
                        {formatMoney(
                          selectedOrder.amount || grandTotal
                        )}
                      </strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="purchase-receive-button"
                    onClick={handleReceiveStock}
                    disabled={
                      selectedOrder.status === "Received" ||
                      selectedOrder.status === "Cancelled"
                    }
                  >
                    {selectedOrder.status === "Received"
                      ? "Stock Received"
                      : selectedOrder.status === "Cancelled"
                        ? "Order Cancelled"
                        : "Receiving Stock"}
                  </button>

                  <div className="purchase-timeline">
                    <div className="purchase-timeline-item active">
                      <span className="purchase-timeline-dot" />
                      <div>
                        <strong>Order Updated</strong>
                        <p>{formatDate(selectedOrder.orderDate)}</p>
                      </div>
                    </div>

                    <div
                      className={`purchase-timeline-item ${
                        selectedOrder.status === "Received"
                          ? "active"
                          : ""
                      }`}
                    >
                      <span className="purchase-timeline-dot" />
                      <div>
                        <strong>
                          {selectedOrder.status === "Received"
                            ? "Stock Received"
                            : selectedOrder.status === "Cancelled"
                              ? "Order Cancelled"
                              : "Expected Delivery"}
                        </strong>
                        <p>{formatDate(selectedOrder.expectedDate)}</p>
                      </div>
                    </div>

                    <div className="purchase-timeline-item">
                      <span className="purchase-timeline-dot" />
                      <div>
                        <strong>Current Status</strong>
                        <p>{selectedOrder.status}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
