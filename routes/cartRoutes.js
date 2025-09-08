const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController')
const {checkSchema} = require('express-validator')
const {addCartSchema, updateCartSchema} = require('../utils/validationSchema')
const {handleValidationErrors} = require('../middlewares/validate');
const {verifyToken} = require('../middlewares/verifyToken');

router.get('/',verifyToken ,cartController.getCart);
router.post('/', verifyToken, checkSchema(addCartSchema), handleValidationErrors, cartController.addCart);
router.put('/:product_id', verifyToken, checkSchema(updateCartSchema), handleValidationErrors,cartController.updateCart);
router.delete('/:product_id', verifyToken ,cartController.deleteCart);
router.delete('/',verifyToken ,cartController.clearCart);

module.exports = router;