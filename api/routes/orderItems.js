const express = require('express');
const router = express.Router();
const OrderItemsController = require('../controllers/OrderItemsController');

// GET /api/order-items - Get all order items
router.get('/', OrderItemsController.getAllOrderItems);

// GET /api/order-items/order/:order_id - Get order items by order ID
router.get('/order/:order_id', OrderItemsController.getOrderItemsByOrderId);

// GET /api/order-items/:id - Get order item by ID
router.get('/:id', OrderItemsController.getOrderItemById);

// POST /api/order-items - Create new order item
router.post('/', OrderItemsController.createOrderItem);

// PUT /api/order-items/:id - Update order item
router.put('/:id', OrderItemsController.updateOrderItem);

// DELETE /api/order-items/:id - Delete order item
router.delete('/:id', OrderItemsController.deleteOrderItem);

module.exports = router;