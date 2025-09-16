const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentControllers');
const {verifyToken} = require('../middlewares/verifyToken');

router.get('/invoices/:order_id', verifyToken, paymentController.getInvoiceDetails);

module.exports = router;