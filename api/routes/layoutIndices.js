const express = require('express');
const router = express.Router();
const LayoutIndicesController = require('../controllers/LayoutIndicesController');

// Get all layout indices
router.get('/', LayoutIndicesController.getAll);

// Get active layout indices
router.get('/active', LayoutIndicesController.getActive);

// Get layout index by ID
router.get('/:id', LayoutIndicesController.getById);

// Get layout index by grid_index
router.get('/grid/:grid_index', LayoutIndicesController.getByGridIndex);

module.exports = router;