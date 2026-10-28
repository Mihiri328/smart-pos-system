
import { useState } from "react";
import "./Settings.css";

const menuItems = [
  { icon: "▤", label: "Dashboard" },
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

function Settings() {
  const [activeMenu, setActiveMenu] = useState("Settings");
  const [activeTab, setActiveTab] = useState("Store Info");
  const [form, setForm] = useState(initialForm);
  const [logo, setLogo] = useState("");
  const [message, setMessage] = useState("");
  const [savedForm, setSavedForm] = useState(initialForm);

  const update = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
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

  const tabs = [
    { label: "Store Info", icon: "▣" },
    { label: "Tax & Billing", icon: "▤" },
    { label: "Users & Permissions", icon: "♙" },
    { label: "Backup & Security", icon: "⚙" },
  ];

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

  const handleLogo = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/svg+xml"].includes(file.type)) {
      setMessage("Please select a JPEG, PNG, or SVG image.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setMessage("Logo must be smaller than 2 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setLogo(String(reader.result));
      setMessage("Logo preview updated. Save changes to keep the form state.");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="sys-app">
      <aside className="sys-sidebar">
        <div className="sys-brand">
          <img
            src="/src/img/Dark%20logo.jpeg"
            alt="Smart POS Logo"
            className="sys-brand-logo"
          />
        </div>


        <nav className="sys-menu">
          {menuItems.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`sys-menu-item ${
                activeMenu === item.label ? "selected" : ""
              }`}
              onClick={() => {
                setActiveMenu(item.label);
                if (item.label !== "Settings") {
                  setMessage(
                    `${item.label} page navigation must be connected through App.jsx.`
                  );
                } else {
                  setMessage("");
                }
              }}
            >
              <span className="sys-menu-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="sys-main">
        <header className="sys-header">
          <div className="sys-heading">
            <h1>System Settings</h1>
            <p>Configure your store details, tax rules and user access.</p>
          </div>

          <div className="sys-header-actions">
            <label className="sys-search">
              <input
                placeholder="Search anything ..."
                aria-label="Search settings"
                onChange={(event) => {
                  const value = event.target.value.toLowerCase();
                  const matchingTab = tabs.find((tab) =>
                    tab.label.toLowerCase().includes(value)
                  );
                  if (matchingTab && value) setActiveTab(matchingTab.label);
                }}
              />
              <span>⌕</span>
            </label>
            <button
              type="button"
              className="sys-bell"
              aria-label="Notifications"
              onClick={() => setMessage("You have 4 notifications.")}
            >
              ♟<b>4</b>
            </button>
          </div>
        </header>

        <div className="sys-subheader">
          <div className="sys-subheader-spacer" />
          <button
            type="button"
            className="sys-save-all"
            onClick={saveChanges}
          >
            Save All Changes
          </button>
        </div>

        {message && (
          <div className="sys-message" role="status">
            <span>{message}</span>
            <button type="button" onClick={() => setMessage("")}>✕</button>
          </div>
        )}

        <nav className="sys-tabs" aria-label="Settings sections">
          {tabs.map((tab) => (
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
              {tab.label}
            </button>
          ))}
        </nav>

        <form className="sys-form" onSubmit={saveChanges}>
          {activeTab === "Store Info" && (
            <div className="sys-store-layout">
              <section className="sys-card sys-business-card">
                <h2>Business Details</h2>

                <div className="sys-form-grid">
                  {field("Store Name", "storeName", "Enter name.....")}
                  {field(
                    "Registration Number",
                    "registrationNumber",
                    "PV-12345"
                  )}
                </div>

                <label className="sys-field sys-address-field">
                  <span>Address</span>
                  <textarea
                    value={form.address}
                    placeholder="No.45 galle......."
                    onChange={(event) => update("address", event.target.value)}
                    rows={4}
                  />
                </label>

                <div className="sys-form-grid sys-contact-grid">
                  {field("Phone Number", "phone", "+94....................", "tel")}
                  {field(
                    "WhatsApp SUPPORT",
                    "whatsapp",
                    "+94 ....................",
                    "tel"
                  )}
                </div>
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
                <span className="sys-section-symbol">▤</span>
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
                  <p>Configure the displayed administrator preferences.</p>
                </div>
                <span className="sys-section-symbol">♙</span>
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
                <span className="sys-section-symbol">⚙</span>
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
                  <span>Session Timeout (minutes)</span>
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
              Reset Changes
            </button>
            <button type="submit" className="sys-save-button">
              Save Changes
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default Settings;
