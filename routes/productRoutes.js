const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController.js');
const {body,checkSchema} = require('express-validator');
const {createProductSchema} = require('../utils/validationSchema.js');
const {handleValidationErrors} = require('../middlewares/validate.js');

router.get('/',productController.getAllProducts);
router.get('/name', productController.getAllByName);
router.get('/:id', productController.getProductsById);
router.post('/', checkSchema(createProductSchema), handleValidationErrors,productController.createProduct);
router.post('/many',
    [// Đây cũng là 1 cách để validate dữ liệu đầu vào
    body('name').isString().isLength({ min: 5, max: 32 }).trim().withMessage('Name must be between 5 and 32 characters long'),
    body('id').isInt().withMessage('ID must be a positive integer').toInt(),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number').toFloat()
    ]
,productController.createManyProducts);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
// Xuất router để sử dụng trong server.js