const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/menu', require('./menuRoutes'));
router.use('/table', require('./tableRoutes'));
router.use('/order', require('./orderRoutes'));
router.use('/promotion', require('./promotionsRoutes'));
router.use('/report', require('./reportsRoutes'));
router.use('/users', require('./userRoutes'));

module.exports = router;