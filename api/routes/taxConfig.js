const express = require('express');
const router = express.Router();
const TaxConfigController = require('../controllers/TaxConfigController');

// GET /api/tax-config - Get all tax configurations
router.get('/', TaxConfigController.getAllTaxConfigs);

// GET /api/tax-config/default - Get default tax configuration
router.get('/default', TaxConfigController.getDefaultTaxConfig);

// GET /api/tax-config/:id - Get tax configuration by ID
router.get('/:id', TaxConfigController.getTaxConfigById);

// POST /api/tax-config - Create new tax configuration
router.post('/', TaxConfigController.createTaxConfig);

// POST /api/tax-config/calculate - Calculate tax for given amount
router.post('/calculate', TaxConfigController.calculateTax);

// PUT /api/tax-config/:id - Update tax configuration
router.put('/:id', TaxConfigController.updateTaxConfig);

// DELETE /api/tax-config/:id - Delete tax configuration
router.delete('/:id', TaxConfigController.deleteTaxConfig);

module.exports = router;