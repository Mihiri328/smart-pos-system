const db = require("../config/database");

// GET: Retrieve all sales with filters and pagination
const getAllSales = async (req, res) => {
    try {
        const {
            date,
            orderNo,
            paymentMethod,
            page = 1,
            limit = 10
        } = req.query;

        const currentPage = Math.max(parseInt(page, 10) || 1, 1);
        const recordsPerPage = Math.max(parseInt(limit, 10) || 10, 1);
        const offset = (currentPage - 1) * recordsPerPage;

        // Build dynamic filter conditions
       
        const salesConditions = [];
        const salesParams = [];

        if (date) {
            salesConditions.push("DATE(o.date) = ?");
            salesParams.push(date);
        }

        if (orderNo) {
            salesConditions.push("o.order_no LIKE ?");
            salesParams.push(`%${orderNo}%`);
        }

        if (paymentMethod) {
            salesConditions.push("o.payment_method = ?");
            salesParams.push(paymentMethod);
        }

        const whereClause = salesConditions.length > 0
    ? `WHERE ${salesConditions.join(" AND ")}`
    : "";

        // Get total number of matching records
        const countQuery = `
            SELECT COUNT(*) AS total
            FROM orders o
            ${whereClause}
        `;

        const [countResult] = await db.execute(
            countQuery,
            salesParams
        );

        const totalRecords = countResult[0].total;
        const totalPages = Math.ceil(totalRecords / recordsPerPage);

        // Get sales records
        const salesQuery = `
            SELECT
                o.order_id,
                DATE_FORMAT(o.date, '%Y-%m-%d') AS date,
                o.order_no,
                o.payment_method,
                o.discount_price,
                o.amount,
                o.created_date,
                COALESCE(
                    (
                        SELECT SUM(od.quantity)
                        FROM order_detail od
                        WHERE od.order_id = o.order_id
                    ),
                    0
                ) AS item_count
            FROM orders o
            ${whereClause}
            ORDER BY o.date DESC, o.order_id DESC
            LIMIT ? OFFSET ?
        `;

        const [sales] = await db.execute(
            salesQuery,
            [...salesParams, recordsPerPage, offset]
        );

        return res.status(200).json({
            success: true,
            data: sales,
            pagination: {
                currentPage,
                limit: recordsPerPage,
                totalRecords,
                totalPages
            }
        });

    } catch (error) {
        console.error("Get sales error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve sales records."
        });
    }
};


// GET: Retrieve a single sale with its ordered items
const getSaleDetails = async (req, res) => {
    try {
        const orderId = Number(req.params.orderId);

        if (!Number.isInteger(orderId) || orderId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid order ID."
            });
        }

        // Retrieve order information
        const orderQuery = `
            SELECT
                order_id,
                DATE_FORMAT(date, '%Y-%m-%d') AS date,
                order_no,
                payment_method,
                discount_price,
                amount,
                created_date,
                amount_paid,
                change_amount
            FROM orders
            WHERE order_id = ?
        `;

        const [orderResult] = await db.execute(
            orderQuery,
            [orderId]
        );

        if (orderResult.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Sale not found."
            });
        }

        const order = orderResult[0];

        // Retrieve ordered items
        const itemsQuery = `
            SELECT
                od.order_detail_id,
                od.item_id,
                i.item_name,
                od.quantity,
                od.unit_price,
                od.amount
            FROM order_detail od
            INNER JOIN item i
                ON i.item_id = od.item_id
            WHERE od.order_id = ?
            ORDER BY od.order_detail_id ASC
        `;

        const [items] = await db.execute(
            itemsQuery,
            [orderId]
        );

        return res.status(200).json({
            success: true,
            data: {
                ...order,
                items
            }
        });

    } catch (error) {
        console.error("Get sale details error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve sale details."
        });
    }
};


