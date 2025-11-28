const express = require('express');
const router = express.Router();
const ItemsController = require('../controllers/ItemsController');

// GET /api/items - Get all items
router.get('/', ItemsController.getAllItems);

// GET /api/items/type/:typeId - Get items by type
router.get('/type/:typeId', ItemsController.getItemsByType);

// GET /api/items/:id - Get item by ID
router.get('/:id', ItemsController.getItemById);

// POST /api/items - Create new item
router.post('/', ItemsController.createItem);

// PUT /api/items/:id - Update item
router.put('/:id', ItemsController.updateItem);

// DELETE /api/items/:id - Delete item (soft delete)
router.delete('/:id', ItemsController.deleteItem);

module.exports = router;