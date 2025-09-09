const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { checkSchema } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validate');
const { verifyToken } = require('../middlewares/verifyToken');
const { createOrderSchema, addItemToOrderSchema, updateItemInOrderSchema, payOrderSchema } = require('../utils/validationSchema');

router.get('/', verifyToken, orderController.getOrders);
router.get('/:id', verifyToken, orderController.getOrderById);
router.post('/', verifyToken, checkSchema(createOrderSchema), handleValidationErrors, orderController.createOrder);
router.post('/:id/items', verifyToken, checkSchema(addItemToOrderSchema), handleValidationErrors, orderController.addItemToOrder);
router.put('/:id/items/:item_id', verifyToken, checkSchema(updateItemInOrderSchema), handleValidationErrors, orderController.updateItemInOrder);
router.delete('/:id/items/:item_id', verifyToken, orderController.deleteItemFromOrder);
router.post('/:id/pay', verifyToken, checkSchema(payOrderSchema), handleValidationErrors, orderController.payOrder);

module.exports = router;