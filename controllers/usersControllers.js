const con = require('../config/db');
const bcrypt = require('bcrypt'); 

exports.createUser = async (req, res) => {
    try {
        const { username, password, email, address } = req.body;
        // Kiểm tra username đã tồn tại
        const existingUser = await con.query('SELECT 1 FROM users WHERE username = $1', [username]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ status: "error", msg: "Username already exists" });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await con.query(
            'INSERT INTO users (username, password, email, address, role, created_at) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *',
            [username, hashedPassword, email, address, 'staff']
        );
        res.status(201).json({ status: "success", data: result.rows[0], msg: "Staff created successfully" });
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Error creating staff", error: err.message });
        console.error(err);
    }
};

exports.updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        const { username, password, email, address, role } = req.body;
        let hashedPassword = password; //Lưu password cũ nếu không có gì thay đổi tránh hash lại nhiều lần
        if(password) { //Nếu có password mới trong req.body -> hash lại
            hashedPassword = bcrypt.hash(password, 10);
        }
        const result = await con.query(
            'UPDATE users SET username = $1, password = $2, email = $3, address = $4, role = $5 WHERE id = $6 RETURNING *',
            [username, hashedPassword, email, address, role, id]
        );
        if (result.rowCount === 0) return res.status(404).json({ status: "error", msg: "User not found" });
        res.status(200).json({ status: "success", data: result.rows[0], msg: "User updated successfully" });
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Error updating user", error: err.message });
        console.error(err);
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const result = await con.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) return res.status(404).json({ status: "error", msg: "User not found" });
        res.status(200).json({ status: "success", msg: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Error deleting user", error: err.message });
        console.error(err);
    }
};