const express = require('express');
const router = express.Router();
const LookupController = require('../controllers/LookupController');

// Get all lookup data in one request
router.get('/all', LookupController.getAllLookups);

// Individual lookup endpoints
router.get('/roles', LookupController.getRoles);
router.get('/item-types', LookupController.getItemTypes);
router.get('/item-categories', LookupController.getItemCategories);
router.get('/locations', LookupController.getLocations);
router.get('/order-statuses', LookupController.getOrderStatuses);
router.get('/order-types', LookupController.getOrderTypes);
router.get('/payment-methods', LookupController.getPaymentMethods);
router.get('/tax-config', LookupController.getTaxConfig);

// System configuration
router.get('/system-config', LookupController.getSystemConfig);

// Dashboard summary data
router.get('/dashboard-summary', LookupController.getDashboardSummary);

module.exports = router;