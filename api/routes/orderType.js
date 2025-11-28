const express = require('express');
const router = express.Router();
const LookupController = require('../controllers/LookupController');
const OrderType = require('../models/OrderType');

// GET /api/order-types - Get all order types
router.get('/', LookupController.getAllOrderTypes);
// GET /api/order-types/:id - Get order type by ID
router.get('/:id', LookupController.getOrderTypeById);

// POST /api/order-types - Create new order type
router.post('/', LookupController.createOrderType);

// PUT /api/order-types/:id - Update order type
router.put('/:id', LookupController.updateOrderType);

// DELETE /api/order-types/:id - Delete order type
router.delete('/:id', LookupController.deleteOrderType);

module.exports = router;