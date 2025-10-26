const express = require('express');
const router = express.Router();
const tableControllers = require('../controllers/tablesControllers');
const { verifyToken } = require('../middlewares/verifyToken');
const { isAdmin } = require('../middlewares/isAdmin');
const { isStaff } = require('../middlewares/isStaff')

router.get('/', verifyToken, tableControllers.getTables);
router.post('/', verifyToken, isAdmin, tableControllers.createTable);
router.put('/:id', verifyToken, isAdmin, tableControllers.updateTable);
router.put('/:id/status', verifyToken, isStaff, tableControllers.updateTableStatus);
router.delete('/:id', verifyToken, isAdmin, tableControllers.deleteTable);

module.exports = router;