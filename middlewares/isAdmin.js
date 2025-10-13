//Middleware xác nhận admin để thực hiện các yêu cầu "nhạy cảm"
const isAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ msg: "User not authenticated" });
    }
    if (req.user.role !== 'admin') {
        return res.status(403).json({status: "error", msg: "You are not authorized" });
    }
    next();
};

module.exports = {isAdmin}