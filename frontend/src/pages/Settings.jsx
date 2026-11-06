import { useRef, useState } from "react";
import {
  LayoutDashboard, ShoppingCart, Package, Warehouse, Truck,
  ClipboardList, Users, History, ChartNoAxesCombined,
  Settings as SettingsIcon, LogOut, Search, Bell, Menu, X,
  Store, Receipt, ShieldCheck, UserCog, Save, RotateCcw,
  Upload
} from "lucide-react";

import logo from "../img/black logo.png";
import "../style.css";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, page: "dashboard" },
  { label: "POS Billing", icon: ShoppingCart, page: "billing" },
  { label: "Products Management", icon: Package, page: "products" },
  { label: "Inventory", icon: Warehouse, page: "inventory", count: 5 },
  { label: "Suppliers Management", icon: Truck, page: "suppliers" },
  { label: "Purchase Orders", icon: ClipboardList, page: "Purchase Orders" },
  { label: "Customer Management", icon: Users, page: "customers" },
  { label: "Sales History", icon: History, page: "sales_history" },
  { label: "Reports", icon: ChartNoAxesCombined, page: "reports" },
  { label: "Settings", icon: SettingsIcon, page: "settings" },
];

const initialForm = {
  storeName: "FoodCity",
  registrationNumber: "PV-12345",
  address: "",
  phone: "",
  whatsapp: "",
  currency: "LKR",
  taxEnabled: true,
  taxRate: "18",
  receiptFooter: "Thank you for shopping with FoodCity!",
  username: "admin",
  role: "Administrator",
  sessionTimeout: "30",
  autoBackup: true,
  twoFactor: false,
  lowStockAlerts: true,
};

const tabs = [
  { label: "Store Info", icon: Store },
  { label: "Tax & Billing", icon: Receipt },
  { label: "Users & Permissions", icon: UserCog },
  { label: "Backup & Security", icon: ShieldCheck },
];

