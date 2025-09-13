const express = require('express');
const router = express.Router();
const menuControllers = require('../controllers/menuControllers');
const { checkSchema } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validate');
const { verifyToken } = require('../middlewares/verifyToken');
const { isAdmin } = require('../middlewares/isAdmin');
const { createMenuSchema } = require('../utils/validationSchema');

router.get('/', verifyToken, menuControllers.getAllItems);
router.get('/name', verifyToken, menuControllers.getAllByName);
router.get('/:id', verifyToken, menuControllers.getItemById);
router.post('/', verifyToken, isAdmin, checkSchema(createMenuSchema), handleValidationErrors, menuControllers.createItem);
router.post('/many', verifyToken, isAdmin, checkSchema(createMenuSchema), handleValidationErrors, menuControllers.createManyItems);
router.put('/:id', verifyToken, isAdmin, checkSchema(createMenuSchema), handleValidationErrors, menuControllers.updateItem);
router.delete('/:id', verifyToken, isAdmin, menuControllers.deleteItem);

module.exports = router;