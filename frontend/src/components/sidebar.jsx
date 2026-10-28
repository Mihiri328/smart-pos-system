
import {
  Store,
  ShoppingCart,
  Package,
  Warehouse,
  UserRound,
  ClipboardList,
  UsersRound,
  ChartNoAxesColumn,
  ChartPie,
  Settings,
  LogOut,
  X,
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", icon: Store },
  { label: "POS Billing", icon: ShoppingCart },
  { label: "Products Management", icon: Package },
  { label: "Inventory", icon: Warehouse },
  { label: "Suppliers Management", icon: UserRound },
  { label: "Purchase Orders", icon: ClipboardList },
  { label: "Customer Management", icon: UsersRound },
  { label: "Sales History", icon: ChartNoAxesColumn },
  { label: "Reports", icon: ChartPie },
  { label: "Settings", icon: Settings },
  { label: "Logout", icon: LogOut },
];

export default function Sidebar({
  activeMenu,
  setActiveMenu,
  mobileMenu,
  setMobileMenu,
}) {
  return (
    <>
      {mobileMenu && (
        <button
          className="mobile-overlay"
          onClick={() => setMobileMenu(false)}
          aria-label="Close navigation"
        />
      )}

      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <ShoppingCart size={49} strokeWidth={2.8} />
            <span className="brand-dot dot-one" />
            <span className="brand-dot dot-two" />
          </div>

          <div className="brand-copy">
            <h2>Smart POS</h2>
            <p>AI powered System</p>
          </div>

          <button
            className="close-menu"
            onClick={() => setMobileMenu(false)}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${
                activeMenu === label ? "active" : ""
              }`}
              onClick={() => {
                setActiveMenu(label);
                setMobileMenu(false);
              }}
            >
              <Icon size={25} strokeWidth={2.7} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
