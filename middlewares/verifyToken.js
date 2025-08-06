const jwt = require('jsonwebtoken');

exports.verifyToken = function (req, res, next) {
    const authHeader = req.headers['authorization'];

    if(!authHeader || !authHeader.startsWith("Bearer")) {
        return res.status(401).json({msg: "invalid authorization header"});
    }

    const token = authHeader.split(' ')[1];

    if(!token) return res.status(401).json({msg: "No token provided"});

    jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    if (err) {
      return res.status(403).json({ msg: "Invalid token" });
    }
    req.user = user; // lưu thông tin user vào req trước khi kiểm tra admin

    next();
  });
}