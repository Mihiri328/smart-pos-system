
import { useState } from "react";
import { Bell, Search, FileDown, Filter } from "lucide-react";

export default function ReportsHeader() {
  const [query, setQuery] = useState("");
  const [dateRange, setDateRange] = useState("Oct 1, 2026 - Oct 31, 2026");

  function exportReport(format) {
    const content =
      format === "CSV"
        ? "Report,Value\nTotal Expenses,13582250.25\nTotal Revenue,1584652\nNet Profit,1884652\nGross Profit,1584.05"
        : "Smart POS - Operational Reports\nTotal Expenses: Rs. 1,358,250.25\nTotal Revenue: Rs. 1,584,652\nNet Profit: Rs. 1,884,652\nGross Profit: Rs. 1,584.05";

    const blob = new Blob([content], {
      type: format === "CSV" ? "text/csv" : "text/plain",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `operational-report.${format === "CSV" ? "csv" : "txt"}`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <header className="reports-header">
      <div className="reports-header-top">
        <h1>Operational Reports</h1>

        <div className="report-search">
          <input
            placeholder="Search anything ..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Search size={23} />
        </div>

        <button className="report-notification" aria-label="Notifications">
          <Bell size={22} />
          <span>4</span>
        </button>
      </div>

      <div className="reports-toolbar">
        <div className="date-filter">
          <input
            aria-label="Report date range"
            value={dateRange}
            onChange={(event) => setDateRange(event.target.value)}
          />
          <button
            aria-label="Filter report"
            onClick={() => window.alert(`Selected period: ${dateRange}`)}
          >
            <Filter size={15} />
          </button>
        </div>

        <div className="export-buttons">
          <button
            className="export-btn pdf-btn"
            onClick={() => exportReport("PDF")}
          >
            <FileDown size={25} />
            Export PDF
          </button>

          <button
            className="export-btn excel-btn"
            onClick={() => exportReport("CSV")}
          >
            Export Excel
          </button>
        </div>
      </div>
    </header>
  );
}
