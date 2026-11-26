
const express = require("express");
const router = express.Router();

const db = require("../config/database");
const authenticate = require("../middleware/authenticate");


// Get all customers
router.get("/", authenticate, async (req, res, next) => {
  try {
    const [customers] = await db.query(`
      SELECT
        c.*,
        COALESCE(SUM(o.amount), 0) AS total_spent
      FROM customers c
      LEFT JOIN orders o ON o.customer_id = c.id
      GROUP BY c.id
      ORDER BY c.id DESC
    `);

    res.json(customers);
  } catch (error) {
    next(error);
  }
});


// Add a new customer
router.post("/", authenticate, async (req, res, next) => {
  try {
    const { name, phone, email, total_spent, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Customer name is required.",
      });
    }

    const spent = Number(total_spent || 0);

    const [result] = await db.query(
      `INSERT INTO customers
       (name, phone, email, total_spent, status)
       VALUES (?, ?, ?, ?, ?)`,
      [
        name.trim(),
        phone || null,
        email || null,
        spent,
        status || "Active",
      ]
    );

    res.status(201).json({
      message: "Customer added successfully.",
      customerId: result.insertId,
    });
  } catch (error) {
    next(error);
  }
});


// Update customer
router.put("/:id", authenticate, async (req, res, next) => {
  try {
    const { name, phone, email, total_spent, status } = req.body;
    const { id } = req.params;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Customer name is required.",
      });
    }

    let query;
    let values;

    if (total_spent !== undefined) {
      query = `
        UPDATE customers
        SET name = ?, phone = ?, email = ?, total_spent = ?, status = ?
        WHERE id = ?
      `;

      values = [
        name.trim(),
        phone || null,
        email || null,
        Number(total_spent),
        status || "Active",
        id,
      ];
    } else {
      query = `
        UPDATE customers
        SET name = ?, phone = ?, email = ?, status = ?
        WHERE id = ?
      `;

      values = [
        name.trim(),
        phone || null,
        email || null,
        status || "Active",
        id,
      ];
    }

    const [result] = await db.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Customer not found.",
      });
    }

    res.json({
      message: "Customer updated successfully.",
    });
  } catch (error) {
    next(error);
  }
});


// Delete customer
router.delete("/:id", authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM customers WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Customer not found.",
      });
    }

    res.json({
      message: "Customer deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