// POST: Create a new sale
const createSale = async (req, res) => {
    let connection;

    try {
        const {
            date,
            orderNo,
            paymentMethod,
            discountPrice = 0,
            items
        } = req.body;

        // Validate required fields
        if (!date || !orderNo || !paymentMethod || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Date, order number, payment method and items are required."
            });
        }

        if (!String(orderNo).trim()) {
            return res.status(400).json({
                success: false,
                message: "Order number cannot be empty."
            });
        }

        const allowedPaymentMethods = ["Cash", "Card", "QR Pay"];

        if (!allowedPaymentMethods.includes(paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: "Invalid payment method."
            });
        }

        const discount = Number(discountPrice);

        if (!Number.isFinite(discount) || discount < 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid discount amount."
            });
        }

        // Validate items
        for (const item of items) {
            const itemId = Number(item.itemId);
            const quantity = Number(item.quantity);

            if (
                !Number.isInteger(itemId) ||
                itemId <= 0 ||
                !Number.isFinite(quantity) ||
                quantity <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Each item must have a valid item ID and quantity."
                });
            }
        }

        // Prevent duplicate item IDs
        const itemIds = items.map(item => Number(item.itemId));

        if (new Set(itemIds).size !== itemIds.length) {
            return res.status(400).json({
                success: false,
                message: "Duplicate items are not allowed in the same order."
            });
        }

        connection = await db.getConnection();

        await connection.beginTransaction();

        // Retrieve current item prices from database
        const placeholders = itemIds.map(() => "?").join(",");

        const itemQuery = `
            SELECT
                item_id,
                item_name,
                unit_price
            FROM item
            WHERE item_id IN (${placeholders})
            FOR UPDATE
        `;

        const [databaseItems] = await connection.execute(
            itemQuery,
            itemIds
        );

        if (databaseItems.length !== itemIds.length) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "One or more selected items were not found."
            });
        }

        const itemMap = new Map();

        databaseItems.forEach(item => {
            itemMap.set(Number(item.item_id), item);
        });

        // Calculate order amounts
        let subtotal = 0;

        const orderItems = items.map(item => {
            const itemId = Number(item.itemId);
            const quantity = Number(item.quantity);
            const databaseItem = itemMap.get(itemId);

            const unitPrice = Number(databaseItem.unit_price);
            const amount = Number((quantity * unitPrice).toFixed(2));

            subtotal += amount;

            return {
                itemId,
                quantity,
                unitPrice,
                amount
            };
        });

        subtotal = Number(subtotal.toFixed(2));

        if (discount > subtotal) {
            await connection.rollback();

            return res.status(400).json({
                success: false,
                message: "Discount cannot exceed the order subtotal."
            });
        }

        const finalAmount = Number((subtotal - discount).toFixed(2));

        // Insert order
        const insertOrderQuery = `
            INSERT INTO orders (
                date,
                order_no,
                payment_method,
                discount_price,
                amount,
                created_date
            )
            VALUES (?, ?, ?, ?, ?, NOW())
        `;

        const [orderResult] = await connection.execute(
            insertOrderQuery,
            [
                date,
                String(orderNo).trim(),
                paymentMethod,
                discount,
                finalAmount
            ]
        );

        const orderId = orderResult.insertId;

        // Insert order details
        const insertDetailQuery = `
            INSERT INTO order_detail (
                order_id,
                item_id,
                quantity,
                unit_price,
                amount,
                created_date
            )
            VALUES (?, ?, ?, ?, ?, NOW())
        `;

        for (const item of orderItems) {
            await connection.execute(
                insertDetailQuery,
                [
                    orderId,
                    item.itemId,
                    item.quantity,
                    item.unitPrice,
                    item.amount
                ]
            );
        }

        await connection.commit();

        return res.status(201).json({
            success: true,
            message: "Sale created successfully.",
            data: {
                orderId,
                orderNo: String(orderNo).trim(),
                date,
                paymentMethod,
                subtotal,
                discountPrice: discount,
                amount: finalAmount,
                items: orderItems
            }
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error("Create sale error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create sale."
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
};


module.exports = {
    getAllSales,
    getSaleDetails,
    createSale
};