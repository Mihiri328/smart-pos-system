
import { useMemo, useState } from "react";
import {
  LayoutDashboard, ShoppingCart, Package, Warehouse, Truck,
  ClipboardList, Users, History, ChartNoAxesCombined, Settings,
  LogOut, Search, Bell, Menu, X, CalendarDays, FileText,
  FileSpreadsheet, TrendingUp, DollarSign, Wallet, ChartColumn
} from "lucide-react";
import logo from "../img/black logo.png";
import "./Reports.css";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, page: "dashboard" },
  { label: "POS Billing", icon: ShoppingCart, page: "billing" },
  { label: "Products Management", icon: Package, page: "products" },
  { label: "Inventory", icon: Warehouse, page: "inventory", count: 5 },
  { label: "Suppliers Management", icon: Truck, page: "suppliers" },
  { label: "Purchase Orders", icon: ClipboardList, page: "purchase_orders" },
  { label: "Customer Management", icon: Users, page: "customers" },
  { label: "Sales History", icon: History, page: "sales_history" },
  { label: "Reports", icon: ChartNoAxesCombined, page: "reports" },
  { label: "Settings", icon: Settings, page: "settings" },
];

const initialProducts = [
  { name: "Dilmah Premium Tea 500 g", category: "Groceries", units: 1243, revenue: 186000 },
  { name: "Munchee Super Cream Cracker", category: "Groceries", units: 1243, revenue: 186000 },
  { name: "Anchor Full Cream Milk Powder", category: "Dairy", units: 987, revenue: 172500 },
  { name: "Keells White Sugar 1 kg", category: "Groceries", units: 845, revenue: 98400 },
  { name: "Sunlight Soap", category: "Household", units: 720, revenue: 86400 },
];

const money = (value) =>
  Number(value).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function RevenueChart() {
  return (
    <svg className="report-chart" viewBox="0 0 800 220" role="img" aria-label="Revenue and expenses comparison chart">
      <defs>
        <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4053d9" stopOpacity=".12" />
          <stop offset="100%" stopColor="#4053d9" stopOpacity="0" />
        </linearGradient>
      </defs>

      {Array.from({ length: 7 }, (_, i) => (
        <line key={`h${i}`} x1="1" y1={10 + i * 32} x2="799" y2={10 + i * 32} stroke="#e5e9f3" />
      ))}

      {Array.from({ length: 21 }, (_, i) => (
        <line key={`v${i}`} x1={1 + i * 40} y1="10" x2={1 + i * 40} y2="202" stroke="#e5e9f3" />
      ))}

      <path
        d="M1 150 C70 130 100 128 150 135 S240 120 290 80 S380 48 430 90 S510 155 570 112 S640 25 675 2 S745 15 799 -5 L799 202 L1 202 Z"
        fill="url(#revenueFill)"
      />
      <path
        d="M1 150 C70 130 100 128 150 135 S240 120 290 80 S380 48 430 90 S510 155 570 112 S640 25 675 2 S745 15 799 -5"
        fill="none" stroke="#1936ad" strokeWidth="2.5"
      />
      <path
        d="M1 168 C70 155 100 153 150 160 S240 155 290 135 S380 110 430 135 S510 178 570 157 S640 105 675 100 S745 87 799 98"
        fill="none" stroke="#f22d36" strokeWidth="1.7" strokeDasharray="3 4"
      />

      {["WK 1", "WK 2", "WK 3", "WK 4", "WK 5"].map((week, i) => (
        <text key={week} x={20 + i * 188} y="216" fill="#7b8090" fontSize="10">
          {week}
        </text>
      ))}
    </svg>
  );
}

