
import ReportsHeader from "./components/ReportsHeader";
import ReportStats from "./components/ReportStats";
import ReportsChart from "./components/ReportsChart";
import TopProducts from "./components/TopProducts";
import InventoryVelocity from "./components/InventoryVelocity";

export default function ReportsPage() {
  return (
    <div className="reports-page">
      <ReportsHeader />

      <div className="reports-content">
        <ReportStats />

        <ReportsChart />

        <div className="reports-bottom-grid">
          <TopProducts />
          <InventoryVelocity />
        </div>
      </div>
    </div>
  );
}
