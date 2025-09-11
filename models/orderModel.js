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

    getById: (id, user_id) => con.query(
        'SELECT o.*, oi.menu_id, oi.quantity, oi.price FROM orders o ' +
        'LEFT JOIN order_items oi ON o.id = oi.order_id WHERE o.id = $1 AND o.user_id = $2',
        [id, user_id]
    ),

    getByTablePending: (table_id) => con.query(
        'SELECT o.*, oi.menu_id, oi.quantity, oi.price FROM orders o ' +
        'LEFT JOIN order_items oi ON o.id = oi.order_id WHERE o.table_id = $1 AND o.status = $2',
        [table_id, 'pending']
    ),

    getByOrderCode: (order_code) => con.query(
        'SELECT o.*, oi.menu_id, oi.quantity, oi.price FROM orders o ' +
        'LEFT JOIN order_items oi ON o.id = oi.order_id WHERE o.order_code = $1',
        [order_code]
    ),

    create: (table_id, promotion_id, user_id = null, order_type = 'dine_in') => con.query(
        'INSERT INTO orders (table_id, total_amount, status, promotion_id, user_id, order_type, order_code, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) RETURNING *',
        [table_id, 0, 'pending', promotion_id, user_id, order_type, generateOrderCode()]
    ),

    addItem: async (order_id, menu_id, quantity) => {
        const menu = await con.query('SELECT price, stock_quantity FROM menu WHERE id = $1', [menu_id]);
        if (menu.rows.length === 0) throw new Error("Menu item not found");
        const price = menu.rows[0].price;
        const stock = menu.rows[0].stock_quantity;
        if (stock < quantity) throw new Error("Not enough stock");

        await con.query('UPDATE menu SET stock_quantity = stock_quantity - $1 WHERE id = $2', [quantity, menu_id]);
        const result = await con.query(
            'INSERT INTO order_items (order_id, menu_id, quantity, price, created_at) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *',
            [order_id, menu_id, quantity, price]
        );

        await con.query(
            'UPDATE orders SET total_amount = total_amount + $1 WHERE id = $2',
            [price * quantity, order_id]
        );
        return result;
    },

    updateItem: async (item_id, quantity) => {
        const item = await con.query('SELECT quantity, menu_id, price, order_id FROM order_items WHERE id = $1', [item_id]);
        if (item.rows.length === 0) throw new Error("Item not found");
        const oldQty = item.rows[0].quantity;
        const menu_id = item.rows[0].menu_id;
        const price = item.rows[0].price;
        const order_id = item.rows[0].order_id;
        const diff = quantity - oldQty;

        const stock = await con.query('SELECT stock_quantity FROM menu WHERE id = $1', [menu_id]);
        if (diff > stock.rows[0].stock_quantity) throw new Error("Not enough stock");

        await con.query('UPDATE menu SET stock_quantity = stock_quantity - $1 WHERE id = $2', [diff, menu_id]);
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
        const item = await con.query('SELECT quantity, menu_id, price, order_id FROM order_items WHERE id = $1', [item_id]);
        if (item.rows.length === 0) throw new Error("Item not found");
        const qty = item.rows[0].quantity;
        const menu_id = item.rows[0].menu_id;
        const price = item.rows[0].price;
        const order_id = item.rows[0].order_id;

        await con.query('UPDATE menu SET stock_quantity = stock_quantity + $1 WHERE id = $2', [qty, menu_id]);
        const result = await con.query('DELETE FROM order_items WHERE id = $1 RETURNING *', [item_id]);

        await con.query(
            'UPDATE orders SET total_amount = total_amount - $1 WHERE id = $2',
            [price * qty, order_id]
        );
        return result;
    },

    pay: (order_id, method, amount) => con.query(
        'INSERT INTO payments (order_id, method, amount, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)',
        [order_id, method, amount]
    ),

    updateStatus: (id, status) => con.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id])
};

module.exports = orderModel;