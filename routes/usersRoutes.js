const express = require('express');
const router = express.Router();
const userController = require('../controllers/usersControllers');
const { verifyToken } = require('../middlewares/verifyToken');
const { isAdmin } = require('../middlewares/isAdmin');
const { checkSchema } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validate');
const { registerSchema } = require('../utils/validationSchema');

router.post('/', verifyToken, isAdmin, checkSchema(registerSchema), handleValidationErrors, userController.createUser);
router.put('/:id', verifyToken, isAdmin, checkSchema(registerSchema), handleValidationErrors, userController.updateUser);
router.delete('/:id', verifyToken, isAdmin, userController.deleteUser);

module.exports = router;