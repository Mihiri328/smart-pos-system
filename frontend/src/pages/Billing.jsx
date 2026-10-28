
import { useMemo, useState } from "react";
import logo from "../img/black logo.png";
import {
  ShoppingCart,
  LayoutDashboard,
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
  CalendarDays,
  Menu,
  X,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Plus,
  Minus,
  Printer,
} from "lucide-react";

import "./Billing.css";

const initialProducts = [
  { id: 1, name: "Samba Rice", sku: "PRD001", category: "Grains & Rice", unit: "Pack", price: 220, stock: 50 },
  { id: 2, name: "Kothmale Fresh Milk", sku: "PRD002", category: "Dairy Products", unit: "Bottle", price: 450, stock: 40 },
  { id: 3, name: "White Sugar", sku: "PRD003", category: "Grains & Rice", unit: "Kg", price: 280, stock: 100 },
  { id: 4, name: "Cooking Oil (1L)", sku: "PRD004", category: "Cooking Essentials", unit: "Bottle", price: 650, stock: 10 },
  { id: 5, name: "Tea Bags (200g)", sku: "PRD005", category: "Beverages", unit: "Pack", price: 550, stock: 200 },
  { id: 6, name: "Prima Noodles", sku: "PRD006", category: "Snacks", unit: "Pack", price: 120, stock: 0 },
  { id: 7, name: "Salt (400g)", sku: "PRD007", category: "Spices & Masala", unit: "Pack", price: 100, stock: 120 },
  { id: 8, name: "Surf Excel (500g)", sku: "PRD008", category: "Cleaning Items", unit: "Pack", price: 390, stock: 87 },
  { id: 9, name: "Marie Biscuits", sku: "PRD009", category: "Snacks", unit: "Pack", price: 150, stock: 75 },
  { id: 10, name: "Fresh Milk 500ml", sku: "PRD010", category: "Dairy Products", unit: "Bottle", price: 280, stock: 5 },
];

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, page: "dashboard" },
  { label: "POS Billing", icon: ShoppingCart, page: "billing" },
  { label: "Products Management", icon: Package, page: "products" },
  { label: "Inventory", icon: Warehouse, page: "inventory", count: 5 },
  { label: "Suppliers Management", icon: Truck, page: "suppliers" },
  { label: "Purchase Orders", icon: ClipboardList, page: "purchase-orders" },
  { label: "Customer Management", icon: Users, page: "customers" },
  { label: "Sales History", icon: History, page: "sales-history" },
  { label: "Reports", icon: ChartNoAxesCombined, page: "reports" },
  { label: "Settings", icon: Settings, page: "settings" },
];

