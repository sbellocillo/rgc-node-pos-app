const express = require('express');
const router = express.Router();
const PosTerminalController = require('../controllers/PosTerminalController');

// Get all terminals
router.get('/', PosTerminalController.getAll);

// Get terminals by location (For Login Screen)
router.get('/location/:location_id', PosTerminalController.getByLocation);

// Get terminal by ID (For Receipt Header)
router.get('/:id', PosTerminalController.getById);

// Create new terminal
router.post('/', PosTerminalController.create);

// Update terminal
router.put('/:id', PosTerminalController.update);

// Delete terminal
router.delete('/:id', PosTerminalController.delete);

module.exports = router;