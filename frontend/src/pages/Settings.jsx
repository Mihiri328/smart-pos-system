import { useEffect, useState } from "react";
import {
  LayoutDashboard, ShoppingCart, Package, Warehouse, Truck,
  ClipboardList, Users, History, ChartNoAxesCombined,
  Settings as SettingsIcon, LogOut, Search, Bell, Menu, X,
  Store, Receipt, ShieldCheck,  Save, RotateCcw,
  Download, Database, RefreshCw,Eye, EyeOff

} from "lucide-react";

import logo from "../img/black logo.png";
import "../style.css";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard, page: "dashboard" },
  { label: "POS Billing", icon: ShoppingCart, page: "billing" },
  { label: "Products Management", icon: Package, page: "products" },
  { label: "Inventory", icon: Warehouse, page: "inventory", count: 5 },
  { label: "Suppliers Management", icon: Truck, page: "suppliers" },
   { label: "Purchase Orders", page: "purchase_orders", icon: ClipboardList },
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
  autoBackup: true,
  lowStockAlerts: true,
};

const tabs = [
  { label: "My Profile", icon: Users },
  { label: "Store Info", icon: Store },
  { label: "Tax & Billing", icon: Receipt },
  { label: "Backup & Security", icon: ShieldCheck },
];

function Settings({ currentPage, onNavigate, onLogout, currentUser }) {
  const [activeTab, setActiveTab] = useState("My Profile");
  const [form, setForm] = useState(initialForm);
  const [savedForm, setSavedForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [backups, setBackups] = useState([]);
  const [backupLoading, setBackupLoading] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false); 
  const [profile, setProfile] = useState({
  fullName: "",
  profilePhoto: null,
}); 
const [profileLoading, setProfileLoading] = useState(false);
const [accountForm, setAccountForm] = useState({
  currentPassword: "",
  newUsername: currentUser?.username || "",
  newPassword: "",
  confirmPassword: "",
});

const [accountLoading, setAccountLoading] = useState(false);
const [showCurrentPassword, setShowCurrentPassword] = useState(false);
const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const storeLogo = logo;
  

  useEffect(() => {
  const fetchSettings = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/settings", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load settings.");
      }

      const settings = data.settings;

      const loadedForm = {
        ...initialForm,
        storeName: settings.store_name ?? "",
        registrationNumber: settings.registration_number ?? "",
        address: settings.address ?? "",
        phone: settings.phone ?? "",
        whatsapp: settings.whatsapp ?? "",
        currency: settings.currency ?? "LKR",
        taxEnabled: Boolean(settings.tax_enabled),
        taxRate: String(settings.tax_rate ?? 18),
        autoBackup: Boolean(settings.auto_backup),
        lowStockAlerts: Boolean(settings.low_stock_alerts),
      };

      setForm(loadedForm);
      setSavedForm(loadedForm);
    } catch (error) {
      setMessage(error.message);
    }
  };

  fetchSettings();
}, []);

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/settings/profile",
        { credentials: "include" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load profile.");
      }

      setProfile({
        fullName: data.profile.fullName || "",
        profilePhoto: data.profile.profilePhoto || null,
      });
    } catch (error) {
      setMessage(error.message);
    }
  };

  fetchProfile();
}, []);

useEffect(() => {
  setAccountForm((prev) => ({
    ...prev,
    newUsername: currentUser?.username || "",
  }));
}, [currentUser]);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setMessage("");
  };

  const saveChanges = async (event) => {
  event?.preventDefault();

  try {
    const response = await fetch("http://localhost:5000/api/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        storeName: form.storeName,
        registrationNumber: form.registrationNumber,
        address: form.address,
        phone: form.phone,
        whatsapp: form.whatsapp,
        currency: form.currency,
        taxEnabled: form.taxEnabled,
        taxRate: form.taxRate,
        autoBackup: form.autoBackup,
        lowStockAlerts: form.lowStockAlerts,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to save settings.");
    }

    setSavedForm({ ...form });
    setMessage("Settings saved successfully.");
  } catch (error) {
    setMessage(error.message);
  }
};

const handleSaveProfile = async () => {
  setProfileLoading(true);
  setMessage("");

  try {
    let photoData = profile.profilePhoto;

    if (profile.profilePhoto instanceof File) {
      if (profile.profilePhoto.size > 5 * 1024 * 1024) {
        throw new Error("Profile picture must be smaller than 5MB.");
      }

      photoData = await new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(
          new Error("Failed to read image.")
        );

        reader.readAsDataURL(profile.profilePhoto);
      });
    }

    const response = await fetch(
      "http://localhost:5000/api/settings/profile",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fullName: profile.fullName,
          profilePhoto: photoData instanceof File ? null : photoData,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update profile.");
    }

    setProfile({
      fullName: profile.fullName,
      profilePhoto: photoData,
    });

    setMessage("Profile updated successfully.");
  } catch (error) {
    setMessage(error.message);
  } finally {
    setProfileLoading(false);
  }
};

