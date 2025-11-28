const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/CustomerController');

// GET /api/customers - Get all customers with pagination and filters
router.get('/', CustomerController.getAllCustomers);

// GET /api/customers/:id - Get customer by ID
router.get('/:id', CustomerController.getCustomerById);

// GET /api/customers/:id/orders - Get customer order history
router.get('/:id/orders', CustomerController.getCustomerOrderHistory);

// POST /api/customers - Create new customer
router.post('/', CustomerController.createCustomer);

// PUT /api/customers/:id - Update customer
router.put('/:id', CustomerController.updateCustomer);

// PUT /api/customers/:id/loyalty - Update customer loyalty points
router.put('/:id/loyalty', CustomerController.updateLoyaltyPoints);

// DELETE /api/customers/:id - Soft delete customer
router.delete('/:id', CustomerController.deleteCustomer);

module.exports = router;