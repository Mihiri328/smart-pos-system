
import { Bell, Menu, Search, X } from "lucide-react";

export default function Header({
  title,
  search,
  setSearch,
  setMobileMenu,
}) {
  return (
    <header className="topbar">
      <button
        className="mobile-menu"
        aria-label="Open menu"
        onClick={() => setMobileMenu(true)}
      >
        <Menu size={25} />
      </button>

      <h1>{title}</h1>

      <div className="search-box">
        <Search size={17} />

        <input
          type="text"
          placeholder="Search Customers ..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search customers"
        />

        {search && (
          <button
            className="clear-search"
            onClick={() => setSearch("")}
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="topbar-right">
        <button className="notification" aria-label="Notifications">
          <Bell size={20} />
          <span className="notification-count">4</span>
        </button>

        <div className="date-time">
          <span>May 22, 2025</span>
          <span>10.30 AM</span>
        </div>
      </div>
    </header>
  );
}
