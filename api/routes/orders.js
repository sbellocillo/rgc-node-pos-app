const express = require('express');
const router = express.Router();
const OrdersController = require('../controllers/OrdersController');

// GET /api/orders - Get all orders
router.get('/', OrdersController.getAllOrders);

// GET /api/orders/cancelled - Get cancelled orders
router.get('/cancelled', OrdersController.getCancelledOrders);

// GET /api/orders/queue - Get active orders
router.get('/queue', OrdersController.getOrderQueue);

// PATCH /api/orders/:id/status - Update order status
router.patch('/:id/status', OrdersController.updateStatus);

// GET /api/orders/next-number?location_id=15&pos_terminal_number=1
router.get('/next-number', OrdersController.getNextOrderNumber);


// GET /api/orders/:id - Get order by ID
router.get('/:id', OrdersController.getOrderById);

// POST /api/orders - Create new order
router.post('/', OrdersController.createOrder);

// PUT /api/orders/:id - Update order
router.put('/:id', OrdersController.updateOrder);

// PUT /api/orders/:id/cancel - Cancel order and all items
router.put('/:id/cancel', OrdersController.cancelOrder);

// DELETE /api/orders/:id - Delete order
router.delete('/:id', OrdersController.deleteOrder);

module.exports = router;