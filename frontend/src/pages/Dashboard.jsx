import { useMemo, useState } from "react";
import logo from "../img/black logo.png";
import "./Dashboard.css";
import {
  ShoppingCart, LayoutDashboard, Package, Warehouse, Truck, ClipboardList,
  Users, History, ChartNoAxesCombined, Settings, LogOut, Search, Bell,
  CalendarDays, AlertTriangle, BrainCircuit, ArrowUpRight, ChevronDown,
  CircleDollarSign, CreditCard, Banknote, QrCode, Eye, Menu, X
} from "lucide-react";
import "./Dashboard.css";

const salesByDay = [
  { day: "Mon", amount: 20 }, { day: "Tue", amount: 30 },
  { day: "Wed", amount: 40 }, { day: "Thu", amount: 49 },
  { day: "Fri", amount: 40 }, { day: "Sat", amount: 43 },
  { day: "Sun", amount: 29 }
];

const initialLowStock = [
  { name: "Milk (1L)", stock: 5, level: "Critical" },
  { name: "Cooking Oil (1L)", stock: 3, level: "Critical" },
  { name: "Tea (250g)", stock: 4, level: "Critical" },
  { name: "Salt (1kg)", stock: 6, level: "Warning" },
  { name: "Coffee (50g)", stock: 7, level: "Warning" }
];

const expiringProducts = [
  { name: "Milk (1L)", stock: 5, expiry: "2026-11-02" },
  { name: "Yogurt Cup", stock: 12, expiry: "2026-11-04" },
  { name: "Bread (450g)", stock: 8, expiry: "2026-11-05" },
  { name: "Cheese (200g)", stock: 6, expiry: "2026-11-08" },
  { name: "Juice (1L)", stock: 9, expiry: "2026-11-10" }
];

const initialRecommendations = [
  { name: "Milk (1L)", stock: 5, demand: 150, order: 145 },
  { name: "Cooking Oil (1L)", stock: 3, demand: 80, order: 77 },
  { name: "Tea (250g)", stock: 4, demand: 80, order: 76 },
  { name: "Salt (1kg)", stock: 6, demand: 60, order: 54 },
  { name: "Coffee (50g)", stock: 7, demand: 70, order: 63 }
];

const initialSales = [
  { date: "2026-10-27", id: "POS-10234", amount: 500, method: "Cash", items: 4, status: "Completed" },
  { date: "2026-10-27", id: "POS-10233", amount: 2500, method: "Card", items: 8, status: "Completed" },
  { date: "2026-10-26", id: "POS-10232", amount: 1500, method: "QR Pay", items: 5, status: "Completed" },
  { date: "2026-10-26", id: "POS-10231", amount: 5300, method: "Cash", items: 12, status: "Completed" }
];

const initialOrders = [
  { id: "PO-0081", supplier: "Lanka Distributors", items: 12, date: "2026-10-26", status: "Pending" },
  { id: "PO-0080", supplier: "Fresh Foods Ltd", items: 8, date: "2026-10-25", status: "Received" },
  { id: "PO-0079", supplier: "City Wholesale", items: 15, date: "2026-10-24", status: "Pending" }
];

