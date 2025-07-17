const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController')
const {checkSchema} = require('express-validator')
const {addCartSchema, updateCartSchema} = require('../utils/validationSchema')
const {handleValidationErrors} = require('../middlewares/validate');

router.get('/', cartController.getCart);
router.post('/', checkSchema(addCartSchema), handleValidationErrors, cartController.addCart);
router.put('/:product_id', checkSchema(updateCartSchema), handleValidationErrors,cartController.updateCart);
router.delete('/:product_id', cartController.deleteCart);
router.delete('/', cartController.clearCart);

module.exports = router;