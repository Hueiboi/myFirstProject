const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { checkSchema } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validate');
const { verifyToken } = require('../middlewares/verifyToken');
const { isAdmin } = require('../middlewares/isAdmin');
const { createMenuSchema } = require('../utils/validationSchema');

router.get('/', verifyToken, menuController.getAllItems);
router.get('/name', verifyToken, menuController.getAllByName);
router.get('/:id', verifyToken, menuController.getItemById);
router.post('/', verifyToken, isAdmin, checkSchema(createMenuSchema), handleValidationErrors, menuController.createItem);
router.post('/many', verifyToken, isAdmin, checkSchema(createMenuSchema), handleValidationErrors, menuController.createManyItems);
router.put('/:id', verifyToken, isAdmin, checkSchema(createMenuSchema), handleValidationErrors, menuController.updateItem);
router.delete('/:id', verifyToken, isAdmin, menuController.deleteItem);

module.exports = router;