const { validationResult } = require('express-validator');
// Middleware to validate request data

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: "error", msg: "Validation failed", errors: errors.array() });
    }
    next();
}

module.exports = {handleValidationErrors}