// const jwt = require('jsonwebtoken');

// exports.verifyToken = function (req, res, next) {
//     const authHeader = req.headers['authorization'];

//     if(!authHeader || !authHeader.startsWith("Bearer")) {
//         return res.status(401).json({msg: "invalid authorization header"});
//     }

//     const token = authHeader.split(' ')[1];

//     if(!token) return res.status(401).json({msg: "No token provided"});

//     jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
//     if (err) {
//       return res.status(403).json({ msg: "Invalid token - you must login to interact" });
//     }
//     req.user = user; // lưu thông tin user vào req trước khi kiểm tra admin

//     next();
//   });
// }
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: "error", msg: "Token missing or invalid" });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
        req.user = decoded; // Lưu user_id và role vào req.user
        next();
    } catch (err) {
        res.status(401).json({ status: "error", msg: "Invalid token" });
        console.error(err);
    }
};

module.exports = { verifyToken };