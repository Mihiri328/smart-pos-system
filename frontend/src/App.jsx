
import { useMemo, useState } from "react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import StatsCards from "./components/StatsCards";
import CustomerTable from "./components/CustomerTable";
import Pagination from "./components/Pagination";
import Reports from "./Reports";

import "./App.css";

const initialCustomers = [
  { id: 101, name: "Samba Rice (1kg)", category: "Grocery", email: "SK000001", phone: 75, status: "Active" },
  { id: 102, name: "Kothmale fresh milk", category: "Beverages", email: "SK010002", phone: 50, status: "Recorder" },
  { id: 103, name: "White Sugar", category: "Grocery", email: "SK010003", phone: 70, status: "Active" },
  { id: 104, name: "Cooking oil (1L)", category: "Grocery", email: "SK010004", phone: 57, status: "Active" },
  { id: 105, name: "Tea Bags (200g)", category: "Beverages", email: "SK010005", phone: 25, status: "Active" },
  { id: 106, name: "Prima Noodles", category: "Grocery", email: "SK010004", phone: 10, status: "Low Stock" },
  { id: 107, name: "Salt (400g)", category: "Grocery", email: "SK000001", phone: 10, status: "Low Stock" },
  { id: 108, name: "Surf Excel (500g)", category: "Cleaning", email: "SK010005", phone: 33, status: "Active" },
  { id: 109, name: "Chocolate Cream Biscuit", category: "Grocery", email: "SK010006", phone: 30, status: "Active" },
  { id: 110, name: "Anchor Milk Powder", category: "Beverages", email: "SK010007", phone: 65, status: "Active" },
];

export default function App() {
  const [activeMenu, setActiveMenu] = useState("Customer Management");
  const [search, setSearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [page, setPage] = useState(1);

  const [sort, setSort] = useState({
    key: "id",
    direction: "asc",
  });

  const filteredCustomers = useMemo(() => {
    const query = search.toLowerCase().trim();

    const result = initialCustomers.filter((customer) =>
      [
        customer.id,
        customer.name,
        customer.category,
        customer.email,
        customer.status,
      ].some((value) =>
        String(value).toLowerCase().includes(query)
      )
    );

    return [...result].sort((a, b) => {
      const first = a[sort.key];
      const second = b[sort.key];

      const comparison =
        typeof first === "number"
          ? first - second
          : String(first).localeCompare(String(second));

      return sort.direction === "asc"
        ? comparison
        : -comparison;
    });
  }, [search, sort]);

  const pageSize = 10;

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCustomers.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const visibleCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function handleSearch(value) {
    setSearch(value);
    setPage(1);
  }

  function changeSort(key) {
    setSort((previous) => ({
      key,
      direction:
        previous.key === key && previous.direction === "asc"
          ? "desc"
          : "asc",
    }));
  }

  return (
    <div className="app-shell">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={(menu) => {
          setActiveMenu(menu);
          setMobileMenu(false);
        }}
        mobileMenu={mobileMenu}
        setMobileMenu={setMobileMenu}
      />

      <main className="main-content">
        {activeMenu === "Customer Management" && (
          <>
            <Header
              title="Customer Management"
              search={search}
              setSearch={handleSearch}
              setMobileMenu={setMobileMenu}
            />

            <section className="dashboard-body">
              <StatsCards />

              <CustomerTable
                customers={visibleCustomers}
                sort={sort}
                changeSort={changeSort}
              />

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredCustomers.length}
                pageSize={pageSize}
                setPage={setPage}
                search={search}
              />
            </section>
          </>
        )}

        {activeMenu === "Reports" && <Reports />}

        {activeMenu !== "Reports" &&
          activeMenu !== "Customer Management" && (
            <section className="dashboard-body">
              <h1>{activeMenu}</h1>
              <p>This page is not connected yet.</p>
            </section>
          )}
      </main>
    </div>
  );
}
