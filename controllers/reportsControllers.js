const con = require('../config/db');

exports.getRevenue = async (req, res) => {
    try {
        const { date, period = 'day' } = req.query; // period: day/month
        let query = `
            SELECT SUM(total_amount) as total_revenue, COUNT(*) as order_count
            FROM orders
            WHERE status = 'completed'
        `;
        const params = [];
        if (date) {
            if (period === 'month') {
                query += ' AND DATE_TRUNC($1, created_at) = $2';
                params.push('month', date);
            } else {
                query += ' AND DATE(created_at) = $1';
                params.push(date);
            }
        }
        const result = await con.query(query, params);
        res.status(200).json({ status: "success", data: result.rows[0], msg: "Revenue retrieved successfully" });
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Error retrieving revenue", error: err.message });
        console.error(err);
    }
};