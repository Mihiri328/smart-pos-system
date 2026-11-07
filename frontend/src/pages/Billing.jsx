import { useEffect, useMemo, useState } from "react";
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
    Bell,
    AlertTriangle,
    CheckCircle2,
    Trash2,
    Plus,
    Minus,
    Printer
} from "lucide-react";

import {
    getBillingItems,
    getBillingCategories,
    createBillingOrder
} from "../services/billingService";


// ======================================
// PRODUCT IMAGES
// Images are located in src/images
// ======================================

const productImages = import.meta.glob("../img/*", {
    eager: true,
    query: "?url",
    import: "default"
});

const resolveProductImage = (imagePath) => {

    if (!imagePath) {
        return "";
    }

    if (/^(https?:|data:|blob:)/i.test(imagePath)) {
        return imagePath;
    }

    const fileName = String(imagePath)
        .replace(/\\/g, "/")
        .split("/")
        .pop();

    const matchedImage = Object.entries(productImages).find(
        ([path]) =>
            path.split("/").pop().toLowerCase() ===
            fileName.toLowerCase()
    );

    return matchedImage ? matchedImage[1] : "";
};


// ======================================
// NAVIGATION
// ======================================

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
    { label: "Settings", icon: Settings, page: "settings" }
];


// ======================================
// COMMON FUNCTIONS
// ======================================

