const db = require("../config/database");

async function getItems(req, res) {
  try {
    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "").trim();

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push("item_name LIKE ?");
      params.push(`%${search}%`);
    }

    if (category && category !== "All") {
      conditions.push("category = ?");
      params.push(category);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const [items] = await db.execute(
      `SELECT item_id, item_name, category, unit, unit_price, quantity, image_path
       FROM item ${whereClause}
       ORDER BY item_name ASC`,
      params
    );

    res.json({ items });
  } catch (error) {
    console.error("getItems error:", error);
    res.status(500).json({ message: "Failed to retrieve items." });
  }
}

async function getCategories(req, res) {
  try {
    const [rows] = await db.execute(
      `SELECT DISTINCT category
       FROM item
       WHERE category IS NOT NULL AND category <> ''
       ORDER BY category ASC`
    );
    res.json({ categories: rows.map((row) => row.category) });
  } catch (error) {
    console.error("getCategories error:", error);
    res.status(500).json({ message: "Failed to retrieve categories." });
  }
}

module.exports = { getItems, getCategories };