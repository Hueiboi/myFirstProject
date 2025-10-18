const con = require('../config/db');

const tablesModel = {
    getAll: () => con.query('SELECT * FROM tables ORDER BY table_number ASC'),
    getById: (id) => con.query('SELECT * FROM tables WHERE id = $1', [id]),
    create: (table_number) => con.query(
        'INSERT INTO tables (table_number, status, created_at) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING *',
        [table_number, 'available']
    ),
    update: (id, table_number, status) => con.query('UPDATE tables SET table_number = $1, status = $2 WHERE id = $3', [table_number, status, id]),
    delete: (id) => con.query('DELETE FROM tables WHERE id = $1', [id])
};

module.exports = tablesModel;