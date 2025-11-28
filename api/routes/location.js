const express = require('express');
const router = express.Router();
const LocationController = require('../controllers/LocationController');
const Location = require('../models/Location');

// GET /api/location - Get all locations
router.get('/', LocationController.createGetAll('location', Location));
// GET /api/location/:id - Get location by ID
router.get('/:id', LocationController.createGetById('location', Location));

// POST /api/location - Create new location
router.post('/', LocationController.createPost('location', Location));

// PUT /api/location/:id - Update location
router.put('/:id', LocationController.createPut('location', Location));

// DELETE /api/location/:id - Delete location
router.delete('/:id', LocationController.createDelete('location'));

module.exports = router;