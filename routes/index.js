const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/menu', require('./menuRoutes'));
// router.use('/cart', require('./cartRoutes'));
// router.use('/products', require('./productRoutes'));

module.exports = router;