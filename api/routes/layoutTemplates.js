const express = require('express');
const router = express.Router();
const LayoutTemplateController = require('../controllers/LayoutTemplateController');

// Get all templates (supports query param ?layout_id=X)
router.get('/', LayoutTemplateController.getAll);

// Get template by ID
router.get('/:id', LayoutTemplateController.getById);

// Bulk save templates (Main method for Admin UI)
router.post('/bulk', LayoutTemplateController.bulkSave);

// Create single template (Optional)
router.post('/', LayoutTemplateController.create);

// Delete template
router.delete('/:id', LayoutTemplateController.delete);

module.exports = router;