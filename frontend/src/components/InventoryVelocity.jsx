
export default function InventoryVelocity() {
  return (
    <section className="inventory-card">
      <h3>Inventory Velocity</h3>

      <div className="velocity-item">
        <div className="velocity-heading">
          <strong>Fast Moving Items</strong>
          <span>58% of stock</span>
        </div>

        <div className="velocity-track">
          <div className="velocity-fill fast-fill" />
        </div>

        <p>Items clearing in &lt; 46 days</p>
      </div>

      <div className="velocity-item">
        <div className="velocity-heading">
          <strong>Slow Moving Items</strong>
          <span>42% of stock</span>
        </div>

        <div className="velocity-track">
          <div className="velocity-fill slow-fill" />
        </div>

        <p>Items clearing in &lt; 7 days</p>
      </div>
    </section>
  );
}
