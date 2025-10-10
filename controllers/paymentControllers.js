const con = require('../config/db');

exports.getInvoiceDetails = async (req, res) => {
    try {
        const { order_id } = req.params;
        const orderResult = await con.query(
            `SELECT 
            o.id,
            o.order_code,
            o.created_at,
            o.total_amount,
            o.status,
            t.table_number,
            o.created_by AS staff_name,
            p.id AS promotion_id,
            p.discount_percentage,
            pay.payment_method AS payment_method
        FROM orders o
        LEFT JOIN tables t ON o.table_id = t.id
        LEFT JOIN promotions p ON o.promotion_id = p.id
        LEFT JOIN payments pay ON pay.order_id = o.id
        WHERE o.id = $1 AND o.status = 'completed'`,
            [order_id]
        );
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ status: "error", msg: "Invoice not found" });
        }
        const itemsResult = await con.query(
            `SELECT oi.product_id, m.name AS menu_name, oi.quantity, oi.price
            FROM order_items oi
            LEFT JOIN menu m ON oi.product_id = m.id
            WHERE oi.order_id = $1`,
            [order_id]
        );
        const response = {
            status: "success",
            data: {
                order: orderResult.rows[0],
                items: itemsResult.rows
            },
            msg: "Invoice details retrieved successfully"
        };
        res.status(200).json(response);
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Error retrieving invoice", error: err.message });
        console.error(err);
    }
};