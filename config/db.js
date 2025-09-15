const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();
//Chuyển sang pool để quản lý đa kết nối (truy cập) thay vì client chỉ cung cấp 1 req 1 lần tới server
const con = new Pool({
    host: process.env.HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    max: 20, // Số kết nối tối đa
    idleTimeoutMillis: 30000, // Thời gian chờ trước khi đóng kết nối nhàn rỗi
    connectionTimeoutMillis: 2000 // Thời gian chờ kết nối
});

con.connect()
    .then(() => console.log("Connected to the database via Pool"))
    .catch(err => console.error("Connection error:", err));

// Xử lý khi pool lỗi (tùy chọn)
con.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

module.exports = con; // Xuất pool