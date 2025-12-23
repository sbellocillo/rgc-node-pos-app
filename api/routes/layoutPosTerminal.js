const express = require('express');
const router = express.Router();
const LayoutPosTerminalController = require('../controllers/LayoutPosTerminalController');

// Get all positions
router.get('/', LayoutPosTerminalController.getAll);

// Get positions by location
router.get('/location/:location_id', LayoutPosTerminalController.getByLocation);

// Get all postions by layout and location 
router.get('/layout/:layout_id/location/:location_id', LayoutPosTerminalController.getByLayoutAndLocation);

// Get position by ID
router.get('/:id', LayoutPosTerminalController.getById);

// Create new position
router.post('/', LayoutPosTerminalController.create);

// Bulk create positions for a location
router.post('/bulk', LayoutPosTerminalController.bulkCreateForLocation);

// Update position
router.put('/:id', LayoutPosTerminalController.delete);

// Delete position
router.delete('/location/:location_id', LayoutPosTerminalController.deleteByLocation);

module.exports = router;