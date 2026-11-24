const db = require("../config/database");

// DASHBOARD SUMMARY
async function getDashboardSummary() {
    const [rows] = await db.query(`
        SELECT
            COALESCE(SUM(
                CASE
                    WHEN DATE(date) = CURDATE()
                    THEN amount ELSE 0
                END
            ), 0) AS today_sales,

            COALESCE(SUM(
                CASE
                    WHEN YEAR(date) = YEAR(CURDATE())
                    AND MONTH(date) = MONTH(CURDATE())
                    THEN amount ELSE 0
                END
            ), 0) AS monthly_revenue,

            COUNT(
                CASE
                    WHEN DATE(date) = CURDATE()
                    THEN order_id
                END
            ) AS total_orders

        FROM orders
    `);

    // Profit uses the item's purchase cost, not its selling price.
    const [profitRows] = await db.query(`
        SELECT
            COALESCE(
                SUM(od.amount - (od.quantity * i.unit_price)),
                0
            ) AS monthly_profit
        FROM order_detail od
        INNER JOIN orders o
            ON o.order_id = od.order_id
        INNER JOIN item i
            ON i.item_id = od.item_id
        WHERE YEAR(o.date) = YEAR(CURDATE())
        AND MONTH(o.date) = MONTH(CURDATE())
    `);

    return {
        todaySales: Number(rows[0].today_sales),
        monthlyRevenue: Number(rows[0].monthly_revenue),
        totalOrders: Number(rows[0].total_orders),
        monthlyProfit: Number(profitRows[0].monthly_profit)
    };
}


// LOW STOCK PRODUCTS
async function getLowStockProducts() {
    const [rows] = await db.query(`
        SELECT
            item_id,
            item_name,
            quantity AS stock,
            reorder_level,
            CASE
                WHEN quantity <= 5 THEN 'Critical'
                ELSE 'Warning'
            END AS level
        FROM item
        WHERE quantity <= reorder_level
        ORDER BY quantity ASC
        LIMIT 10
    `);

    return rows;
}


// EXPIRING PRODUCTS
async function getExpiringProducts() {
    const [rows] = await db.query(`
        SELECT
            item_id,
            item_name,
            quantity AS stock,
            expiry_date
        FROM item
        WHERE expiry_date IS NOT NULL
        AND expiry_date BETWEEN CURDATE()
        AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        ORDER BY expiry_date ASC
        LIMIT 10
    `);

    return rows;
}


// SALES PERFORMANCE
async function getSalesPerformance(period = "Weekly") {
    let dateCondition;

    if (period === "Daily") {
        dateCondition = `
            DATE(date) = CURDATE()
        `;
    } else {
        dateCondition = `
            date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
            AND date < DATE_ADD(CURDATE(), INTERVAL 1 DAY)
        `;
    }

    const [rows] = await db.query(`
        SELECT
            DATE(date) AS sale_date,
            COALESCE(SUM(amount), 0) AS amount
        FROM orders
        WHERE ${dateCondition}
        GROUP BY DATE(date)
        ORDER BY sale_date ASC
    `);

    return rows;
}

// PAYMENT METHODS
async function getPaymentBreakdown() {
    const [rows] = await db.query(`
        SELECT
            payment_method,
            COALESCE(SUM(amount), 0) AS total,
            COUNT(order_id) AS bill_count
        FROM orders
        WHERE DATE(date) = CURDATE()
        GROUP BY payment_method
        ORDER BY total DESC
    `);

    return rows;
}


// RECENT PURCHASE ORDERS
async function getRecentPurchaseOrders() {
    const [rows] = await db.query(`
        SELECT
            po.purchase_order_id,
            po.order_no,
            s.supplier_name,
            COUNT(pod.purchase_order_detail_id) AS items,
            po.order_date,
            po.status
        FROM purchase_orders po
        INNER JOIN suppliers s
            ON s.supplier_id = po.supplier_id
        LEFT JOIN purchase_order_details pod
            ON pod.purchase_order_id = po.purchase_order_id
        GROUP BY
            po.purchase_order_id,
            po.order_no,
            s.supplier_name,
            po.order_date,
            po.status
        ORDER BY po.created_date DESC
        LIMIT 10
    `);

    return rows;
}


// GET ALL DASHBOARD DATA
async function getDashboardData() {
    const [
        summary,
        lowStock,
        expiringProducts,
        paymentBreakdown,
        purchaseOrders
    ] = await Promise.all([
        getDashboardSummary(),
        getLowStockProducts(),
        getExpiringProducts(),
        getPaymentBreakdown(),
        getRecentPurchaseOrders()
    ]);

    return {
        summary,
        lowStock,
        expiringProducts,
        paymentBreakdown,
        purchaseOrders
    };
}


// MARK PURCHASE ORDER AS RECEIVED
async function markPurchaseOrderReceived(id) {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const [orders] = await connection.query(`
            SELECT
                purchase_order_id,
                status
            FROM purchase_orders
            WHERE purchase_order_id = ?
            FOR UPDATE
        `, [id]);

        if (orders.length === 0) {
            throw new Error("Purchase order not found.");
        }

        if (orders[0].status === "Received") {
            throw new Error("This purchase order has already been received.");
        }

        const [details] = await connection.query(`
            SELECT
                purchase_order_detail_id,
                item_id,
                quantity,
                COALESCE(received_quantity, 0) AS received_quantity
            FROM purchase_order_details
            WHERE purchase_order_id = ?
        `, [id]);

        if (details.length === 0) {
            throw new Error("Purchase order has no items.");
        }

        for (const detail of details) {
            const outstandingQuantity =
                Number(detail.quantity) - Number(detail.received_quantity);

            if (outstandingQuantity <= 0) {
                continue;
            }

            // Update item stock.
            const [updateResult] = await connection.query(`
                UPDATE item
                SET quantity = quantity + ?
                WHERE item_id = ?
            `, [outstandingQuantity, detail.item_id]);

            if (updateResult.affectedRows === 0) {
                throw new Error(
                    `Item not found. Item ID: ${detail.item_id}`
                );
            }

            // Update received quantity.
            await connection.query(`
                UPDATE purchase_order_details
                SET received_quantity = quantity
                WHERE purchase_order_detail_id = ?
            `, [detail.purchase_order_detail_id]);
        }

        // Update purchase order status.
        await connection.query(`
            UPDATE purchase_orders
            SET status = 'Received'
            WHERE purchase_order_id = ?
        `, [id]);

        await connection.commit();

        return true;

    } catch (error) {
        await connection.rollback();
        throw error;

    } finally {
        connection.release();
    }
}


module.exports = {
    getDashboardData,
    getSalesPerformance,
    markPurchaseOrderReceived
};