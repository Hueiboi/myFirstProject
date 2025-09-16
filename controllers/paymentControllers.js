const con = require('../config/db');

exports.getInvoiceDetails = async (req, res) => {
    try {
        const { order_id } = req.params;
        const orderResult = await con.query(
            `SELECT 
                o.order_code, o.created_at, 
                (o.total_amount * (1 - COALESCE(p.discount_percentage / 100, 0))) AS total_amount,
                o.promotion_id, p.name AS promotion_name, p.discount_percentage
            FROM orders o
            LEFT JOIN promotions p ON o.promotion_id = p.id
            WHERE o.id = $1 AND o.status = 'completed'`,
            [order_id]
        );
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ status: "error", msg: "Invoice not found" });
        }
        const itemsResult = await con.query(
            `SELECT oi.menu_id, m.name AS menu_name, oi.quantity, oi.price
            FROM order_items oi
            LEFT JOIN menu m ON oi.menu_id = m.id
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