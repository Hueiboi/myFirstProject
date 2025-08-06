//Middleware xác nhận admin để thực hiện các yêu cầu "nhạy cảm"
exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: "You are not authorized" });
    }
    next();
};