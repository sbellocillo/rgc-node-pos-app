const express = require('express');
const router = express.Router();
const LookupController = require('../controllers/LookupController');
const PaymentMethod = require('../models/PaymentMethod');

// GET /api/payment-methods - Get all payment methods
router.get('/', LookupController.getAllPaymentMethods);

// GET /api/payment-methods/:id - Get payment method by ID
router.get('/:id', LookupController.getPaymentMethodById);

// POST /api/payment-methods - Create new payment method
router.post('/', LookupController.createPaymentMethod);

// PUT /api/payment-methods/:id - Update payment method
router.put('/:id', LookupController.updatePaymentMethod);

// DELETE /api/payment-methods/:id - Delete payment method
router.delete('/:id', LookupController.deletePaymentMethod);

module.exports = router;