const handleSaveAccount = async () => {
  setMessage("");

  if (!accountForm.currentPassword) {
    setMessage("Please enter your current password.");
    return;
  }

  if (
    accountForm.newPassword &&
    accountForm.newPassword !== accountForm.confirmPassword
  ) {
    setMessage("New password and confirmation do not match.");
    return;
  }

  setAccountLoading(true);

  try {
    const response = await fetch(
      "http://localhost:5000/api/settings/account",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: accountForm.currentPassword,
          newUsername: accountForm.newUsername.trim(),
          newPassword: accountForm.newPassword,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to update account.");
    }

    setMessage("Account details updated successfully.");

    setAccountForm((prev) => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  } catch (error) {
    setMessage(error.message);
  } finally {
    setAccountLoading(false);
  }
};

  const resetChanges = () => {
    setForm({ ...savedForm });
    setMessage("Unsaved changes have been reset.");
  };

  // Fetch backup history
const fetchBackups = async () => {
  setBackupLoading(true);

  try {
    const response = await fetch(
      "http://localhost:5000/api/settings/backups",
      { credentials: "include" }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load backups.");
    }

    setBackups(data.backups || []);
  } catch (error) {
    setMessage(error.message);
  } finally {
    setBackupLoading(false);
  }
};

// Create a manual backup
const handleCreateBackup = async () => {
  setCreatingBackup(true);
  setMessage("");

  try {
    const response = await fetch(
      "http://localhost:5000/api/settings/backups",
      {
        method: "POST",
        credentials: "include",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to create backup.");
    }

    setMessage(data.message || "Backup created successfully.");
    await fetchBackups();
  } catch (error) {
    setMessage(error.message);
  } finally {
    setCreatingBackup(false);
  }
};

// Download a selected backup
const handleDownloadBackup = async (filename) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/settings/backups/${encodeURIComponent(filename)}/download`,
      { credentials: "include" }
    );

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || "Failed to download backup.");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    setMessage(error.message);
  }
};

// Format backup file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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

        <div className="sp-help-card">
          <strong>Need help?</strong>
            <p>
              Check your stock and sales insights to make better decisions.
            </p>
        </div>

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
              <p>Configure your store details, tax rules and system security.</p>
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
            >
              <Bell size={20} />
            </button>

            <div className="sp-profile">
            <div className="sp-avatar">O</div>
            <div>
             <strong>Owner</strong>
              <span>Store Owner</span>
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

                    if (tab.label === "Backup & Security") {
                    fetchBackups();
                    }
                  }}
                >
                  <Icon size={17} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <form className="sys-form" onSubmit={saveChanges}>
            {activeTab === "My Profile" && (
  <section className="sys-card sys-settings-card">
    <div className="sys-section-heading">
      <div>
        <h2>My Profile</h2>
        <p>Manage your personal profile details.</p>
      </div>
      <Users size={23} />
    </div>

    <div className="sys-form-grid">
      <label className="sys-field">
        <span>Full Name</span>
        <input
          type="text"
          value={profile.fullName}
          placeholder="Enter your full name"
          onChange={(event) =>
            setProfile({
              ...profile,
              fullName: event.target.value,
            })
          }
        />
      </label>

      <label className="sys-field">
  <span>Profile Picture</span>
  <input
    type="file"
    accept="image/*"
    onChange={(event) => {
      const file = event.target.files[0];
      if (file) {
        setProfile({
          ...profile,
          profilePhoto: file,
        });
      }
    }}
  />
</label>

    {profile.profilePhoto && (
  <div style={{ marginTop: "15px" }}>
    <img
      src={
        profile.profilePhoto instanceof File
          ? URL.createObjectURL(profile.profilePhoto)
          : profile.profilePhoto
      }
      alt="Profile Preview"
      style={{
        width: "100px",
        height: "100px",
        borderRadius: "50%",
        objectFit: "cover",
      }}
    />
  </div>
)}
    </div>

    <button
      type="button"
      className="sys-save-button"
      onClick={handleSaveProfile}
      disabled={profileLoading}
    >
      <Save size={16} />
      {profileLoading ? "Saving..." : "Save Profile"}

    </button>

<div className="sys-account-security">
  <div className="sys-section-heading">
    <div>
      <h2>Account Security</h2>
      <p>Change your login username or password.</p>
    </div>
    <ShieldCheck size={23} />
  </div>

  <div className="sys-form-grid">
    <label className="sys-field">
      <span>Current Password</span>
      <div className="sys-password-input">
  <input
    type={showCurrentPassword ? "text" : "password"}
    value={accountForm.currentPassword}
    onChange={(e) =>
      setAccountForm({ ...accountForm, currentPassword: e.target.value })
    }
    placeholder="Enter current password"
  />

  <button
    type="button"
    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
  >
    {showCurrentPassword ? <Eye size={18} /> : <EyeOff size={18} />}
  </button>
  </div>
    </label>

    <label className="sys-field">
      <span>New Username</span>
      <input
        type="text"
        value={accountForm.newUsername}
        onChange={(e) =>
          setAccountForm({ ...accountForm, newUsername: e.target.value })
        }
        placeholder="Enter new username"
      />
    </label>

    <label className="sys-field">
      <span>New Password</span>
      <div className="sys-password-input">
  <input
    type={showNewPassword ? "text" : "password"}
    value={accountForm.newPassword}
    onChange={(e) =>
      setAccountForm({ ...accountForm, newPassword: e.target.value })
    }
    placeholder="Enter new password"
  />

  <button
    type="button"
    onClick={() => setShowNewPassword(!showNewPassword)}
  >
    {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
  </button>
  </div>
    </label>

    <label className="sys-field">
      <span>Confirm New Password</span>
      <div className="sys-password-input">
  <input
    type={showConfirmPassword ? "text" : "password"}
    value={accountForm.confirmPassword}
    onChange={(e) =>
      setAccountForm({ ...accountForm, confirmPassword: e.target.value })
    }
    placeholder="Confirm new password"
  />

  <button
    type="button"
    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
  >
    {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
  </button>
  </div>
    </label>
  </div>

  <button
    type="button"
    className="sys-save-button"
    onClick={handleSaveAccount}
    disabled={accountLoading}
  >
    <ShieldCheck size={16} />
    {accountLoading ? "Updating..." : "Update Account"}
  </button>
</div>

  </section>
)}
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

                  <div className="sys-logo-preview">
                  <img src={storeLogo} alt="Store logo" />
                  </div>

                  <p>Default Smart POS store logo.</p>
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
                </div>


               
<div
  className="sys-backup-panel"
  style={{
    marginTop: "24px",
    padding: "20px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "15px",
      flexWrap: "wrap",
    }}
  >
    <div>
      <h3 style={{ margin: "0 0 6px", color: "#06214b" }}>
        Database Backups
      </h3>
      <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
        Create a backup now or download an existing backup file.
      </p>
    </div>

    <button
      type="button"
      onClick={handleCreateBackup}
      disabled={creatingBackup}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "11px 16px",
        background: "#06214b",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: creatingBackup ? "not-allowed" : "pointer",
      }}
    >
      <Database size={17} />
      {creatingBackup ? "Creating..." : "Create Backup Now"}
    </button>
  </div>

  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "12px",
      marginTop: "28px",
      flexWrap: "wrap",
    }}
  >
    <div>
      <h3 style={{ margin: "0 0 6px", color: "#06214b" }}>
        Backup History
      </h3>
      <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
        Backups are retained for 30 days.
      </p>
    </div>

    <button
      type="button"
      onClick={fetchBackups}
      disabled={backupLoading}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "7px",
        padding: "9px 14px",
        background: "white",
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        cursor: "pointer",
      }}
    >
      <RefreshCw size={16} />
      {backupLoading ? "Loading..." : "Refresh"}
    </button>
  </div>

  {backupLoading ? (
    <p style={{ color: "#64748b", marginTop: "20px" }}>
      Loading backup history...
    </p>
  ) : backups.length === 0 ? (
    <p style={{ color: "#64748b", marginTop: "20px" }}>
      No backups found yet.
    </p>
  ) : (
    <div style={{ marginTop: "15px" }}>
      {backups.map((backup) => (
        <div
          key={backup.filename}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
            padding: "15px 0",
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              minWidth: 0,
            }}
          >
            <Database size={21} color="#2563eb" />

            <div style={{ minWidth: 0 }}>
              <strong style={{ display: "block", overflowWrap: "anywhere" }}>
                {backup.filename}
              </strong>
              <span style={{ color: "#64748b", fontSize: "12px" }}>
                {new Date(backup.createdAt).toLocaleString()} ·{" "}
                {formatFileSize(backup.size)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleDownloadBackup(backup.filename)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              padding: "9px 13px",
              color: "#2563eb",
              background: "white",
              border: "1px solid #bfdbfe",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            <Download size={16} />
            Download
          </button>
        </div>
      ))}
    </div>
  )}
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