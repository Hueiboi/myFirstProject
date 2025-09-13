const express = require('express');
const router = express.Router();
const promotionsControllers = require('../controllers/promotionsControllers');
const { checkSchema } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validate');
const { verifyToken } = require('../middlewares/verifyToken');
const { isAdmin } = require('../middlewares/isAdmin');
const { createPromotionSchema } = require('../utils/validationSchema');

router.get('/', verifyToken, promotionsControllers.getPromotions);
router.post('/', verifyToken, isAdmin, checkSchema(createPromotionSchema), handleValidationErrors, promotionsControllers.createPromotion);
router.delete('/:id', verifyToken, isAdmin, promotionsControllers.deletePromotion);

module.exports = router;