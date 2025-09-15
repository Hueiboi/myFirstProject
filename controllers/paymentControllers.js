const con = require('../config/db');

exports.getInvoiceDetails = async (req, res) => {
    try {
        const { order_id } = req.params;
        const result = await con.query(
            `SELECT 
                o.order_code, o.created_at, o.total_amount, o.promotion_id,
                p.name AS promotion_name, p.discount_percentage,
                oi.menu_id, m.name AS menu_name, oi.quantity, oi.price
            FROM orders o
            LEFT JOIN promotions p ON o.promotion_id = p.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN menu m ON oi.menu_id = m.id
            WHERE o.id = $1 AND o.status = 'completed'`,
            [order_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ status: "error", msg: "Invoice not found" });
        }
        res.status(200).json({ status: "success", data: result.rows, msg: "Invoice details retrieved successfully" });
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Error retrieving invoice", error: err.message });
        console.error(err);
    }
};