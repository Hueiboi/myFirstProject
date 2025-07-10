const { validationResult } = require('express-validator');
// Middleware to validate request data

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const messages = errors.array().map(err => err.msg);
        return res.status(400).json({errors: messages})
    }

    next();
}

module.exports = {handleValidationErrors}