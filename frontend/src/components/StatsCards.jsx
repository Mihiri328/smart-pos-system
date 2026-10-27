
import {
  UsersRound,
  UserRoundPlus,
  UserRoundCheck,
} from "lucide-react";

const stats = [
  {
    title: "Total Customer",
    value: "1,234",
    icon: UsersRound,
  },
  {
    title: "New This Month",
    value: "56",
    icon: UserRoundPlus,
  },
  {
    title: "Active Accounts",
    value: "1,178",
    icon: UserRoundCheck,
  },
];

export default function StatsCards() {
  return (
    <section className="stats-grid">
      {stats.map(({ title, value, icon: Icon }) => (
        <article className="stat-card" key={title}>
          <Icon
            className="stat-icon"
            size={38}
            strokeWidth={2.8}
          />

          <div className="stat-info">
            <h3>{title}</h3>
            <p>{value}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
