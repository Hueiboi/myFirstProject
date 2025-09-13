const express = require('express');
const router = express.Router();
const reportsControllers = require('../controllers/reportsControllers');
const { verifyToken } = require('../middlewares/verifyToken');
const { isAdmin } = require('../middlewares/isAdmin');

router.get('/revenue', verifyToken, isAdmin, reportsControllers.getRevenue);

module.exports = router;