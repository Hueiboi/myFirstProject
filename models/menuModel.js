const con = require('../config/db');

const menuModel = {
    getAll: (category) => {
        if (category) {
            return con.query('SELECT * FROM menu WHERE category = $1 ORDER BY id ASC', [category]);
        }
        return con.query('SELECT * FROM menu ORDER BY id ASC');
    },

    getById: (id) => con.query('SELECT * FROM menu WHERE id = $1', [id]),

    getByName: (name) => con.query('SELECT * FROM menu WHERE name ILIKE $1', [`%${name}%`]),

    getAllSorted: (sortBy, order) => {
        const validSortBy = ['id', 'name', 'price', 'category'];
        const validOrder = ['asc', 'desc'];
        const safeSortBy = validSortBy.includes(sortBy) ? sortBy : 'id';
        const safeOrder = validOrder.includes(order) ? order : 'asc';
        return con.query(`SELECT * FROM menu ORDER BY ${safeSortBy} ${safeOrder}`);
    },

    create: (name, id, price, stock_quantity, category) => con.query(
        'INSERT INTO menu (name, id, price, stock_quantity, category, created_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)',
        [name, id, price, stock_quantity, category]
    ),

    update: (id, name, price, stock_quantity, category) => con.query(
        'UPDATE menu SET name = $1, price = $2, stock_quantity = $3, category = $4 WHERE id = $5',
        [name, price, stock_quantity, category, id]
    ),

    delete: (id) => con.query('DELETE FROM menu WHERE id = $1', [id])
};

module.exports = menuModel;