const money = (amount) =>
    `Rs. ${Number(amount || 0).toLocaleString("en-LK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;


const mapProduct = (row) => ({
    id: Number(row.item_id ?? row.id),
    name: row.item_name ?? row.name ?? "",
    sku: row.item_code ?? row.sku ?? `ITEM-${row.item_id ?? row.id}`,
    category: row.category || "Uncategorized",
    unit: row.unit || "Unit",
    price: Number(row.unit_price ?? row.price ?? 0),
    stock: Number(row.quantity ?? row.stock ?? 0),
    image: resolveProductImage(row.image_path ?? row.image)
});


// ======================================
// BILLING COMPONENT
// ======================================

export default function Billing({ onNavigate, onLogout }) {

    // ----------------------------------
    // STATES
    // ----------------------------------

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState(["All"]);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");

    const [cart, setCart] = useState([]);

    const [discount, setDiscount] = useState("0");
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [amountPaid, setAmountPaid] = useState("");

    const [message, setMessage] = useState("");
    const [receipt, setReceipt] = useState(null);

    const [loadingProducts, setLoadingProducts] = useState(true);
    const [submittingOrder, setSubmittingOrder] = useState(false);

    const [mobileMenu, setMobileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);


    // ----------------------------------
    // LOAD CATEGORIES
    // ----------------------------------

    useEffect(() => {

        const controller = new AbortController();

        const loadCategories = async () => {

            try {

                const result = await getBillingCategories({
                    signal: controller.signal
                });

                const categoryList = Array.isArray(result.categories)
                    ? result.categories
                    : [];

                setCategories([
                    "All",
                    ...categoryList.filter(Boolean)
                ]);

            } catch (error) {

                if (error.name !== "AbortError") {
                    setMessage(error.message);
                }
            }
        };

        loadCategories();

        return () => controller.abort();

    }, []);


    // ----------------------------------
    // LOAD PRODUCTS
    // Backend handles search and filtering
    // ----------------------------------

    useEffect(() => {

        const controller = new AbortController();

        const timer = setTimeout(async () => {

            try {

                setLoadingProducts(true);

                const result = await getBillingItems({
                    search,
                    category,
                    signal: controller.signal
                });

                const rows = Array.isArray(result.items)
                    ? result.items
                    : [];

                setProducts(rows.map(mapProduct));

            } catch (error) {

                if (error.name !== "AbortError") {
                    setMessage(error.message || "Unable to load products.");
                }

            } finally {

                if (!controller.signal.aborted) {
                    setLoadingProducts(false);
                }
            }

        }, 300);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };

    }, [search, category]);


    // ----------------------------------
    // FILTERED PRODUCTS
    // Backend already filters these records
    // ----------------------------------

    const filteredProducts = products;


    // ----------------------------------
    // CART CALCULATIONS
    // ----------------------------------

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


    // ----------------------------------
    // NAVIGATION
    // ----------------------------------

    function navigate(page) {

        setMobileMenu(false);
        setMessage("");

        if (page === "billing") {
            return;
        }

        if (onNavigate) {
            onNavigate(page);
        } else {
            setMessage(
                `${page.replaceAll("-", " ")} page is not connected yet.`
            );
        }
    }


    // ----------------------------------
    // LOGOUT
    // ----------------------------------

    function handleLogout() {

        setMobileMenu(false);

        if (onLogout) {
            onLogout();
        } else if (onNavigate) {
            onNavigate("login");
        }
    }


    // ----------------------------------
    // ADD PRODUCT TO CART
    // ----------------------------------

    function addToCart(product) {

        setMessage("");
        setReceipt(null);

        const existing = cart.find(
            (item) => item.id === product.id
        );

        const currentQuantity = existing?.quantity || 0;

        if (product.stock <= 0) {
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
                        ? {
                            ...item,
                            quantity: item.quantity + 1
                        }
                        : item
                )
            );

        } else {

            setCart((current) => [
                ...current,
                {
                    ...product,
                    quantity: 1
                }
            ]);
        }
    }


    // ----------------------------------
    // CHANGE CART QUANTITY
    // ----------------------------------

    function changeQuantity(productId, change) {

        setMessage("");
        setReceipt(null);

        setCart((current) =>
            current
                .map((item) => {

                    if (item.id !== productId) {
                        return item;
                    }

                    const nextQuantity = item.quantity + change;

                    if (nextQuantity > item.stock) {

                        setMessage(
                            `Only ${item.stock} units of ${item.name} are available.`
                        );

                        return item;
                    }

                    return {
                        ...item,
                        quantity: nextQuantity
                    };
                })
                .filter((item) => item.quantity > 0)
        );
    }


    // ----------------------------------
    // REMOVE CART ITEM
    // ----------------------------------

    function removeItem(productId) {

        setCart((current) =>
            current.filter((item) => item.id !== productId)
        );

        setReceipt(null);
        setMessage("");
    }


    // ----------------------------------
    // CLEAR CART
    // ----------------------------------

    function clearCart() {

        setCart([]);
        setDiscount("0");
        setAmountPaid("");
        setMessage("");
        setReceipt(null);
    }


    // ----------------------------------
    // REFRESH PRODUCTS
    // ----------------------------------

    async function refreshProducts() {

        const result = await getBillingItems({
            search,
            category
        });

        const rows = Array.isArray(result.items)
            ? result.items
            : [];

        setProducts(rows.map(mapProduct));
    }


    // ----------------------------------
    // COMPLETE ORDER
    // ----------------------------------

    async function completeSale() {

        setMessage("");

        if (submittingOrder) {
            return;
        }

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

        const orderData = {
            discount: discountAmount,
            payment_method: paymentMethod,
            amount_paid: paid,

            items: cart.map((item) => ({
                item_id: item.id,
                quantity: item.quantity
            }))
        };

        try {

            setSubmittingOrder(true);

            // Save order through backend service
            const result = await createBillingOrder(orderData);

            const savedOrder = result.order || result.data || result;

            // Prepare receipt using the successful API response
            const newReceipt = {
                invoiceNo:
                    savedOrder.order_no ||
                    savedOrder.orderNo ||
                    savedOrder.invoice_no ||
                    "Order completed",

                soldAt: savedOrder.created_at
                    ? new Date(savedOrder.created_at).toLocaleString()
                    : new Date().toLocaleString(),

                items: cart.map((item) => ({
                    ...item
                })),

                subtotal,
                discount: discountAmount,
                total,
                amountPaid: paid,
                change: balance,
                paymentMethod
            };

            setReceipt(newReceipt);

            setCart([]);
            setDiscount("0");
            setAmountPaid("");

            setMessage(
                result.message || "Order completed successfully."
            );

            // Reload products to get updated stock
            await refreshProducts();

        } catch (error) {

            setMessage(
                error.message || "Unable to complete the order."
            );

        } finally {

            setSubmittingOrder(false);
        }
    }


    // ==================================
    // JSX
    // ==================================

    return (

        <div className="billing-app sp-dashboard">

            {/* SIDEBAR */}

            <aside
                className={`sp-sidebar ${
                    mobileMenu ? "sp-sidebar-open" : ""
                } no-print`}
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

                <div className="sp-nav-label">
                    MAIN MENU
                </div>

                <nav className="sp-nav">

                    {navigation.map(
                        ({ label, icon: Icon, page, count }) => (

                            <button
                                type="button"
                                key={page}
                                className={`sp-nav-item ${
                                    page === "billing" ? "selected" : ""
                                }`}
                                onClick={() => navigate(page)}
                            >

                                <Icon size={18} />

                                <span>{label}</span>

                                {count && (
                                    <span className="sp-nav-count">
                                        {count}
                                    </span>
                                )}

                            </button>
                        )
                    )}

                </nav>

                <div className="sp-sidebar-bottom">

                    <div className="sp-help-card">
                        <strong>Need help?</strong>

                        <p>
                            Check your stock and sales insights to make
                            better decisions.
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


            {/* MOBILE BACKDROP */}

            {mobileMenu && (

                <button
                    type="button"
                    className="sp-backdrop no-print"
                    onClick={() => setMobileMenu(false)}
                    aria-label="Close navigation"
                />

            )}


            {/* MAIN CONTENT */}

            <main className="billing-main">

                {/* HEADER */}

                <header className="billing-topbar no-print">

                    <button
                        className="billing-mobile-menu"
                        type="button"
                        onClick={() => setMobileMenu(true)}
                        aria-label="Open navigation"
                    >
                        <Menu size={21} />
                    </button>

                    <div className="sp-page-heading sh-heading">

                        <h1>POS Billing</h1>

                        <p>

                            <CalendarDays size={14} />

                            {new Date().toLocaleDateString("en-GB", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                            })}

                            <span className="billing-heading-dot"></span>

                        </p>

                    </div>

                    <div className="billing-header-right">

                        <div className="sp-notification-wrap">

                            <button
                                type="button"
                                className="sp-icon-button"
                                onClick={() =>
                                    setShowNotifications((current) => !current)
                                }
                                aria-label="Notifications"
                            >
                                <Bell size={19} />
                                <i>4</i>
                            </button>

                            {showNotifications && (

                                <div className="sp-notification-pop">

                                    <strong>Notifications</strong>

                                    <p>
                                        <AlertTriangle size={14} />
                                        3 products have critical stock.
                                    </p>

                                    <p>
                                        <CalendarDays size={14} />
                                        5 products are expiring soon.
                                    </p>

                                    <p>
                                        <ClipboardList size={14} />
                                        2 purchase orders pending.
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


                


                <div className="billing-content">

                    {/* PAGE HEADING */}

                    <div className="billing-page-title-row">

                        <div>
                            <h4>Point of Sale</h4>

                            <p>
                                Select products and complete the customer's bill.
                            </p>
                        </div>

                    </div>


                    <div className="billing-layout">


                        {/* ==================================
                            PRODUCTS SECTION
                        ================================== */}

                        <section className="billing-products no-print">

                            <div className="billing-section-heading">

                                <div>
                                    <h2>Products</h2>

                                    <p>
                                        Select products to add them to the bill.
                                    </p>
                                </div>

                                <span className="billing-count-badge">
                                    {filteredProducts.length} items
                                </span>

                            </div>


                            {/* SEARCH AND CATEGORY */}

                            <div className="billing-product-filters">

                                <label className="billing-search-box">

                                    <Search size={17} />

                                    <input
                                        type="search"
                                        placeholder="Search Items..."
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

                                            {item === "All"
                                                ? "All Categories"
                                                : item}

                                        </option>
                                    ))}

                                </select>

                            </div>


                            {/* PRODUCT CARDS */}

                            <div className="billing-product-grid">

                                {loadingProducts ? (

                                    <div className="billing-empty-products">
                                        Loading products...
                                    </div>

                                ) : filteredProducts.length === 0 ? (

                                    <div className="billing-empty-products">
                                        No products found.
                                    </div>

                                ) : (

                                    filteredProducts.map((product) => {

                                        const quantity =
                                            cart.find(
                                                (item) => item.id === product.id
                                            )?.quantity || 0;

                                        return (

                                            <article
                                                className="billing-product-card"
                                                key={product.id}
                                            >

                                                <div className="billing-product-card-top">

                                                    <div className="billing-product-image-wrap">

                                                        {product.image ? (

                                                            <img
                                                                src={product.image}
                                                                alt={product.name}
                                                                className="billing-product-image"
                                                                loading="lazy"
                                                            />

                                                        ) : (

                                                            <div className="billing-product-image-placeholder">
                                                                No Image
                                                            </div>

                                                        )}

                                                    </div>


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

                                                        <strong>
                                                            {money(product.price)}
                                                        </strong>

                                                        <small>
                                                            / {product.unit}
                                                        </small>

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
                                    })
                                )}

                            </div>

                        </section>



                        {/* ==================================
                            CURRENT BILL
                        ================================== */}

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


                            {/* CART ITEMS */}

                            <div className="billing-cart-items">

                                {cart.length === 0 ? (

                                    <div className="billing-empty-cart">

                                        <span>🛍️</span>

                                        <h3>Your cart is empty</h3>

                                        <p>
                                            Add products from the product list.
                                        </p>

                                    </div>

                                ) : (

                                    cart.map((item) => (

                                        <div
                                            className="billing-cart-item"
                                            key={item.id}
                                        >

                                            <div className="billing-cart-item-info">

                                                <strong>{item.name}</strong>

                                                <span>
                                                    {money(item.price)} each
                                                </span>


                                                <div className="billing-quantity-controls no-print">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            changeQuantity(item.id, -1)
                                                        }
                                                    >
                                                        <Minus size={13} />
                                                    </button>

                                                    <span>{item.quantity}</span>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            changeQuantity(item.id, 1)
                                                        }
                                                        disabled={
                                                            item.quantity >= item.stock
                                                        }
                                                    >
                                                        <Plus size={13} />
                                                    </button>

                                                </div>

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



                            {/* BILL CALCULATION */}

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

                                    <strong>
                                        - {money(discountAmount)}
                                    </strong>

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

                                        <option value="Online">
                                            Online Payment
                                        </option>

                                    </select>

                                </label>


                                <label className="billing-payment-field no-print">

                                    <span>Amount Paid (Rs.)</span>

                                    <input
                                        type="number"
                                        min="0"
                                        value={amountPaid}
                                        onChange={(event) =>
                                            setAmountPaid(event.target.value)
                                        }
                                        placeholder="Enter received amount"
                                    />

                                </label>


                                <div className="billing-calculation-row billing-total-row">

                                    <span>Total Amount</span>

                                    <strong>{money(total)}</strong>

                                </div>


                                {paid > 0 && (

                                    <div className="billing-calculation-row">

                                        <span>
                                            {paid >= total ? "Change" : "Amount Due"}
                                        </span>

                                        <strong>
                                            {money(paid >= total ? balance : amountDue)}
                                        </strong>

                                    </div>

                                )}

                            </div>



                            {/* COMPLETE ORDER */}

                            <div className="billing-cart-actions no-print">

                                <button
                                    type="button"
                                    className="billing-complete-sale-btn"
                                    onClick={completeSale}
                                    disabled={
                                        submittingOrder ||
                                        cart.length === 0
                                    }
                                >

                                    <CheckCircle2 size={17} />

                                    {submittingOrder
                                        ? "Processing..."
                                        : "Complete Order"}

                                </button>
                                {/* MESSAGE */}

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

                            </div>

                        </aside>

                    </div>



                    {/* ==================================
                        RECEIPT
                    ================================== */}

                    {receipt && (

                        <section
                            className="billing-receipt-panel"
                            id="receipt"
                        >

                            <div className="billing-receipt-header">

                                <div>
                                    <h2>Sales Receipt</h2>
                                    <p>Smart POS System</p>
                                </div>

                                <span className="billing-receipt-status">
                                    Completed Order
                                </span>

                            </div>


                            <div className="billing-receipt-meta">

                                <p>
                                    <strong>Invoice:</strong>
                                    {" "}
                                    {receipt.invoiceNo}
                                </p>

                                <p>
                                    <strong>Date:</strong>
                                    {" "}
                                    {receipt.soldAt}
                                </p>

                                <p>
                                    <strong>Payment:</strong>
                                    {" "}
                                    {receipt.paymentMethod}
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
                                    Subtotal
                                    <strong>{money(receipt.subtotal)}</strong>
                                </p>

                                <p>
                                    Discount
                                    <strong>{money(receipt.discount)}</strong>
                                </p>

                                <p>
                                    Total
                                    <strong>{money(receipt.total)}</strong>
                                </p>

                                <p>
                                    Paid
                                    <strong>{money(receipt.amountPaid)}</strong>
                                </p>

                                <p>
                                    Change
                                    <strong>{money(receipt.change)}</strong>
                                </p>

                            </div>


                            <div className="billing-receipt-actions no-print">

                              {/* Billing page pdf */}
                                <button
                                    type="button"
                                    onClick={() => window.print()}
                                >
                                    <Printer size={16} />
                                    Print Receipt
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setReceipt(null)}
                                >
                                    Close Receipt
                                </button>

                            </div>

                        </section>

                    )}

                </div>


                <footer className="billing-footer no-print">
                    <span>
                        © Smart POS · FoodCity Smart POS System
                    </span>
                </footer>

            </main>

        </div>
    );
}