
const db = require("../config/database");

async function getReports(req, res) {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        message: "Please provide from and to dates."
      });
    }

    // Total Revenue
    const [revenueRows] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) AS totalRevenue
       FROM orders
       WHERE DATE(date) BETWEEN ? AND ?`,
      [from, to]
    );

    // Stock Purchases
    const [purchaseRows] = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS totalPurchases
       FROM purchase_orders
       WHERE status = 'Received'
       AND DATE(order_date) BETWEEN ? AND ?`,
      [from, to]
    );

        // Revenue vs Stock Purchases Chart
    const [chartRows] = await db.query(
      `SELECT
         report_date,
         SUM(revenue) AS revenue,
         SUM(purchases) AS purchases
       FROM (
         SELECT
           DATE(date) AS report_date,
           SUM(amount) AS revenue,
           0 AS purchases
         FROM orders
         WHERE DATE(date) BETWEEN ? AND ?
         GROUP BY DATE(date)

         UNION ALL

         SELECT
           DATE(order_date) AS report_date,
           0 AS revenue,
           SUM(total_amount) AS purchases
         FROM purchase_orders
         WHERE status = 'Received'
         AND DATE(order_date) BETWEEN ? AND ?
         GROUP BY DATE(order_date)
       ) AS daily_reports
       GROUP BY report_date
       ORDER BY report_date`,
      [from, to, from, to]
    );

        // Inventory Velocity
    const [inventoryRows] = await db.query(
      `SELECT
         i.item_id,
         i.item_name,
         i.quantity AS current_stock,
         COALESCE(SUM(
           CASE
             WHEN o.order_id IS NOT NULL THEN od.quantity
             ELSE 0
           END
         ), 0) AS units_sold
       FROM item i
       LEFT JOIN order_detail od ON od.item_id = i.item_id
       LEFT JOIN orders o
         ON o.order_id = od.order_id
         AND DATE(o.date) BETWEEN ? AND ?
       GROUP BY i.item_id, i.item_name, i.quantity`,
      [from, to]
    );

    const daysInPeriod =
      Math.floor(
        (new Date(`${to}T00:00:00Z`) - new Date(`${from}T00:00:00Z`)) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    let fastCount = 0;
    let slowCount = 0;

    inventoryRows.forEach((item) => {
      const unitsSold = Number(item.units_sold);
      const currentStock = Number(item.current_stock);

      if (unitsSold === 0) {
        slowCount++;
        return;
      }

      const averageDailySales = unitsSold / daysInPeriod;
      const daysOfStock = currentStock / averageDailySales;

      if (daysOfStock <= 7) {
        fastCount++;
      } else if (daysOfStock > 46) {
        slowCount++;
      }
    });

    const totalItems = inventoryRows.length;

    const inventoryVelocity = {
      fastCount,
      slowCount,
      totalItems,
      fastPercentage: totalItems
        ? Number(((fastCount / totalItems) * 100).toFixed(1))
        : 0,
      slowPercentage: totalItems
        ? Number(((slowCount / totalItems) * 100).toFixed(1))
        : 0
    };

    

// Top Selling Products
const [topProducts] = await db.query(
  `SELECT
     i.item_name AS name,
     i.category,
     SUM(od.quantity) AS units,
     ROUND(
       SUM(
         CASE
           WHEN order_totals.items_total > 0 THEN
             od.amount * o.amount / order_totals.items_total
           ELSE 0
         END
       ), 2
     ) AS revenue
   FROM order_detail od
   JOIN orders o
     ON od.order_id = o.order_id
   JOIN item i
     ON od.item_id = i.item_id
   JOIN (
     SELECT
       order_id,
       SUM(amount) AS items_total
     FROM order_detail
     GROUP BY order_id
   ) order_totals
     ON order_totals.order_id = o.order_id
   WHERE DATE(o.date) BETWEEN ? AND ?
   GROUP BY i.item_id, i.item_name, i.category
   ORDER BY revenue DESC
   LIMIT 10`,
  [from, to]
);



    // Cost of Goods Sold (COGS)
const [costRows] = await db.query(
  `SELECT
     COALESCE(
       SUM(s.units_sold * c.avg_unit_cost), 0
     ) AS totalCost,
     SUM(
       CASE
         WHEN c.avg_unit_cost IS NULL THEN 1
         ELSE 0
       END
     ) AS missingCostItems
   FROM (
     SELECT
       od.item_id,
       SUM(od.quantity) AS units_sold
     FROM order_detail od
     JOIN orders o ON od.order_id = o.order_id
     WHERE DATE(o.date) BETWEEN ? AND ?
     GROUP BY od.item_id
   ) s
   LEFT JOIN (
     SELECT
       pod.item_id,
       SUM(pod.received_quantity * pod.unit_cost) /
         NULLIF(SUM(pod.received_quantity), 0) AS avg_unit_cost
     FROM purchase_order_details pod
     JOIN purchase_orders po
       ON pod.purchase_order_id = po.purchase_order_id
     WHERE po.status = 'Received'
       AND DATE(po.order_date) <= ?
       AND pod.received_quantity > 0
     GROUP BY pod.item_id
   ) c ON s.item_id = c.item_id`,
  [from, to, to]
);

const totalCost = Number(costRows[0].totalCost);
const missingCostItems = Number(costRows[0].missingCostItems);

    const totalRevenue = Number(revenueRows[0].totalRevenue);
    const totalPurchases = Number(purchaseRows[0].totalPurchases);

    res.json({
  totalRevenue,
  totalPurchases,
  revenueAfterPurchases: totalRevenue - totalPurchases,
  grossProfit: missingCostItems > 0
    ? null
    : totalRevenue - totalCost,
  topProducts,
  chartData: chartRows,
  inventoryVelocity
});

  } catch (error) {
    console.error("getReports error:", error);
    res.status(500).json({
      message: "Failed to load reports."
    });
  }
}

module.exports = { getReports };
