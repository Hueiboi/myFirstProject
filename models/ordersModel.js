const con = require('../config/db');

const generateOrderCode = () => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(100 + Math.random() * 900);
    return `ORD-${date}-${random}`;
};

const orderModel = {
    getAll: (user_id, date) => {
        let query = 'SELECT * FROM orders WHERE user_id = $1';
        const params = [user_id];
        if (date) {
            query += ' AND DATE(created_at) = $2';
            params.push(date);
        }
        return con.query(query, params);
    },

//getById

    getByTableCompleted: (table_id) => con.query(`
        SELECT 
        o.id,
        o.order_code,
        o.created_at,
        o.total_amount,
        o.status,
        t.table_number,
        o.created_by AS staff_name,
        p.id AS promotion_id,
        p.discount_percentage,
        pay.payment_method AS payment_method,
        (
            SELECT json_agg(json_build_object(
            'menu_name', m.name,
            'quantity', oi.quantity,
            'price', oi.price
            ))
            FROM order_items oi
            JOIN menu m ON oi.product_id = m.id
            WHERE oi.order_id = o.id
        ) AS items
        FROM orders o
        JOIN tables t ON o.table_id = t.id
        LEFT JOIN promotions p ON o.promotion_id = p.id
        LEFT JOIN payments pay ON pay.order_id = o.id
        WHERE o.table_id = $1 AND o.status = 'completed'
        ORDER BY o.created_at DESC
        `,
        [table_id]
    ),

    getByOrderCode: (order_code) => con.query(
        'SELECT o.*, oi.product_id, oi.quantity, oi.price FROM orders o ' +
        'LEFT JOIN order_items oi ON o.id = oi.order_id WHERE o.order_code = $1',
        [order_code]
    ),

    create: (table_id, promotion_id, user_id = null, order_type, username) => con.query(
        'INSERT INTO orders (table_id, total_amount, status, promotion_id, user_id, order_type, order_code, created_by, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) RETURNING *',
        [table_id, 0, 'pending', promotion_id, user_id, order_type, generateOrderCode(), username]
    ),

    addItem: async (order_id, product_id, quantity) => {
        const client = await con.connect(); // Kết nối client cho transaction
        try {
            await client.query('BEGIN');
            const menu = await client.query('SELECT price, stock_quantity FROM menu WHERE id = $1', [product_id]);
            if (menu.rows.length === 0) throw new Error("Menu item not found");
            const price = menu.rows[0].price;
            const stock = menu.rows[0].stock_quantity;
            if (stock < quantity) throw new Error("Not enough stock");

            await client.query('UPDATE menu SET stock_quantity = stock_quantity - $1 WHERE id = $2', [quantity, product_id]);
            const result = await client.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *',
                [order_id, product_id, quantity, price]
            );

            await client.query(
                'UPDATE orders SET total_amount = total_amount + $1 WHERE id = $2',
                [price * quantity, order_id]
            );
            await client.query('COMMIT');
            return result;
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    },

    updateItem: async (item_id, quantity) => {
        const item = await con.query('SELECT quantity, product_id, price, order_id FROM order_items WHERE id = $1', [item_id]);
        if (item.rows.length === 0) throw new Error("Item not found");
        const oldQty = item.rows[0].quantity;
        const product_id = item.rows[0].product_id;
        const price = item.rows[0].price;
        const order_id = item.rows[0].order_id;
        const diff = quantity - oldQty;

        const stock = await con.query('SELECT stock_quantity FROM menu WHERE id = $1', [product_id]);
        if (diff > stock.rows[0].stock_quantity) throw new Error("Not enough stock");

        await con.query('UPDATE menu SET stock_quantity = stock_quantity - $1 WHERE id = $2', [diff, product_id]);
        const result = await con.query(
            'UPDATE order_items SET quantity = $1 WHERE id = $2 RETURNING *',
            [quantity, item_id]
        );

        await con.query(
            'UPDATE orders SET total_amount = total_amount + $1 WHERE id = $2',
            [price * diff, order_id]
        );
        return result;
    },

    deleteItem: async (item_id) => {
        const item = await con.query('SELECT quantity, product_id, price, order_id FROM order_items WHERE id = $1', [item_id]);
        if (item.rows.length === 0) throw new Error("Item not found");
        const qty = item.rows[0].quantity;
        const product_id = item.rows[0].product_id;
        const price = item.rows[0].price;
        const order_id = item.rows[0].order_id;

        await con.query('UPDATE menu SET stock_quantity = stock_quantity + $1 WHERE id = $2', [qty, product_id]);
        const result = await con.query('DELETE FROM order_items WHERE id = $1 RETURNING *', [item_id]);

        await con.query(
            'UPDATE orders SET total_amount = total_amount - $1 WHERE id = $2',
            [price * qty, order_id]
        );
        return result;
    },

    pay: (order_id, payment_method, amount) => con.query(
        'INSERT INTO payments (order_id, payment_method, amount, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)',
        [order_id, payment_method, amount]
    ),

    updateStatus: (id, status) => con.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id])
};

module.exports = orderModel;