const money = (n) => `Rs. ${Number(n).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const shortDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString("en-GB");

export default function Dashboard({ onNavigate }) {
  const [period, setPeriod] = useState("Weekly");
  const [search, setSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [salesFilter, setSalesFilter] = useState("All");
  const [sales, setSales] = useState(initialSales);
  const [orders, setOrders] = useState(initialOrders);
  const [notice, setNotice] = useState("");
  const [activeNav, setActiveNav] = useState("Dashboard");

  const filteredSales = useMemo(() => sales.filter((sale) => {
    const matchesSearch = `${sale.id} ${sale.method} ${sale.date}`.toLowerCase().includes(search.toLowerCase());
    const matchesMethod = salesFilter === "All" || sale.method === salesFilter;
    return matchesSearch && matchesMethod;
  }), [sales, search, salesFilter]);

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "POS Billing", icon: ShoppingCart },
    { label: "Products Management", icon: Package },
    { label: "Inventory", icon: Warehouse },
    { label: "Suppliers Management", icon: Truck },
    { label: "Purchase Orders", icon: ClipboardList },
    { label: "Customer Management", icon: Users },
    { label: "Sales History", icon: History },
    { label: "Reports", icon: ChartNoAxesCombined },
    { label: "Settings", icon: Settings }
  ];

  function chooseNav(label) {
  setActiveNav(label);
  setMobileMenu(false);
  setNotice("");

  const pageMap = {
    Dashboard: "dashboard",
    "POS Billing": "billing",
    "Products Management": "products",
    Inventory: "inventory",
    "Suppliers Management": "suppliers",
  };

  const page = pageMap[label];

  if (page && onNavigate) {
    onNavigate(page);
    return;
  }

  setNotice(
    `${label} page is not connected yet.`
  );
}

  function markOrderReceived(id) {
    setOrders((current) => current.map((order) => order.id === id ? { ...order, status: "Received" } : order));
    setNotice(`${id} marked as received (demo only; not saved to MySQL).`);
  }

  function exportSalesCsv() {
    const rows = [
      ["Date", "Order ID", "Amount (LKR)", "Payment Method", "Items", "Status"],
      ...filteredSales.map((s) => [s.date, s.id, s.amount, s.method, s.items, s.status])
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "smart-pos-sales-history.csv";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Sales history CSV exported.");
  }

  return (
    <div className="sp-dashboard">
      <aside className={`sp-sidebar ${mobileMenu ? "sp-sidebar-open" : ""}`}>
        <div className="sp-brand">
          
          <span className="brand-icon"> <img src={logo} alt="Smart POS Logo" className="brand-logo" width={220}/></span>
          <button className="sp-close-menu" onClick={() => setMobileMenu(false)} aria-label="Close menu"><X size={20}/></button>
        </div>
        <div className="sp-nav-label">MAIN MENU</div>
        <nav className="sp-nav">
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={`sp-nav-item ${activeNav === label ? "selected" : ""}`} onClick={() => chooseNav(label)}>
              <Icon size={18} /><span>{label}</span>
              {label === "Inventory" && <span className="sp-nav-count">5</span>}
            </button>
          ))}
        </nav>
        <div className="sp-sidebar-bottom">
          <div className="sp-help-card"><strong>Need help?</strong><p>Check your stock and sales insights to make better decisions.</p></div>
          <button className="sp-nav-item" onClick={() => { setNotice("Log out using your app's existing Logout button below the dashboard."); }}><LogOut size={18}/><span>Logout</span></button>
        </div>
      </aside>

      {mobileMenu && <button className="sp-backdrop" onClick={() => setMobileMenu(false)} aria-label="Close navigation" />}

      <main className="sp-main">
        <header className="sp-topbar">
          <button className="sp-mobile-menu" onClick={() => setMobileMenu(true)} aria-label="Open menu"><Menu size={21}/></button>
          <div className="sp-page-heading"><span>OVERVIEW</span><h1>Welcome back, Owner!</h1><p><CalendarDays size={14}/> Tuesday, 27 October 2026 <span className="sp-dot">•</span> Store Owner Dashboard</p></div>
          <div className="sp-top-actions">
            <label className="sp-search"><Search size={17}/><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sales / order ID..." /></label>
            <div className="sp-notification-wrap">
              <button className="sp-icon-button" onClick={() => setShowNotifications((v) => !v)} aria-label="Notifications"><Bell size={19}/><i>4</i></button>
              {showNotifications && <div className="sp-notification-pop"><strong>Notifications</strong><p><AlertTriangle size={14}/> 3 products have critical stock.</p><p><CalendarDays size={14}/> 5 products are expiring soon.</p><p><ClipboardList size={14}/> 2 purchase orders pending.</p></div>}
            </div>
            <div className="sp-profile"><div className="sp-avatar">O</div><div><strong>Owner</strong><small>Store Owner</small></div><ChevronDown size={14}/></div>
          </div>
        </header>

        {notice && <div className="sp-notice"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss message"><X size={15}/></button></div>}

        <section className="sp-kpi-grid">
          <article className="sp-kpi"><div className="sp-kpi-icon blue"><ChartNoAxesCombined size={21}/></div><div><span>Today's Sales</span><strong>{money(50000)}</strong><small className="sp-positive"><ArrowUpRight size={13}/> 12.8% vs yesterday</small></div></article>
          <article className="sp-kpi"><div className="sp-kpi-icon green"><CircleDollarSign size={21}/></div><div><span>Monthly Revenue</span><strong>{money(1230000)}</strong><small className="sp-positive"><ArrowUpRight size={13}/> 8.4% this month</small></div></article>
          <article className="sp-kpi"><div className="sp-kpi-icon orange"><ShoppingCart size={21}/></div><div><span>Total Orders</span><strong>124</strong><small className="sp-muted">Today's transactions</small></div></article>
          <article className="sp-kpi"><div className="sp-kpi-icon purple"><CircleDollarSign size={21}/></div><div><span>Profit (This Month)</span><strong>{money(89000)}</strong><small className="sp-positive"><ArrowUpRight size={13}/> 6.2% this month</small></div></article>
        </section>

        <section className="sp-primary-grid">
          <article className="sp-panel sp-sales-panel">
            <div className="sp-panel-head"><div><h2>Sales Performance</h2><p>Track your store's sales trends</p></div><select value={period} onChange={(e) => setPeriod(e.target.value)} aria-label="Sales period"><option>Weekly</option><option>Daily</option></select></div>
            <div className="sp-chart-summary"><strong>{money(period === "Weekly" ? 279000 : 50000)}</strong><span className="sp-positive">+8.4% <small>vs previous {period.toLowerCase()}</small></span></div>
            <div className="sp-chart">
              <div className="sp-y-labels"><span>60k</span><span>45k</span><span>30k</span><span>15k</span><span>0</span></div>
              <svg viewBox="0 0 520 205" role="img" aria-label="Illustrative sales line chart" preserveAspectRatio="none">
                <defs><linearGradient id="spArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4f6fff" stopOpacity=".25"/><stop offset="100%" stopColor="#4f6fff" stopOpacity=".015"/></linearGradient></defs>
                {[20,60,100,140,180].map((y) => <line key={y} x1="0" y1={y} x2="520" y2={y} stroke="#e9edf5" strokeDasharray="4 5" />)}
                <path d="M 8 145 L 90 112 L 172 78 L 254 38 L 336 82 L 418 66 L 510 120 L 510 180 L 8 180 Z" fill="url(#spArea)"/>
                <polyline points="8,145 90,112 172,78 254,38 336,82 418,66 510,120" fill="none" stroke="#4f6fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                {[[8,145],[90,112],[172,78],[254,38],[336,82],[418,66],[510,120]].map(([x,y]) => <circle key={x} cx={x} cy={y} r="4.5" fill="#fff" stroke="#4f6fff" strokeWidth="2.5"/>)}
              </svg>
              <div className="sp-x-labels">{salesByDay.map((d) => <span key={d.day}>{d.day}</span>)}</div>
            </div>
          </article>

          <article className="sp-panel sp-stock-panel">
            <div className="sp-panel-head"><div><h2>Low Stock Alert</h2><p>Restock these items soon</p></div><span className="sp-counter danger">5 items</span></div>
            <div className="sp-compact-list">
              {initialLowStock.map((item) => <div className="sp-stock-row" key={item.name}><div className="sp-product-dot">{item.name.slice(0,1)}</div><div className="sp-stock-name"><strong>{item.name}</strong><small>{item.stock} units left</small></div><span className={`sp-status ${item.level === "Critical" ? "critical" : "warning"}`}>{item.level}</span></div>)}
            </div>
            <button className="sp-text-link" onClick={() => chooseNav("Inventory")}>View inventory <ArrowUpRight size={14}/></button>
          </article>

          <article className="sp-panel sp-expiry-panel">
            <div className="sp-panel-head"><div><h2>Expiring Products</h2><p>Check these dates carefully</p></div><span className="sp-counter warning">5 items</span></div>
            <div className="sp-table-wrap">
              <table><thead><tr><th>Product</th><th>Stock</th><th>Expiry date</th></tr></thead><tbody>
                {expiringProducts.map((p) => <tr key={p.name}><td>{p.name}</td><td>{p.stock}</td><td><span className="sp-date-warning">{shortDate(p.expiry)}</span></td></tr>)}
              </tbody></table>
            </div>
            <p className="sp-footnote"><AlertTriangle size={13}/> Demo expiry data — replace with database values.</p>
          </article>
        </section>

        <section className="sp-secondary-grid">
          <article className="sp-panel sp-ai-panel">
            <div className="sp-panel-head"><div className="sp-heading-with-icon"><span className="sp-ai-icon"><BrainCircuit size={19}/></span><div><h2>AI Stock Recommendation</h2><p>Suggested orders based on predicted demand</p></div></div><button className="sp-outline-button" onClick={() => setNotice("These are sample recommendations. A real recommendation requires historical sales and inventory data.")}>How it works</button></div>
            <div className="sp-table-wrap">
              <table><thead><tr><th>Product</th><th>Current stock</th><th>Predicted demand</th><th>Recommended order</th><th>Action</th></tr></thead><tbody>
                {initialRecommendations.map((p) => <tr key={p.name}><td className="sp-table-product">{p.name}</td><td className="sp-red-number">{p.stock}</td><td>{p.demand}</td><td className="sp-green-number">{p.order}</td><td><button className="sp-order-button" onClick={() => setNotice(`${p.name}: draft reorder for ${p.order} units. Connect this action to your Purchase Orders API.`)}>Order now</button></td></tr>)}
              </tbody></table>
            </div>
          </article>

          <article className="sp-panel sp-payment-panel">
            <div className="sp-panel-head"><div><h2>Payment Methods</h2><p>Today's payment breakdown</p></div></div>
            <div className="sp-payment-total"><strong>{money(50000)}</strong><span>Total collected · demo data</span></div>
            <div className="sp-payment-row"><span className="sp-payment-label"><Banknote size={16}/> Cash</span><strong>{money(24500)}</strong><span className="sp-payment-percent">49%</span></div>
            <div className="sp-payment-bar"><span style={{width:"49%"}}/></div>
            <div className="sp-payment-row"><span className="sp-payment-label"><CreditCard size={16}/> Card</span><strong>{money(18000)}</strong><span className="sp-payment-percent">36%</span></div>
            <div className="sp-payment-bar green-bar"><span style={{width:"36%"}}/></div>
            <div className="sp-payment-row"><span className="sp-payment-label"><QrCode size={16}/> QR / Digital</span><strong>{money(7500)}</strong><span className="sp-payment-percent">15%</span></div>
            <div className="sp-payment-bar orange-bar"><span style={{width:"15%"}}/></div>
          </article>
        </section>

        <section className="sp-bottom-grid">
          <article className="sp-panel sp-history-panel">
            <div className="sp-panel-head"><div><h2>Sales History</h2><p>Review your latest transactions</p></div><div className="sp-inline-actions"><select value={salesFilter} onChange={(e) => setSalesFilter(e.target.value)} aria-label="Filter payment method"><option>All</option><option>Cash</option><option>Card</option><option>QR Pay</option></select><button className="sp-outline-button" onClick={exportSalesCsv}>Export CSV</button></div></div>
            <div className="sp-table-wrap">
              <table><thead><tr><th>Date</th><th>Order ID</th><th>Amount</th><th>Payment</th><th>Items</th><th>Status</th><th>Details</th></tr></thead><tbody>
                {filteredSales.map((s) => <tr key={s.id}><td>{shortDate(s.date)}</td><td className="sp-id">{s.id}</td><td className="sp-table-product">{money(s.amount)}</td><td>{s.method}</td><td>{s.items}</td><td><span className="sp-status received">{s.status}</span></td><td><button className="sp-view-button" onClick={() => setNotice(`${s.id}: ${s.items} items, paid by ${s.method}, total ${money(s.amount)}. Demo transaction.`)}><Eye size={13}/> View</button></td></tr>)}
                {filteredSales.length === 0 && <tr><td colSpan="7" className="sp-empty">No sales match your search/filter.</td></tr>}
              </tbody></table>
            </div>
          </article>

          <article className="sp-panel sp-orders-panel">
            <div className="sp-panel-head"><div><h2>Recent Purchase Orders</h2><p>Supplier order status</p></div><button className="sp-icon-button subtle" onClick={() => chooseNav("Purchase Orders")} aria-label="View purchase orders"><ArrowUpRight size={17}/></button></div>
            <div className="sp-order-list">
              {orders.map((o) => <div className="sp-order-item" key={o.id}><div className="sp-order-icon"><ClipboardList size={18}/></div><div className="sp-order-info"><strong>{o.id}</strong><span>{o.supplier} · {o.items} products</span><small>{shortDate(o.date)}</small></div><div className="sp-order-right"><span className={`sp-status ${o.status === "Received" ? "received" : "warning"}`}>{o.status}</span>{o.status === "Pending" && <button onClick={() => markOrderReceived(o.id)}>Mark received</button>}</div></div>)}
            </div>
          </article>
        </section>

        <footer className="sp-footer"><span>© 2026 Smart POS · Food City Management</span><span>Dashboard preview · Sample data</span></footer>
      </main>
    </div>
  );
}
