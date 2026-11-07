const db = require("../config/database");

function makeOrderNo() {
  return `PO-${String(Math.floor(1000 + Math.random() * 9000))}`;
}

async function createOrder(req, res) {
  const { items, discount = 0, payment_method = "Cash", amount_paid } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Please add at least one item." });
  }

  const normalized = new Map();
  for (const row of items) {
    const itemId = Number(row.item_id);
    const quantity = Number(row.quantity);
    if (!Number.isInteger(itemId) || itemId <= 0 ||
        !Number.isInteger(quantity) || quantity <= 0) {
      return res.status(400).json({
        message: "Each order item must have a valid item_id and positive whole-number quantity."
      });
    }
    normalized.set(itemId, (normalized.get(itemId) || 0) + quantity);
  }

  const safeDiscount = Number(discount);
  const safePaid = Number(amount_paid);
  if (!Number.isFinite(safeDiscount) || safeDiscount < 0 ||
      !Number.isFinite(safePaid) || safePaid < 0) {
    return res.status(400).json({ message: "Invalid discount or payment amount." });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const ids = [...normalized.keys()];
    const placeholders = ids.map(() => "?").join(",");
    const [stockRows] = await connection.query(
      `SELECT item_id, item_name, unit_price, quantity
       FROM item
       WHERE item_id IN (${placeholders})
       FOR UPDATE`,
      ids
    );

    const stockById = new Map(stockRows.map((row) => [Number(row.item_id), row]));
    const unavailableItems = [];

    for (const [itemId, requestedQty] of normalized.entries()) {
      const found = stockById.get(itemId);
      if (!found) {
        unavailableItems.push({
          item_id: itemId,
          item_name: `Item ${itemId}`,
          requested_quantity: requestedQty,
          available_quantity: 0,
          reason: "ITEM_NOT_FOUND"
        });
      } else if (Number(found.quantity) < requestedQty) {
        unavailableItems.push({
          item_id: itemId,
          item_name: found.item_name,
          requested_quantity: requestedQty,
          available_quantity: Number(found.quantity),
          reason: "INSUFFICIENT_STOCK"
        });
      }
    }

    if (unavailableItems.length) {
      await connection.rollback();
      return res.status(409).json({
        message: "Order cannot be completed because one or more items are unavailable or have insufficient stock.",
        unavailableItems
      });
    }

    let subtotal = 0;
    const orderLines = [];
    for (const [itemId, quantity] of normalized.entries()) {
      const item = stockById.get(itemId);
      const unitPrice = Number(item.unit_price);
      const lineTotal = unitPrice * quantity;
      subtotal += lineTotal;
      orderLines.push({ itemId, quantity, unitPrice, lineTotal });
    }

    const finalDiscount = Math.min(safeDiscount, subtotal);
    const totalAmount = Number((subtotal - finalDiscount).toFixed(2));
    if (safePaid < totalAmount) {
      await connection.rollback();
      return res.status(400).json({
        message: `Insufficient payment. Amount due is ${totalAmount.toFixed(2)}.`
      });
    }

    // Four-digit random suffix. Retry if the generated order number already exists.
    let orderNo;
    let inserted = false;
    const now = new Date();

const currentDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
}).format(now).replace(/\//g, "-");
    for (let attempt = 0; attempt < 10 && !inserted; attempt += 1) {
      orderNo = makeOrderNo();
      try {
        const [result] = await connection.execute(
          `INSERT INTO orders
           (order_no, date, subtotal, discount_price, amount, payment_method, amount_paid, change_amount)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [orderNo, currentDate, subtotal, finalDiscount, totalAmount,
           payment_method, safePaid, Number((safePaid - totalAmount).toFixed(2))]
        );
        const orderId = result.insertId;
        for (const line of orderLines) {
          await connection.execute(
            `INSERT INTO order_detail
             (order_id, item_id, quantity, unit_price, amount)
             VALUES (?, ?, ?, ?, ?)`,
            [orderId, line.itemId, line.quantity, line.unitPrice, line.lineTotal]
          );
          const [updateResult] = await connection.execute(
            `UPDATE item
             SET quantity = quantity - ?
             WHERE item_id = ? AND quantity >= ?`,
            [line.quantity, line.itemId, line.quantity]
          );
          if (updateResult.affectedRows !== 1) {
            throw new Error("Stock changed while completing the order. Please retry.");
          }
        }

        await connection.commit();
        inserted = true;

        return res.status(201).json({
          message: "Order completed successfully.",
          order: {
            order_id: orderId,
            order_no: orderNo,
            subtotal,
            discount: finalDiscount,
            total_amount: totalAmount,
            payment_method,
            amount_paid: safePaid,
            change_amount: Number((safePaid - totalAmount).toFixed(2))
          }
        });
      } catch (error) {
        // Retry only for a duplicate order number; other errors abort the transaction.
        if (error.code === "ER_DUP_ENTRY" && attempt < 9) continue;
        throw error;
      }
    }

    throw new Error("Unable to generate a unique order number. Please try again.");
  } catch (error) {
    await connection.rollback();
    console.error("createOrder error:", error);
    return res.status(500).json({
      message: error.message || "Failed to complete order."
    });
  } finally {
    connection.release();
  }
}

module.exports = { createOrder };