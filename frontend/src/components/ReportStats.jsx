
import {
  Banknote,
  Activity,
  Calculator,
  PiggyBank,
} from "lucide-react";

const reports = [
  {
    title: "Total Expenses",
    amount: "Rs. 1,3582,250.25",
    change: "+15.2%",
    color: "#4968ff",
    icon: Banknote,
  },
  {
    title: "Total Revenue",
    amount: "Rs. 1,584,652",
    change: "+12.5%",
    color: "#0bb632",
    icon: Activity,
  },
  {
    title: "Net Profit",
    amount: "Rs. 1,884,652",
    change: "+11.5%",
    color: "#ff981c",
    icon: Calculator,
  },
  {
    title: "Gross Profit",
    amount: "Rs. 1,584.05",
    change: "+2.5%",
    color: "#f3131b",
    icon: PiggyBank,
  },
];

export default function ReportStats() {
  return (
    <section className="report-stats">
      {reports.map(({ title, amount, change, color, icon: Icon }) => (
        <article className="report-stat-card" key={title}>
          <div className="report-stat-top">
            <div
              className="report-stat-icon"
              style={{ backgroundColor: color }}
            >
              <Icon size={26} color="white" strokeWidth={2.5} />
            </div>

            <span className="change-badge">{change}</span>
          </div>

          <div className="report-stat-title">{title}</div>
          <div className="report-stat-amount">{amount}</div>
        </article>
      ))}
    </section>
  );
}
