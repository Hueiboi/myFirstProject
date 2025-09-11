const express = require('express');
const router = express.Router();
const tablesController = require('../controllers/tablesController');
const { verifyToken } = require('../middlewares/verifyToken');
const { isAdmin } = require('../middlewares/isAdmin');

router.get('/', verifyToken, tablesController.getTables);
router.post('/', verifyToken, isAdmin, tablesController.createTable);
router.put('/:id', verifyToken, isAdmin, tablesController.updateTable);
router.delete('/:id', verifyToken, isAdmin, tablesController.deleteTable);

module.exports = router;