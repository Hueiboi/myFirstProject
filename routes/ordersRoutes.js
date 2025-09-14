const express = require('express');
const router = express.Router();
const orderControllers = require('../controllers/ordersControllers');
const { checkSchema } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validate');
const { verifyToken } = require('../middlewares/verifyToken');
const { createOrderSchema, addItemToOrderSchema, updateItemInOrderSchema, payOrderSchema, getOrderByTablePendingSchema, getOrderByOrderCodeSchema } = require('../utils/validationSchema');

router.get('/', verifyToken, orderControllers.getOrders);
router.get('/:id', verifyToken, orderControllers.getOrderById);
router.get('/table/pending', verifyToken, checkSchema(getOrderByTablePendingSchema), handleValidationErrors, orderControllers.getOrderByTablePending);
router.get('/code', verifyToken, checkSchema(getOrderByOrderCodeSchema), handleValidationErrors, orderControllers.getOrderByOrderCode);
router.post('/', verifyToken, checkSchema(createOrderSchema), handleValidationErrors, orderControllers.createOrder);
router.post('/:id/items', verifyToken, checkSchema(addItemToOrderSchema), handleValidationErrors, orderControllers.addItemToOrder);
router.put('/:id/items/:item_id', verifyToken, checkSchema(updateItemInOrderSchema), handleValidationErrors, orderControllers.updateItemInOrder);
router.delete('/:id/items/:item_id', verifyToken, orderControllers.deleteItemFromOrder);
router.post('/:id/pay', verifyToken, checkSchema(payOrderSchema), handleValidationErrors, orderControllers.payOrder);

module.exports = router;