const money = (amount) =>
  `Rs. ${Number(amount || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function Billing({ onNavigate, onLogout }) {
  const [products] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [amountPaid, setAmountPaid] = useState("");
  const [message, setMessage] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const categories = useMemo(
    () => ["All", ...new Set(products.map((product) => product.category))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query);

      const matchesCategory =
        category === "All" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    [cart]
  );

  const discountAmount = Math.min(
    subtotal,
    Math.max(0, Number(discount) || 0)
  );

  const total = subtotal - discountAmount;
  const paid = Math.max(0, Number(amountPaid) || 0);
  const balance = Math.max(0, paid - total);
  const amountDue = Math.max(0, total - paid);

  const cartUnits = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  function navigate(page) {
    setMobileMenu(false);
    setMessage("");

    if (page === "logout") {
      if (onLogout) {
        onLogout();
      } else {
        setMessage("Please connect Logout in App.jsx.");
      }
      return;
    }

    if (page === "billing") return;

    const supportedPages = [
      "dashboard",
      "products",
      "inventory",
      "suppliers",
    ];

    if (supportedPages.includes(page)) {
      if (onNavigate) {
        onNavigate(page);
      } else {
        setMessage("Please connect page navigation in App.jsx.");
      }
      return;
    }

    setMessage(
      `${page.replaceAll("-", " ")} page is not connected yet.`
    );
  }

  function addToCart(product) {
    setMessage("");
    setReceipt(null);

    const existing = cart.find(
      (item) => item.id === product.id
    );

    const currentQuantity = existing?.quantity || 0;

    if (product.stock === 0) {
      setMessage(`${product.name} is out of stock.`);
      return;
    }

    if (currentQuantity >= product.stock) {
      setMessage(
        `Only ${product.stock} units of ${product.name} are available.`
      );
      return;
    }

    if (existing) {
      setCart((current) =>
        current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart((current) => [
        ...current,
        { ...product, quantity: 1 },
      ]);
    }
  }

  function changeQuantity(productId, change) {
    setMessage("");
    setReceipt(null);

    setCart((current) =>
      current
        .map((item) => {
          if (item.id !== productId) return item;

          const nextQuantity = item.quantity + change;

          if (nextQuantity > item.stock) {
            setMessage(
              `Only ${item.stock} units of ${item.name} are available.`
            );
            return item;
          }

          return { ...item, quantity: nextQuantity };
        })
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(productId) {
    setCart((current) =>
      current.filter((item) => item.id !== productId)
    );

    setReceipt(null);
    setMessage("");
  }

  function clearCart() {
    setCart([]);
    setDiscount("0");
    setAmountPaid("");
    setMessage("");
    setReceipt(null);
  }

  function completeSale() {
    setMessage("");

    if (cart.length === 0) {
      setMessage("Please add at least one product.");
      return;
    }

    if (paid < total) {
      setMessage(
        `Insufficient payment. Please collect ${money(amountDue)} more.`
      );
      return;
    }

    const newReceipt = {
      invoiceNo: `INV-${Date.now().toString().slice(-8)}`,
      soldAt: new Date().toLocaleString(),
      items: cart.map((item) => ({ ...item })),
      subtotal,
      discount: discountAmount,
      total,
      amountPaid: paid,
      change: balance,
      paymentMethod,
    };

    setReceipt(newReceipt);
    setCart([]);
    setDiscount("0");
    setAmountPaid("");
    setMessage(
      "Demo sale completed. No database record was created."
    );
  }

  return (
    <div className="billing-app">
      <aside
        className={`billing-sidebar ${
          mobileMenu ? "billing-sidebar-open" : ""
        } no-print`}
      >
        <div className="billing-brand">
          <span className="brand-icon">
                <img src={logo} alt="Smart POS Logo" className="brand-logo" width={220}/>
                </span>

          <button
            className="billing-close-menu"
            type="button"
            onClick={() => setMobileMenu(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="billing-nav-label">MAIN MENU</div>

        <nav className="billing-nav">
          {navigation.map(({ label, icon: Icon, page, count }) => (
            <button
              type="button"
              key={page}
              className={`billing-nav-item ${
                page === "billing" ? "selected" : ""
              }`}
              onClick={() => navigate(page)}
            >
              <Icon size={18} strokeWidth={2} />
              <span>{label}</span>

              {count && (
                <span className="billing-nav-count">{count}</span>
              )}

              {page === "billing" && (
                <span className="billing-nav-active-dot" />
              )}
            </button>
          ))}
        </nav>

        <div className="billing-sidebar-bottom">
          <div className="billing-help-card">
            <strong>Need help?</strong>
            <p>
              Check your stock and sales insights to make better
              decisions.
            </p>
          </div>

          <button
            type="button"
            className="billing-nav-item billing-logout"
            onClick={() => navigate("logout")}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {mobileMenu && (
        <button
          type="button"
          className="billing-backdrop no-print"
          onClick={() => setMobileMenu(false)}
          aria-label="Close navigation"
        />
      )}

      <main className="billing-main">
        <header className="billing-topbar no-print">
          <button
            className="billing-mobile-menu"
            type="button"
            onClick={() => setMobileMenu(true)}
            aria-label="Open navigation"
          >
            <Menu size={21} />
          </button>

          <div className="billing-page-heading">
            <span>OVERVIEW</span>
            <h1>POS Billing</h1>
            <p>
              <CalendarDays size={14} />
              Create a sale and prepare a customer receipt
              <span className="billing-heading-dot">•</span>
              Store Owner Dashboard
            </p>
          </div>

          <div className="billing-header-right">
            <div className="billing-notification-wrap">
              <button
                type="button"
                className="billing-icon-button"
                onClick={() =>
                  setShowNotifications((current) => !current)
                }
                aria-label="Notifications"
              >
                <AlertCircle size={19} />
                <i>4</i>
              </button>

              {showNotifications && (
                <div className="billing-notification-pop">
                  <strong>Notifications</strong>
                  <p>3 products have critical stock.</p>
                  <p>5 products are expiring soon.</p>
                  <p>2 purchase orders pending.</p>
                </div>
              )}
            </div>

            <div className="billing-profile">
              <div className="billing-profile-avatar">O</div>
              <div>
                <strong>Owner</strong>
                <small>Store Owner</small>
              </div>
              <ChevronDown size={14} />
            </div>
          </div>
        </header>

        {message && (
          <div className="billing-message" role="status">
            <span>{message}</span>
            <button
              type="button"
              onClick={() => setMessage("")}
              aria-label="Dismiss message"
            >
              <X size={15} />
            </button>
          </div>
        )}

        <div className="billing-content">
          <div className="billing-page-title-row">
            <div>
              <h2>Point of Sale</h2>
              <p>
                Select products and complete the customer's bill.
              </p>
            </div>

            <div className="billing-date">
              <span>Today's Date</span>
              <strong>
                {new Date().toLocaleDateString("en-GB")}
              </strong>
            </div>
          </div>

          <div className="billing-layout">
            <section className="billing-products no-print">
              <div className="billing-section-heading">
                <div>
                  <h2>Products</h2>
                  <p>Select products to add them to the bill.</p>
                </div>

                <span className="billing-count-badge">
                  {filteredProducts.length} items
                </span>
              </div>

              <div className="billing-product-filters">
                <label className="billing-search-box">
                  <Search size={17} />
                  <input
                    type="search"
                    placeholder="Search product or SKU..."
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                  />
                </label>

                <select
                  aria-label="Filter by category"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item === "All" ? "All Categories" : item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="billing-product-grid">
                {filteredProducts.map((product) => {
                  const quantity =
                    cart.find((item) => item.id === product.id)
                      ?.quantity || 0;

                  return (
                    <article
                      className="billing-product-card"
                      key={product.id}
                    >
                      <div className="billing-product-card-top">
                        <span className="billing-product-icon">
                          {product.category === "Dairy Products"
                            ? "🥛"
                            : product.category === "Snacks"
                            ? "🍪"
                            : product.category === "Cleaning Items"
                            ? "🧴"
                            : "🛒"}
                        </span>

                        <span
                          className={`billing-stock-label ${
                            product.stock === 0
                              ? "out-of-stock"
                              : ""
                          }`}
                        >
                          {product.stock > 0
                            ? `${product.stock} in stock`
                            : "Out of stock"}
                        </span>
                      </div>

                      <h3>{product.name}</h3>
                      <p className="billing-product-sku">
                        {product.sku}
                      </p>
                      <p className="billing-product-category">
                        {product.category}
                      </p>

                      <div className="billing-product-card-bottom">
                        <div>
                          <strong>{money(product.price)}</strong>
                          <small> / {product.unit}</small>
                        </div>

                        <button
                          type="button"
                          className="billing-add-product-btn"
                          onClick={() => addToCart(product)}
                          disabled={
                            product.stock === 0 ||
                            quantity >= product.stock
                          }
                        >
                          <Plus size={14} />
                          Add
                        </button>
                      </div>
                    </article>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <div className="billing-empty-products">
                    No products found. Try another search.
                  </div>
                )}
              </div>
            </section>

            <aside className="billing-cart">
              <div className="billing-cart-heading">
                <div>
                  <h2>Current Bill</h2>
                  <p>{cartUnits} units</p>
                </div>

                <button
                  type="button"
                  className="billing-text-button no-print"
                  onClick={clearCart}
                  disabled={cart.length === 0}
                >
                  Clear
                </button>
              </div>

              <div className="billing-cart-items">
                {cart.length === 0 ? (
                  <div className="billing-empty-cart">
                    <span>🛍️</span>
                    <h3>Your cart is empty</h3>
                    <p>Add products from the product list.</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div className="billing-cart-item" key={item.id}>
                      <div className="billing-cart-item-info">
                        <strong>{item.name}</strong>
                        <span>{money(item.price)} each</span>

                        <div className="billing-quantity-controls no-print">
                          <button
                            type="button"
                            aria-label={`Decrease ${item.name}`}
                            onClick={() =>
                              changeQuantity(item.id, -1)
                            }
                          >
                            <Minus size={13} />
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            type="button"
                            aria-label={`Increase ${item.name}`}
                            onClick={() =>
                              changeQuantity(item.id, 1)
                            }
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <span className="billing-print-quantity">
                          Quantity: {item.quantity}
                        </span>
                      </div>

                      <div className="billing-cart-item-total">
                        <strong>
                          {money(item.price * item.quantity)}
                        </strong>

                        <button
                          type="button"
                          className="billing-remove-item no-print"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 size={13} />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="billing-calculation">
                <div className="billing-calculation-row">
                  <span>Subtotal</span>
                  <strong>{money(subtotal)}</strong>
                </div>

                <label className="billing-discount-field no-print">
                  <span>Discount (Rs.)</span>
                  <input
                    type="number"
                    min="0"
                    max={subtotal}
                    value={discount}
                    onChange={(event) => {
                      setDiscount(event.target.value);
                      setReceipt(null);
                    }}
                  />
                </label>

                <div className="billing-calculation-row">
                  <span>Discount</span>
                  <strong>- {money(discountAmount)}</strong>
                </div>

                <div className="billing-calculation-row billing-total-row">
                  <span>Total Amount</span>
                  <strong>{money(total)}</strong>
                </div>

                <label className="billing-payment-field no-print">
                  <span>Payment Method</span>
                  <select
                    value={paymentMethod}
                    onChange={(event) =>
                      setPaymentMethod(event.target.value)
                    }
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Online">Online Payment</option>
                  </select>
                </label>

                <label className="billing-payment-field no-print">
                  <span>Amount Paid (Rs.)</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Enter amount received"
                    value={amountPaid}
                    onChange={(event) =>
                      setAmountPaid(event.target.value)
                    }
                  />
                </label>

                <div className="billing-calculation-row">
                  <span>
                    {paid >= total ? "Change" : "Amount Due"}
                  </span>

                  <strong
                    className={
                      paid >= total
                        ? "billing-change-value"
                        : "billing-due-value"
                    }
                  >
                    {money(paid >= total ? balance : amountDue)}
                  </strong>
                </div>
              </div>

              <div className="billing-cart-actions no-print">
                <button
                  type="button"
                  className="billing-complete-sale-btn"
                  onClick={completeSale}
                >
                  <CheckCircle2 size={17} />
                  Complete Demo Sale
                </button>
              </div>

              <p className="billing-demo-notice no-print">
                Demo mode: sales are not saved to the database.
              </p>
            </aside>
          </div>

          {receipt && (
            <section className="billing-receipt-panel" id="receipt">
              <div className="billing-receipt-header">
                <div>
                  <h2>Sales Receipt</h2>
                  <p>Smart POS System</p>
                </div>
                <span className="billing-receipt-status">
                  Demo Receipt
                </span>
              </div>

              <div className="billing-receipt-meta">
                <p>
                  <strong>Invoice:</strong> {receipt.invoiceNo}
                </p>
                <p>
                  <strong>Date:</strong> {receipt.soldAt}
                </p>
                <p>
                  <strong>Payment:</strong> {receipt.paymentMethod}
                </p>
              </div>

              <div className="billing-receipt-table-wrap">
                <table className="billing-receipt-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipt.items.map((item) => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{money(item.price)}</td>
                        <td>
                          {money(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="billing-receipt-totals">
                <p>
                  Subtotal <strong>{money(receipt.subtotal)}</strong>
                </p>
                <p>
                  Discount <strong>{money(receipt.discount)}</strong>
                </p>
                <p>
                  Total <strong>{money(receipt.total)}</strong>
                </p>
                <p>
                  Paid <strong>{money(receipt.amountPaid)}</strong>
                </p>
                <p>
                  Change <strong>{money(receipt.change)}</strong>
                </p>
              </div>

              <div className="billing-receipt-actions no-print">
                <button
                  type="button"
                  onClick={() => window.print()}
                >
                  <Printer size={16} />
                  Print Receipt
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setReceipt(null);
                    setMessage("");
                  }}
                >
                  Close Receipt
                </button>
              </div>
            </section>
          )}
        </div>

        <footer className="billing-footer no-print">
          <span>© 2026 Smart POS · Food City Management</span>
          <span>Billing preview · Sample data</span>
        </footer>
      </main>
    </div>
  );
}