function Reports({ onNavigate, onLogout }) {
  const [dateRange, setDateRange] = useState({
    from: "2026-10-01",
    to: "2026-10-31",
  });
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const products = useMemo(
    () => initialProducts.filter((product) =>
      `${product.name} ${product.category}`.toLowerCase().includes(search.toLowerCase())
    ),
    [search]
  );

  const exportCSV = () => {
    const rows = [
      ["Rank", "Product Name", "Category", "Units Sold", "Revenue"],
      ...products.map((p, i) => [i + 1, p.name, p.category, p.units, p.revenue]),
    ];

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "foodcity-operational-reports.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="reports-app">
      {mobileMenu && (
        <button
          className="sp-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <aside className={`sp-sidebar ${mobileMenu ? "sp-sidebar-open" : ""}`}>
        <div className="sp-brand">
          <img src={logo} alt="Smart POS" className="brand-logo" />
          <button className="sp-close-menu" onClick={() => setMobileMenu(false)}>
            <X size={20} />
          </button>
        </div>

        <p className="sp-nav-label">MENU</p>
        <nav className="sp-nav">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.page}
                className={`sp-nav-item ${item.page === "reports" ? "selected" : ""}`}
                onClick={() => {
                  setMobileMenu(false);
                  onNavigate?.(item.page);
                }}
              >
                <Icon size={19} />
                <span>{item.label}</span>
                {item.count && <span className="sp-nav-count">{item.count}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sp-sidebar-bottom">
          <button className="sp-nav-item" onClick={onLogout}>
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="reports-main sp-main">
        <header className="reports-topbar sp-topbar">
          <div className="reports-heading-group">
            <button className="sp-mobile-menu" onClick={() => setMobileMenu(true)}>
              <Menu size={22} />
            </button>
            <div>
              <h1>Reports</h1>
              <p>Monitor your business performance</p>
            </div>
          </div>

          <div className="reports-top-actions sp-top-actions">
            <div className="reports-search sp-search">
              <Search size={17} />
              <input
                aria-label="Search products"
                placeholder="Search anything..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <button
              className="reports-notification sp-icon-button"
              type="button"
              aria-label="Notifications"
              onClick={() => setNotice("You have 4 notifications.")}
            >
              <Bell size={20} />
              <b>4</b>
            </button>

            <div className="sp-profile">
              <div className="sp-avatar">O</div>
              <div>
                <strong>Owner</strong>
                <span>Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {notice && (
          <div className="reports-notice">
            {notice}
            <button type="button" onClick={() => setNotice("")}>✕</button>
          </div>
        )}

        <div className="reports-content">
          <section className="reports-toolbar">
            <div className="reports-date-filter">
              <label>
                <span>From</span>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                />
              </label>
              <span className="reports-date-dash">–</span>
              <label>
                <span>To</span>
                <input
                  type="date"
                  value={dateRange.to}
                  min={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                />
              </label>
            </div>

            <div className="reports-export-buttons">
              <button className="reports-export-pdf" type="button" onClick={() => window.print()}>
                <FileText size={17} /> Export PDF
              </button>
              <button className="reports-export-excel" type="button" onClick={exportCSV}>
                <FileSpreadsheet size={17} /> Export Excel
              </button>
            </div>
          </section>

          <section className="reports-summary-grid">
            <article className="reports-summary-card">
              <div className="reports-summary-top">
                <span className="reports-summary-icon blue"><Wallet size={21} /></span>
                <span className="reports-growth">+15.2%</span>
              </div>
              <p>Total Expenses</p>
              <h2>Rs. 1,358,250.25</h2>
            </article>

            <article className="reports-summary-card">
              <div className="reports-summary-top">
                <span className="reports-summary-icon green"><TrendingUp size={21} /></span>
                <span className="reports-growth">+12.5%</span>
              </div>
              <p>Total Revenue</p>
              <h2>Rs. 1,584,652.00</h2>
            </article>

            <article className="reports-summary-card">
              <div className="reports-summary-top">
                <span className="reports-summary-icon orange"><DollarSign size={21} /></span>
                <span className="reports-growth">+11.5%</span>
              </div>
              <p>Net Profit</p>
              <h2>Rs. 1,884,652.00</h2>
            </article>

            <article className="reports-summary-card">
              <div className="reports-summary-top">
                <span className="reports-summary-icon red"><ChartColumn size={21} /></span>
                <span className="reports-growth">+2.5%</span>
              </div>
              <p>Gross Profit</p>
              <h2>Rs. 1,584.05</h2>
            </article>
          </section>

          <section className="reports-chart-panel">
            <div className="reports-chart-heading">
              <div>
                <h3>Revenue vs Expenses</h3>
                <p>
                  Performance tracking for{" "}
                  {dateRange.from && dateRange.to
                    ? `${dateRange.from} to ${dateRange.to}`
                    : "selected period"}
                </p>
              </div>
              <div className="reports-legend">
                <span><i className="revenue-dot" /> Revenue</span>
                <span><i className="expenses-dot" /> Expenses</span>
              </div>
            </div>
            <RevenueChart />
          </section>

          <section className="reports-bottom-grid">
            <div className="reports-products-panel">
              <h3>Top Selling Products</h3>
              <div className="reports-table-wrap">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>RANK</th>
                      <th>Product Name</th>
                      <th>CATEGORY</th>
                      <th>UNITS SOLD</th>
                      <th>REVENUE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length ? products.map((product, index) => (
                      <tr key={product.name}>
                        <td><span className="reports-rank">{index + 1}</span></td>
                        <td>{product.name}</td>
                        <td><span className="reports-category">{product.category}</span></td>
                        <td>{product.units}</td>
                        <td className="reports-revenue">Rs. {money(product.revenue)}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="5" className="reports-empty">No matching products found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="reports-inventory-panel">
              <h3>Inventory Velocity</h3>
              <div className="reports-velocity-item">
                <div className="reports-velocity-heading">
                  <strong>Fast Moving Items</strong>
                  <span>58% of stock</span>
                </div>
                <div className="reports-progress"><span className="fast-moving" /></div>
                <p>Items clearing in &lt; 46 days</p>
              </div>

              <div className="reports-velocity-item">
                <div className="reports-velocity-heading">
                  <strong>Slow Moving Items</strong>
                  <span>42% of stock</span>
                </div>
                <div className="reports-progress"><span className="slow-moving" /></div>
                <p>Items clearing in &lt; 7 days</p>
              </div>
            </aside>
          </section>

          <footer className="reports-footer">
            FoodCity Smart POS System · Operational Reports
          </footer>
        </div>
      </main>
    </div>
  );
}

export default Reports;