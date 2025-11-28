const express = require('express');
const router = express.Router();
const LookupController = require('../controllers/LookupController');

// GET /api/status - Get all status
router.get('/', LookupController.getOrderStatuses);
router.post('/', LookupController.createStatus);

// PUT /api/status/:id - Update status
router.put('/:id', LookupController.updateStatus);

// DELETE /api/status/:id - Delete status
router.delete('/:id', LookupController.deleteStatus);

// GET /api/status/:id - Get status by ID  
router.get('/:id', LookupController.getStatusById);
module.exports = router;