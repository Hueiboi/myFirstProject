const express = require('express');
const router = express.Router();
const tableControllers = require('../controllers/tableControllers');
const { verifyToken } = require('../middlewares/verifyToken');
const { isAdmin } = require('../middlewares/isAdmin');

router.get('/', verifyToken, tableControllers.getTables);
router.post('/', verifyToken, isAdmin, tableControllers.createTable);
router.put('/:id', verifyToken, isAdmin, tableControllers.updateTable);
router.delete('/:id', verifyToken, isAdmin, tableControllers.deleteTable);

module.exports = router;