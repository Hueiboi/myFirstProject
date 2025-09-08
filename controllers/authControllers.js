const usersModel = require('../models/authModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// - Dùng jwt.sign() để tạo token chứa {user_id, role}, user_id chính là id trong database nhưng dùng tên mới để dễ nhận biết
// - Dùng jwt.verify() để giải mã và gán req.user
// - Các route sau chỉ cần dùng req.user là đủ xác định danh tính

exports.register = async (req, res) => {
    try {
        const { username, password, email, address } = req.body;
        const existing = await usersModel.findByUsername(username);
        if (existing.rows.length > 0) {
            return res.status(400).json({ status: "error", msg: "Username already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const result = await usersModel.createUser(username, passwordHash, email, address);
        res.status(201).json({ status: "success", msg: "User registered", data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Error registering user", error: err.message });
        console.error(err);
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await usersModel.findByUsername(username);
        if (user.rows.length === 0) {
            return res.status(400).json({ status: "error", msg: "Invalid credentials" });
        }
        const valid = await bcrypt.compare(password, user.rows[0].password);
        if (!valid) return res.status(400).json({ status: "error", msg: "Invalid credentials" });
        const accessToken = jwt.sign(
            { user_id: user.rows[0].id, role: user.rows[0].role },
            process.env.ACCESS_TOKEN,
            { expiresIn: '1h' }
        );
        res.status(200).json({ status: "success", msg: "Login successful", data: { access_token: accessToken } });
    } catch (err) {
        res.status(500).json({ status: "error", msg: "Error logging in", error: err.message });
        console.error(err);
    }
};

exports.logout = async (req, res) => {
    res.status(200).json({ status: "success", msg: "Logged out successfully" });
};
