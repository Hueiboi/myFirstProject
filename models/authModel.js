const con = require('../config/db');

const usersModel = {
    findByUsername: (username) => con.query('SELECT * FROM users WHERE username = $1', [username]),
    createUser: (username, passwordHash, email, address, role = 'user') => con.query(
        'INSERT INTO users (username, password, email, address, role, created_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *',
        [username, passwordHash, email, address, role]
    )
};

module.exports = usersModel;