const express = require('express');
const router = express.Router();
const LayoutController = require('../controllers/LayoutController');

// Get all layouts
router.get('/', LayoutController.getAll);

// Get default layouts
router.get('/defaults', LayoutController.getDefaults);

// Get layouts by item type
router.get('/item-type/:item_type_id', LayoutController.getByItemType);

// Get layout by ID
router.get('/:id', LayoutController.getById);

// Create new layout
router.post('/', LayoutController.create);

// Update layout
router.put('/:id', LayoutController.update);

// Delete layout
router.delete('/:id', LayoutController.delete);

module.exports = router;