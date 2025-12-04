const express = require('express');
const router = express.Router();
const CardNetworkController = require('../controllers/CardNetworkController');

// Get all card networks
router.get('/', CardNetworkController.getAll);

// Get card network by ID
router.get('/:id', CardNetworkController.getById);

// Get card network by code
router.get('/code/:code', CardNetworkController.getByCode);

// Create new card network
router.post('/', CardNetworkController.create);

// Update card network
router.put('/:id', CardNetworkController.update);

// Delete card network
router.delete('/:id', CardNetworkController.delete);

module.exports = router;
