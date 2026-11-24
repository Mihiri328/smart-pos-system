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
    Bell,
    CalendarDays,
    AlertTriangle,
    ArrowUpRight,
    CircleDollarSign,
    CreditCard,
    Banknote,
    QrCode,
    Menu,
    X
} from "lucide-react";

import {
    getDashboard,
    getSalesPerformance,
    markPurchaseOrderReceived
} from "../services/dashboardService";


// ==============================
// HELPER FUNCTIONS
// ==============================

const money = (n) =>
    `Rs. ${Number(n || 0).toLocaleString("en-LK", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;


const shortDate = (value) => {
    if (!value) return "-";

    const date =
        typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
            ? new Date(`${value}T00:00:00`)
            : new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("en-GB");
};


// ==============================
// DASHBOARD COMPONENT
// ==============================

export default function Dashboard({ onNavigate, onLogout }) {

    // ==============================
    // STATES
    // ==============================

    const [period, setPeriod] = useState("Weekly");
    const [search, setSearch] = useState("");
    const [showNotifications, setShowNotifications] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);

    const [dashboardData, setDashboardData] = useState({
        summary: {
            todaySales: 0,
            monthlyRevenue: 0,
            totalOrders: 0,
            monthlyProfit: 0
        },
        lowStock: [],
        expiringProducts: [],
        paymentBreakdown: [],
        purchaseOrders: []
    });

    const [salesChart, setSalesChart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartLoading, setChartLoading] = useState(false);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [receivingOrderId, setReceivingOrderId] = useState(null);


    // ==============================
    // NAVIGATION ITEMS
    // ==============================

    const navItems = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            page: "dashboard"
        },
        {
            label: "POS Billing",
            icon: ShoppingCart,
            page: "billing"
        },
        {
            label: "Products Management",
            icon: Package,
            page: "products"
        },
        {
            label: "Inventory",
            icon: Warehouse,
            page: "inventory",
            count: dashboardData.lowStock.length
        },
        {
            label: "Suppliers Management",
            icon: Truck,
            page: "suppliers"
        },
        {
            label: "Purchase Orders",
            icon: ClipboardList,
            page: "purchase_orders"
        },
        {
            label: "Customer Management",
            icon: Users,
            page: "customers"
        },
        {
            label: "Sales History",
            icon: History,
            page: "sales_history"
        },
        {
            label: "Reports",
            icon: ChartNoAxesCombined,
            page: "reports"
        },
        {
            label: "Settings",
            icon: Settings,
            page: "settings"
        }
    ];


    // ==============================
    // LOAD DASHBOARD DATA
    // ==============================

    async function loadDashboard() {
        try {
            setLoading(true);
            setError("");

            const data = await getDashboard();

            setDashboardData({
                summary: {
                    todaySales: data.summary?.todaySales || 0,
                    monthlyRevenue: data.summary?.monthlyRevenue || 0,
                    totalOrders: data.summary?.totalOrders || 0,
                    monthlyProfit: data.summary?.monthlyProfit || 0
                },

                lowStock: data.lowStock || [],
                expiringProducts: data.expiringProducts || [],
                paymentBreakdown: data.paymentBreakdown || [],
                purchaseOrders: data.purchaseOrders || []
            });

        } catch (error) {
            console.error("Dashboard loading error:", error);
            setError(error.message || "Failed to load dashboard.");

        } finally {
            setLoading(false);
        }
    }


    // ==============================
    // LOAD SALES PERFORMANCE
    // ==============================

    async function loadSalesChart() {
        try {
            setChartLoading(true);

            const data = await getSalesPerformance(period);

            setSalesChart(data || []);

        } catch (error) {
            console.error("Sales chart error:", error);
            setSalesChart([]);

        } finally {
            setChartLoading(false);
        }
    }


    // ==============================
    // INITIAL API CALL
    // ==============================

    useEffect(() => {
        loadDashboard();
    }, []);


    // ==============================
    // SALES CHART API CALL
    // ==============================

    useEffect(() => {
        loadSalesChart();
    }, [period]);


    // ==============================
    // NAVIGATION
    // ==============================

    function chooseNav(pageKey) {
        setMobileMenu(false);
        setNotice("");

        if (pageKey === "dashboard") return;

        if (onNavigate) {
            onNavigate(pageKey);
        } else {
            setNotice(`${pageKey} page is not connected yet.`);
        }
    }


    // ==============================
    // LOGOUT
    // ==============================

    function handleLogout() {
        setMobileMenu(false);

        if (onLogout) {
            onLogout();
        } else if (onNavigate) {
            onNavigate("login");
        }
    }


    // ==============================
    // PAYMENT CALCULATIONS
    // ==============================

    const paymentTotal = dashboardData.paymentBreakdown.reduce(
        (total, payment) => total + Number(payment.total || 0),
        0
    );


    function getPaymentAmount(method) {
        const payment = dashboardData.paymentBreakdown.find(
            (p) => p.payment_method === method
        );

        return Number(payment?.total || 0);
    }

    function getPaymentBillCount(method) {
    const payment = dashboardData.paymentBreakdown.find(
        (p) => p.payment_method === method
    );

    return Number(payment?.bill_count || 0);
}


    // ==============================
    // SALES CHART CALCULATIONS
    // ==============================

    const chartPoints = useMemo(() => {
        if (!salesChart.length) return [];

        const width = 502;
        const height = 142;

        const maxValue = Math.max(
            ...salesChart.map((item) => Number(item.amount || 0)),
            1
        );

        return salesChart.map((item, index) => ({
            x: salesChart.length === 1
                ? width / 2
                : 8 + (index / (salesChart.length - 1)) * width,

            y: height - (
                Number(item.amount || 0) / maxValue
            ) * height,

            label: shortDate(item.sale_date),
            amount: Number(item.amount || 0)
        }));

    }, [salesChart]);


    const chartPolyline = chartPoints
        .map((point) => `${point.x},${point.y}`)
        .join(" ");


    const chartArea = chartPoints.length > 0
        ? `M ${chartPoints[0].x} 180 L ${
            chartPoints.map((point) => `${point.x} ${point.y}`).join(" L ")
        } L ${chartPoints[chartPoints.length - 1].x} 180 Z`
        : "";


    const chartTotal = salesChart.reduce(
        (total, item) => total + Number(item.amount || 0),
        0
    );


    // ==============================
    // PURCHASE ORDER RECEIVING
    // ==============================

    async function markOrderReceived(id) {
        try {
            setReceivingOrderId(id);

            await markPurchaseOrderReceived(id);

            setNotice("Purchase order received successfully.");

            await loadDashboard();

        } catch (error) {
            console.error("Purchase order error:", error);

            setNotice(
                error.message || "Failed to receive purchase order."
            );

        } finally {
            setReceivingOrderId(null);
        }
    }


    // ==============================
    // NOTIFICATION COUNTS
    // ==============================

    const lowStockCount = dashboardData.lowStock.length;
    const expiringCount = dashboardData.expiringProducts.length;

    const pendingOrdersCount = dashboardData.purchaseOrders.filter(
        (order) => order.status === "Pending"
    ).length;


    // ==============================
    // RENDER
    // ==============================

    return (
        <div className="sp-dashboard">

            {/* ================================= */}
            {/* SIDEBAR */}
            {/* ================================= */}

            <aside className={`sp-sidebar ${
                mobileMenu ? "sp-sidebar-open" : ""
            }`}>

                <div className="sp-brand">
                    <img
                        src={logo}
                        alt="Smart POS Logo"
                        className="brand-logo"
                    />

                    <button
                        className="sp-close-menu"
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
                    {navItems.map(({ label, icon: Icon, page, count }) => (
                        <button
                            key={page}
                            className={`sp-nav-item ${
                                page === "dashboard" ? "selected" : ""
                            }`}
                            onClick={() => chooseNav(page)}
                        >
                            <Icon size={18} />

                            <span>{label}</span>

                            {count > 0 && (
                                <span className="sp-nav-count">
                                    {count}
                                </span>
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
                    className="sp-backdrop"
                    onClick={() => setMobileMenu(false)}
                    aria-label="Close navigation"
                />
            )}


            {/* ================================= */}
            {/* MAIN CONTENT */}
            {/* ================================= */}

            <main className="sp-main">

                {/* ================================= */}
                {/* TOPBAR */}
                {/* ================================= */}

                <header className="sp-topbar">

                    <button
                        className="sp-mobile-menu"
                        onClick={() => setMobileMenu(true)}
                        aria-label="Open menu"
                    >
                        <Menu size={21} />
                    </button>

                    <div className="sp-page-heading sh-heading">
                        <h1>Welcome back, Owner!</h1>

                        <p>
                            <CalendarDays size={14} />

                            {new Date().toLocaleDateString("en-GB", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric"
                            })}

                            <span className="billing-heading-dot">
                                .
                            </span>

                            Store Owner Dashboard
                        </p>
                    </div>

                    <div className="sp-top-actions">

                        {/* SEARCH */}

                        <label className="sp-search">
                            <Search size={17} />

                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search..."
                            />
                        </label>


                        {/* NOTIFICATIONS */}

                        <div className="sp-notification-wrap">

                            <button
                                className="sp-icon-button"
                                onClick={() => setShowNotifications((v) => !v)}
                                aria-label="Notifications"
                            >
                                <Bell size={19} />

                                {(lowStockCount + expiringCount + pendingOrdersCount) > 0 && (
                                    <i>
                                        {lowStockCount + expiringCount + pendingOrdersCount}
                                    </i>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="sp-notification-pop">
                                    <strong>Notifications</strong>

                                    <p>
                                        <AlertTriangle size={14} />
                                        {lowStockCount} products have low stock.
                                    </p>

                                    <p>
                                        <CalendarDays size={14} />
                                        {expiringCount} products are expiring soon.
                                    </p>

                                    <p>
                                        <ClipboardList size={14} />
                                        {pendingOrdersCount} purchase orders pending.
                                    </p>
                                </div>
                            )}

                        </div>


                        {/* PROFILE */}

                        <div className="sp-profile">
                            <div className="sp-avatar">
                                O
                            </div>

                            <div>
                                <strong>Owner</strong>
                                <small>Store Owner</small>
                            </div>
                        </div>

                    </div>

                </header>


                {/* ================================= */}
                {/* NOTICE */}
                {/* ================================= */}

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


                {/* ================================= */}
                {/* LOADING */}
                {/* ================================= */}

                {loading && (
                    <div className="sp-notice">
                        Loading dashboard information...
                    </div>
                )}


                {/* ================================= */}
                {/* ERROR */}
                {/* ================================= */}

                {error && (
                    <div className="sp-notice">
                        <span>{error}</span>

                        <button onClick={loadDashboard}>
                            Retry
                        </button>
                    </div>
                )}


                {/* ================================= */}
                {/* DASHBOARD DATA */}
                {/* ================================= */}

                {!loading && !error && (
                    <>

                        {/* ================================= */}
                        {/* KPI CARDS */}
                        {/* ================================= */}

                        <section className="sp-kpi-grid">

                            <article className="sp-kpi">
                                <div className="sp-kpi-icon blue">
                                    <ChartNoAxesCombined size={21} />
                                </div>

                                <div>
                                    <span>Today's Sales</span>

                                    <strong>
                                        {money(dashboardData.summary.todaySales)}
                                    </strong>

                                    <small className="sp-muted">
                                        Today's completed sales
                                    </small>
                                </div>
                            </article>


                            <article className="sp-kpi">
                                <div className="sp-kpi-icon green">
                                    <CircleDollarSign size={21} />
                                </div>

                                <div>
                                    <span>Monthly Revenue</span>

                                    <strong>
                                        {money(dashboardData.summary.monthlyRevenue)}
                                    </strong>

                                    <small className="sp-muted">
                                        Current month revenue
                                    </small>
                                </div>
                            </article>


                            <article className="sp-kpi">
                                <div className="sp-kpi-icon orange">
                                    <ShoppingCart size={21} />
                                </div>

                                <div>
                                    <span>Total Orders</span>

                                    <strong>
                                        {dashboardData.summary.totalOrders}
                                    </strong>

                                    <small className="sp-muted">
                                        Today's transactions
                                    </small>
                                </div>
                            </article>


                            <article className="sp-kpi">
                                <div className="sp-kpi-icon purple">
                                    <CircleDollarSign size={21} />
                                </div>

                                <div>
                                    <span>Profit (This Month)</span>

                                    <strong>
                                        {money(dashboardData.summary.monthlyProfit)}
                                    </strong>

                                    <small className="sp-muted">
                                        Estimated gross profit
                                    </small>
                                </div>
                            </article>

                        </section>


                        {/* ================================= */}
                        {/* PRIMARY GRID */}
                        {/* ================================= */}

                        <section className="sp-primary-grid">

                            {/* SALES PERFORMANCE */}

                            <article className="sp-panel sp-sales-panel">

                                <div className="sp-panel-head">
                                    <div>
                                        <h2>Sales Performance</h2>

                                        <p>
                                            Track your store's sales trends
                                        </p>
                                    </div>

                                    <select
                                        value={period}
                                        onChange={(e) => setPeriod(e.target.value)}
                                        aria-label="Sales period"
                                    >
                                        <option>Weekly</option>
                                        <option>Daily</option>
                                    </select>
                                </div>


                                <div className="sp-chart-summary">
                                    <strong>
                                        {money(chartTotal)}
                                    </strong>

                                    <span className="sp-positive">
                                        Sales total

                                        <small>
                                            {period.toLowerCase()}
                                        </small>
                                    </span>
                                </div>


                                <div className="sp-chart">

                                    <div className="sp-y-labels">
                                        <span>100%</span>
                                        <span>75%</span>
                                        <span>50%</span>
                                        <span>25%</span>
                                        <span>0</span>
                                    </div>

                                    <svg
                                        viewBox="0 0 520 205"
                                        role="img"
                                        aria-label="Sales performance chart"
                                        preserveAspectRatio="none"
                                    >
                                        <defs>
                                            <linearGradient
                                                id="spArea"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor="#4f6fff"
                                                    stopOpacity=".25"
                                                />

                                                <stop
                                                    offset="100%"
                                                    stopColor="#4f6fff"
                                                    stopOpacity=".015"
                                                />
                                            </linearGradient>
                                        </defs>

                                        {[20, 60, 100, 140, 180].map((y) => (
                                            <line
                                                key={y}
                                                x1="0"
                                                y1={y}
                                                x2="520"
                                                y2={y}
                                                stroke="#e9edf5"
                                                strokeDasharray="4 5"
                                            />
                                        ))}

                                        {chartPoints.length > 0 && (
                                            <>
                                                <path
                                                    d={chartArea}
                                                    fill="url(#spArea)"
                                                />

                                                <polyline
                                                    points={chartPolyline}
                                                    fill="none"
                                                    stroke="#4f6fff"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />

                                                {chartPoints.map((point, index) => (
                                                    <circle
                                                        key={index}
                                                        cx={point.x}
                                                        cy={point.y}
                                                        r="4.5"
                                                        fill="#fff"
                                                        stroke="#4f6fff"
                                                        strokeWidth="2.5"
                                                    />
                                                ))}
                                            </>
                                        )}

                                    </svg>

                                    <div className="sp-x-labels">
                                        {chartPoints.map((point, index) => (
                                            <span key={index}>
                                                {point.label}
                                            </span>
                                        ))}
                                    </div>

                                    {chartLoading && (
                                        <small>Loading sales chart...</small>
                                    )}

                                    {!chartLoading && chartPoints.length === 0 && (
                                        <div className="sp-empty">
                                            No sales data available.
                                        </div>
                                    )}

                                </div>

                            </article>


                            {/* LOW STOCK ALERT */}

                            <article className="sp-panel sp-stock-panel">

                                <div className="sp-panel-head">
                                    <div>
                                        <h2>Low Stock Alert</h2>

                                        <p>
                                            Restock these items soon
                                        </p>
                                    </div>

                                    <span className="sp-counter danger">
                                        {dashboardData.lowStock.length} items
                                    </span>
                                </div>


                                <div className="sp-compact-list">

                                    {dashboardData.lowStock.map((item) => (
                                        <div
                                            className="sp-stock-row"
                                            key={item.item_id}
                                        >
                                            <div className="sp-product-dot">
                                                {item.item_name?.slice(0, 1) || "?"}
                                            </div>

                                            <div className="sp-stock-name">
                                                <strong>
                                                    {item.item_name}
                                                </strong>

                                                <small>
                                                    {item.stock} units left
                                                </small>
                                            </div>

                                            <span className={`sp-status ${
                                                item.level === "Critical"
                                                    ? "critical"
                                                    : "warning"
                                            }`}>
                                                {item.level}
                                            </span>
                                        </div>
                                    ))}

                                    {dashboardData.lowStock.length === 0 && (
                                        <div className="sp-empty">
                                            No low stock products.
                                        </div>
                                    )}

                                </div>


                                <button
                                    className="sp-text-link"
                                    onClick={() => chooseNav("inventory")}
                                >
                                    View inventory
                                    <ArrowUpRight size={14} />
                                </button>

                            </article>


                            {/* EXPIRING PRODUCTS */}

                            <article className="sp-panel sp-expiry-panel">

                                <div className="sp-panel-head">
                                    <div>
                                        <h2>Expiring Products</h2>

                                        <p>
                                            Check these dates carefully
                                        </p>
                                    </div>

                                    <span className="sp-counter warning">
                                        {dashboardData.expiringProducts.length} items
                                    </span>
                                </div>


                                <div className="sp-table-wrap">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Product</th>
                                                <th>Stock</th>
                                                <th>Expiry date</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {dashboardData.expiringProducts.map((p) => (
                                                <tr key={p.item_id}>
                                                    <td>{p.item_name}</td>
                                                    <td>{p.stock}</td>

                                                    <td>
                                                        <span className="sp-date-warning">
                                                            {shortDate(p.expiry_date)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}

                                            {dashboardData.expiringProducts.length === 0 && (
                                                <tr>
                                                    <td
                                                        colSpan="3"
                                                        className="sp-empty"
                                                    >
                                                        No expiring products found.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                            </article>

                        </section>


                        {/* ================================= */}
                        {/* SECONDARY GRID */}
                        {/* PURCHASE ORDERS + PAYMENT METHODS */}
                        {/* ================================= */}

                        <section className="sp-secondary-grid">


                            {/* RECENT PURCHASE ORDERS - LEFT SIDE */}

                            <article className="sp-panel sp-orders-panel">

                                <div className="sp-panel-head">
                                    <div>
                                        <h2>Recent Purchase Orders</h2>

                                        <p>
                                            Supplier order status
                                        </p>
                                    </div>

                                    <button
                                        className="sp-icon-button subtle"
                                        onClick={() => chooseNav("purchase_orders")}
                                        aria-label="View purchase orders"
                                    >
                                        <ArrowUpRight size={17} />
                                    </button>
                                </div>


                                <div className="sp-order-list">

                                    {dashboardData.purchaseOrders.map((o) => (
                                        <div
                                            className="sp-order-item"
                                            key={o.purchase_order_id}
                                        >
                                            <div className="sp-order-icon">
                                                <ClipboardList size={18} />
                                            </div>

                                            <div className="sp-order-info">
                                                <strong>
                                                    {o.order_no}
                                                </strong>

                                                <span>
                                                    {o.supplier_name} · {o.items} products
                                                </span>

                                                <small>
                                                    {shortDate(o.order_date)}
                                                </small>
                                            </div>


                                            <div className="sp-order-right">

                                                <span className={`sp-status ${
                                                    o.status === "Received"
                                                        ? "received"
                                                        : "warning"
                                                }`}>
                                                    {o.status}
                                                </span>

                                                {o.status === "Pending" && (
                                                    <button
                                                        disabled={
                                                            receivingOrderId === o.purchase_order_id
                                                        }
                                                        onClick={() =>
                                                            markOrderReceived(o.purchase_order_id)
                                                        }
                                                    >
                                                        {receivingOrderId === o.purchase_order_id
                                                            ? "Processing..."
                                                            : "Mark received"
                                                        }
                                                    </button>
                                                )}

                                            </div>

                                        </div>
                                    ))}


                                    {dashboardData.purchaseOrders.length === 0 && (
                                        <div className="sp-empty">
                                            No purchase orders available.
                                        </div>
                                    )}

                                </div>

                            </article>


                            {/* PAYMENT METHODS - RIGHT SIDE */}

                            <article className="sp-panel sp-payment-panel">

                                <div className="sp-panel-head">
                                    <div>
                                        <h2>Payment Methods</h2>

                                        <p>
                                            Today's payment breakdown
                                        </p>
                                    </div>
                                </div>


                                <div className="sp-payment-total">
                                    <strong>
                                        {money(paymentTotal)}
                                    </strong>

                                    <span>
                                        Total collected today
                                    </span>
                                </div>


                                {/* CASH */}

                                <div className="sp-payment-row">
                                    <span className="sp-payment-label">
                                        <Banknote size={16} />
                                        Cash
                                    </span>

                                    <strong>
                                        {money(getPaymentAmount("Cash"))}
                                    </strong>

                                    <span className="sp-payment-percent">
                                        {getPaymentBillCount("Cash")} Bills
                                    </span>
                                </div>

                                <div className="sp-payment-bar">
                                    <span
                                        style={{
                                            width: `${getPaymentBillCount("Cash")}%`
                                        }}
                                    />
                                </div>


                                {/* CARD */}

                                <div className="sp-payment-row">
                                    <span className="sp-payment-label">
                                        <CreditCard size={16} />
                                        Card
                                    </span>

                                    <strong>
                                        {money(getPaymentAmount("Card"))}
                                    </strong>

                                    <span className="sp-payment-percent">
                                        {getPaymentBillCount("Card")} Bills
                                    </span>
                                </div>

                                <div className="sp-payment-bar green-bar">
                                    <span
                                        style={{
                                            width: `${getPaymentBillCount("Card")}%`
                                        }}
                                    />
                                </div>

                            </article>

                        </section>

                    </>
                )}


                {/* ================================= */}
                {/* FOOTER */}
                {/* ================================= */}

                <footer className="sp-footer">
                    <span>
                        © Smart POS · FoodCity Smart POS System
                    </span>
                </footer>

            </main>

        </div>
    );
}