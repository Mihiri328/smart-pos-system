
export default function ReportsChart() {
  const verticalLines = Array.from({ length: 17 }, (_, i) => 64 + i * 34);
  const horizontalLines = Array.from({ length: 7 }, (_, i) => 24 + i * 34);

  return (
    <section className="revenue-chart-card">
      <div className="chart-heading">
        <div>
          <h3>Revenue vs Expenses</h3>
          <p>Performance Tracking for Current Month</p>
        </div>

        <div className="chart-legend">
          <span><i className="legend-revenue" />Revenue</span>
          <span><i className="legend-expenses" />Expenses</span>
        </div>
      </div>

      <div className="chart-plot">
        <svg
          viewBox="0 0 680 215"
          preserveAspectRatio="none"
          role="img"
          aria-label="Illustrative revenue and expenses trend chart"
        >
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#183cb5" stopOpacity=".09" />
              <stop offset="100%" stopColor="#183cb5" stopOpacity="0" />
            </linearGradient>
          </defs>

          {verticalLines.map((x) => (
            <line
              key={`v${x}`}
              x1={x}
              y1="0"
              x2={x}
              y2="190"
              stroke="#e2e7f1"
              strokeWidth="1"
            />
          ))}

          {horizontalLines.map((y) => (
            <line
              key={`h${y}`}
              x1="0"
              y1={y}
              x2="680"
              y2={y}
              stroke="#e2e7f1"
              strokeWidth="1"
            />
          ))}

          <path
            d="M0 150 C55 132 92 127 140 134 S230 118 275 84 S357 48 408 99 S493 142 540 93 S605 9 635 -8 L680 -8 L680 190 L0 190 Z"
            fill="url(#revenueFill)"
          />

          <path
            d="M0 150 C55 132 92 127 140 134 S230 118 275 84 S357 48 408 99 S493 142 540 93 S605 9 635 -8"
            fill="none"
            stroke="#142fa7"
            strokeWidth="2.2"
          />

          <path
            d="M0 166 C55 155 93 152 140 159 S231 150 275 135 S355 117 408 145 S492 177 540 147 S620 78 680 102"
            fill="none"
            stroke="#ff2424"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />

          <g fill="#818595" fontSize="8">
            <text x="18" y="202">WK 1</text>
            <text x="177" y="202">WK 2</text>
            <text x="337" y="202">WK 3</text>
            <text x="496" y="202">WK 4</text>
            <text x="646" y="202">WK 5</text>
          </g>
        </svg>
      </div>
    </section>
  );
}

