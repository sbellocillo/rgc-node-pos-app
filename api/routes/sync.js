const express = require('express');
const router = express.Router();
const SyncController = require('../controllers/SyncController');

router.post('/orders', SyncController.syncOrders);

module.exports = router;