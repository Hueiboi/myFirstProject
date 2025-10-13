// const jwt = require('jsonwebtoken');

// const verifyToken = (req, res, next) => {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//          return res.status(401).json({ status: "error", msg: "Token missing or invalid" }); Trường hợp bắt buộc có account thì nên dùng
//          req.user = null; // Trường hợp user có thể order trực tiếp từ quầy => không token
//          return next();
//     }
//     const token = authHeader.split(' ')[1];
//     try {// trường hợp user dùng tài khoản
//          const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
//          req.user = decoded; // Lưu user_id và role vào req.user
//          next();
//     } catch (err) { // token lỗi, không tài khoản => dùng null
//          res.status(401).json({ status: "error", msg: "Invalid token" });
//          console.error(err);
//          req.user = null;
//          next()
//     }
// };
const jwt = require("jsonwebtoken")

const verifyToken = (req, res, next) => {
   const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ msg: "Invalid or expired token" });
  }
}

module.exports = { verifyToken }
