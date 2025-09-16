const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/menu', require('./menuRoutes'));
router.use('/tables', require('./tablesRoutes'));
router.use('/orders', require('./ordersRoutes'));
router.use('/promotions', require('./promotionsRoutes'));
router.use('/report', require('./reportsRoutes'));
router.use('/users', require('./usersRoutes'));
router.use('/payment', require('./paymentRoutes'));

module.exports = router;