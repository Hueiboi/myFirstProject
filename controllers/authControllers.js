const usersModel = require('../models/authModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const con = require('../config/db');

// Thời gian sống của token
const ACCESS_EXPIRE = '3h';
const REFRESH_EXPIRE = '7d';

// Tạo access token
const generateAccessToken = (user) => {
  return jwt.sign(
    { user_id: user.id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_EXPIRE }
  );
};

// Tạo refresh token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { user_id: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_EXPIRE }
  );
};

// Đăng ký tài khoản
exports.register = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const existing = await usersModel.findByUsername(username);
    if (existing.rows.length > 0) {
      return res.status(400).json({ status: "error", msg: "Username already exists" });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await usersModel.createUser(username, hash, email);
    res.status(201).json({ status: "success", msg: "User registered", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: "error", msg: "Error registering user", error: err.message });
  }
};

// Đăng nhập tài khoản
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const userRes = await usersModel.findByUsername(username);
    if (userRes.rows.length === 0) return res.status(400).json({ status: "error", msg: "Invalid credentials" });

    const user = userRes.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ status: "error", msg: "Invalid credentials" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Lưu refresh token vào DB
    await con.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

    // Ref token sẽ được gửi vào cookie, được lấy tự động mỗi khi cần access token 
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false, // true nếu deploy https
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      status: "success",
      msg: "Login successful",
      data: {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: { id: user.id, username: user.username, role: user.role },
      },
    });
  } catch (err) {
    res.status(500).json({ status: "error", msg: "Error logging in", error: err.message });
  }
};

// Dùng ref token để lấy access token mới
exports.refresh = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ status: "error", msg: "No refresh token" });

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const userRes = await con.query('SELECT * FROM users WHERE id = $1', [decoded.user_id]);
    const user = userRes.rows[0];
    if (!user || user.refresh_token !== token) // Kiểm tra tính hợp lệ của ref token từ DB và cookie
      return res.status(403).json({ status: "error", msg: "Invalid refresh token" });

    const newAccess = generateAccessToken(user); // Khớp ref token sẽ cấp access token mới
    res.json({ status: "success", data: { access_token: newAccess } });
  } catch (err) {
    res.status(403).json({ status: "error", msg: "Invalid or expired refresh token" });
  }
};

exports.logout = async (req, res) => {
  const token = req.cookies.refreshToken; // Lấy ref token từ cookie
  if (token) {
    try { // Xóa hoàn toàn dấu vết ref token
      const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
      await con.query('UPDATE users SET refresh_token = NULL WHERE id = $1', [decoded.user_id]); // Xóa ref token ở DB
    } catch {}
  }
  res.clearCookie('refreshToken'); // Xóa ref token ở cookie
  res.json({ status: "success", msg: "Logged out successfully" });
};