function Settings({ onNavigate, onLogout }) {
  const [activeTab, setActiveTab] = useState("Store Info");
  const [form, setForm] = useState(initialForm);
  const [savedForm, setSavedForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [storeLogo, setStoreLogo] = useState(logo);
  const logoInput = useRef(null);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setMessage("");
  };

  const saveChanges = (event) => {
    event.preventDefault();
    setSavedForm({ ...form });
    setMessage("Changes saved for this session.");
  };

  const resetChanges = () => {
    setForm({ ...savedForm });
    setMessage("Unsaved changes have been reset.");
  };

  const handleLogo = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      return;
    }

    setStoreLogo(URL.createObjectURL(file));
    setMessage("Logo preview updated. Save your changes to keep it for this session.");
  };

  const field = (label, key, placeholder, type = "text") => (
    <label className="sys-field" key={key}>
      <span>{label}</span>
      <input
        type={type}
        value={form[key]}
        placeholder={placeholder}
        onChange={(event) => update(key, event.target.value)}
      />
    </label>
  );

  const toggle = (label, description, key) => (
    <div className="sys-toggle-row" key={key}>
      <div>
        <strong>{label}</strong>
        <p>{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={form[key]}
        className={`sys-switch ${form[key] ? "on" : ""}`}
        onClick={() => update(key, !form[key])}
      >
        <span />
      </button>
    </div>
  );

  return (
    <div className="sp-dashboard settings-app">
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
          <button
            className="sp-close-menu"
            aria-label="Close menu"
            onClick={() => setMobileMenu(false)}
          >
            <X size={20} />
          </button>
        </div>

        <p className="sp-nav-label">MAIN MENU</p>

        <nav className="sp-nav">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.page}
                className={`sp-nav-item ${
                  item.page === "settings" ? "selected" : ""
                }`}
                onClick={() => {
                  setMobileMenu(false);
                  onNavigate?.(item.page);
                }}
              >
                <Icon size={19} />
                <span>{item.label}</span>
                {item.count && (
                  <span className="sp-nav-count">{item.count}</span>
                )}
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

      <main className="sp-main settings-main">
        <header className="sp-topbar settings-topbar">
          <div className="sp-page-heading">
            <button
              className="sp-mobile-menu"
              aria-label="Open menu"
              onClick={() => setMobileMenu(true)}
            >
              <Menu size={22} />
            </button>
              <div className="sp-page-heading sh-heading">
              <h1>System Settings</h1>
              <p>Configure your store details, tax rules and user access.</p>
            </div>
          </div>

          <div className="sp-top-actions">
            <label className="sp-search">
              <Search size={17} />
              <input placeholder="Search anything..." aria-label="Search settings" />
            </label>

            <button
              className="sp-icon-button"
              aria-label="Notifications"
              onClick={() => setMessage("You have 4 notifications.")}
            >
              <Bell size={20} />
              <span className="settings-notification-count">4</span>
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

        <div className="settings-content">
          {message && (
            <div className="sys-message" role="status">
              <span>{message}</span>
              <button type="button" onClick={() => setMessage("")}>
                ✕
              </button>
            </div>
          )}

          <div className="settings-page-heading">
            <div>
              <h2>Settings</h2>
              <p>Manage your store preferences and system configuration.</p>
            </div>

            <button
              type="button"
              className="settings-save-all"
              onClick={saveChanges}
            >
              <Save size={17} /> Save All Changes
            </button>
          </div>

          <nav className="sys-tabs" aria-label="Settings sections">
            {tabs.map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  type="button"
                  key={tab.label}
                  className={`sys-tab ${
                    activeTab === tab.label ? "active" : ""
                  }`}
                  onClick={() => {
                    setActiveTab(tab.label);
                    setMessage("");
                  }}
                >
                  <Icon size={17} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <form className="sys-form" onSubmit={saveChanges}>
            {activeTab === "Store Info" && (
              <div className="sys-store-layout">
                <section className="sys-card sys-business-card">
                  <h2>Business Details</h2>

                  <div className="sys-form-grid">
                    {field("Store Name", "storeName", "Enter store name")}
                    {field("Registration Number", "registrationNumber", "PV-12345")}
                  </div>

                  <label className="sys-field sys-address-field">
                    <span>Address</span>
                    <textarea
                      rows={4}
                      value={form.address}
                      placeholder="Enter store address"
                      onChange={(event) => update("address", event.target.value)}
                    />
                  </label>

                  <div className="sys-form-grid sys-contact-grid">
                    {field("Phone Number", "phone", "+94...", "tel")}
                    {field("WhatsApp Support", "whatsapp", "+94...", "tel")}
                  </div>
                </section>

                <section className="sys-card sys-logo-card">
                  <h2>Store Logo</h2>

                  <button
                    type="button"
                    className="sys-logo-preview"
                    onClick={() => logoInput.current?.click()}
                    aria-label="Choose store logo"
                  >
                    <img src={storeLogo} alt="Store logo preview" />
                  </button>

                  <input
                    ref={logoInput}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleLogo}
                  />

                  <p>Upload your store logo.</p>

                  <button
                    type="button"
                    className="sys-replace-logo"
                    onClick={() => logoInput.current?.click()}
                  >
                    <Upload size={15} /> Replace Logo
                  </button>
                </section>
              </div>
            )}

            {activeTab === "Tax & Billing" && (
              <section className="sys-card sys-settings-card">
                <div className="sys-section-heading">
                  <div>
                    <h2>Tax & Billing</h2>
                    <p>Configure currency, taxes and receipt details.</p>
                  </div>
                  <Receipt size={23} />
                </div>

                <div className="sys-form-grid">
                  <label className="sys-field">
                    <span>Store Currency</span>
                    <select
                      value={form.currency}
                      onChange={(event) => update("currency", event.target.value)}
                    >
                      <option value="LKR">LKR - Sri Lankan Rupee</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="INR">INR - Indian Rupee</option>
                    </select>
                  </label>

                  {field("Tax Rate (%)", "taxRate", "18", "number")}
                </div>

                <div className="sys-toggle-list">
                  {toggle(
                    "Enable Tax",
                    "Apply the configured tax rate to billing.",
                    "taxEnabled"
                  )}
                </div>

                <label className="sys-field sys-receipt-field">
                  <span>Receipt Footer Message</span>
                  <textarea
                    rows={3}
                    value={form.receiptFooter}
                    onChange={(event) =>
                      update("receiptFooter", event.target.value)
                    }
                  />
                </label>
              </section>
            )}

            {activeTab === "Users & Permissions" && (
              <section className="sys-card sys-settings-card">
                <div className="sys-section-heading">
                  <div>
                    <h2>Users & Permissions</h2>
                    <p>Configure administrator account preferences.</p>
                  </div>
                  <UserCog size={23} />
                </div>

                <div className="sys-form-grid">
                  {field("Username", "username", "Enter username")}

                  <label className="sys-field">
                    <span>Role</span>
                    <select
                      value={form.role}
                      onChange={(event) => update("role", event.target.value)}
                    >
                      <option>Administrator</option>
                      <option>Manager</option>
                      <option>Cashier</option>
                      <option>Inventory Staff</option>
                    </select>
                  </label>
                </div>

                <div className="sys-permission-note">
                  <strong>Account permissions</strong>
                  <p>
                    Role changes here are a visual prototype. Actual permissions
                    must be enforced by your backend before use.
                  </p>
                </div>
              </section>
            )}

            {activeTab === "Backup & Security" && (
              <section className="sys-card sys-settings-card">
                <div className="sys-section-heading">
                  <div>
                    <h2>Backup & Security</h2>
                    <p>Review backup preferences and account security options.</p>
                  </div>
                  <ShieldCheck size={23} />
                </div>

                <div className="sys-toggle-list">
                  {toggle(
                    "Automatic Backup",
                    "Enable the preference for scheduled backups.",
                    "autoBackup"
                  )}
                  {toggle(
                    "Two-Factor Authentication",
                    "Enable the preference for an additional sign-in step.",
                    "twoFactor"
                  )}
                  {toggle(
                    "Low Stock Alerts",
                    "Show alerts when products need restocking.",
                    "lowStockAlerts"
                  )}
                </div>

                <div className="sys-form-grid sys-timeout-field">
                  <label className="sys-field">
                    <span>Session Timeout</span>
                    <select
                      value={form.sessionTimeout}
                      onChange={(event) =>
                        update("sessionTimeout", event.target.value)
                      }
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="120">120 minutes</option>
                    </select>
                  </label>
                </div>

                <div className="sys-permission-note">
                  Backup scheduling and security enforcement need backend
                  implementation. These controls currently change the UI only.
                </div>
              </section>
            )}

            <div className="sys-form-footer">
              <button
                type="button"
                className="sys-reset-button"
                onClick={resetChanges}
              >
                <RotateCcw size={16} /> Reset Changes
              </button>

              <button type="submit" className="sys-save-button">
                <Save size={16} /> Save Changes
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Settings;