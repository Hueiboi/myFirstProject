//Middleware xác nhận staff để thực hiện các thao tác về đơn hàng
const isStaff = (req, res, next) => {
    if (req.user.role !== 'staff') {
        return res.status(403).json({status: "error", msg: "You are not authorized" });
    }
    next();
};

module.exports = {isStaff}