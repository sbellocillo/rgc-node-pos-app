const express = require('express');
const router = express.Router();
const RolesController = require('../controllers/RolesController');

// GET /api/roles - Get all roles
router.get('/', RolesController.getAllRoles);

// GET /api/roles/:id - Get role by ID
router.get('/:id', RolesController.getRoleById);

// POST /api/roles - Create new role
router.post('/', RolesController.createRole);

// PUT /api/roles/:id - Update role
router.put('/:id', RolesController.updateRole);

// DELETE /api/roles/:id - Delete role
router.delete('/:id', RolesController.deleteRole);

module.exports = router;