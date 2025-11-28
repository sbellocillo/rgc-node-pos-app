const express = require('express');
const router = express.Router();
const ItemCategoryController = require('../controllers/ItemCategoryController');

// Get all categories with filtering and pagination
router.get('/', ItemCategoryController.getAllCategories);

// Get category hierarchy (tree structure)
router.get('/hierarchy', ItemCategoryController.getCategoryHierarchy);

// Get category by ID
router.get('/:id', ItemCategoryController.getCategoryById);

// Create new category
router.post('/', ItemCategoryController.createCategory);

// Update category
router.put('/:id', ItemCategoryController.updateCategory);

// Delete category (soft delete)
router.delete('/:id', ItemCategoryController.deleteCategory);

module.exports = router;