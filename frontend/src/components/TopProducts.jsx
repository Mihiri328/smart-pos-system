
const products = [
  {
    rank: 1,
    name: "Dilmah Premium Tea 500 g",
    category: "Groceries",
    units: 1243,
    revenue: "Rs. 186,000",
  },
  {
    rank: 2,
    name: "Munchee Super Cream Cracker",
    category: "Groceries",
    units: 1243,
    revenue: "Rs. 186,000",
  },
  {
    rank: 3,
    name: "Samba Rice 1 kg",
    category: "Groceries",
    units: 985,
    revenue: "Rs. 125,000",
  },
];

export default function TopProducts() {
  return (
    <section className="top-products-card">
      <h3>Top Selling Products</h3>

      <div className="products-table-scroll">
        <table className="products-table">
          <thead>
            <tr>
              <th>RANK</th>
              <th>Product Name</th>
              <th>CATEGORY</th>
              <th>UNITS SOLD</th>
              <th>REVENUE</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product.rank}>
                <td>
                  <span className="rank-circle">{product.rank}</span>
                </td>
                <td>{product.name}</td>
                <td>
                  <span className="category-label">{product.category}</span>
                </td>
                <td>{product.units}</td>
                <td className="revenue-value">{product.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
