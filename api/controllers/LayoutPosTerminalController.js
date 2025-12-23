const LayoutPosTerminal = require('../models/LayoutPosTerminal');

class LayoutPosTerminalController {
    // Get all positions
    async getAll(req, res) {
        try {
            const positions = await LayoutPosTerminal.getAll();
            res.json({
                success: true,
                data: positions,
                count: positions.length
            });
        } catch (error) {
            console.error('Error fetching positions:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching positions',
                error: error.message
            });
        }
    }

    // Get position by ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const position = await LayoutPosTerminal.getById(id);

            if (!position) {
                return res.status(404).json({
                    success: false,
                    message: 'Position not found'
                });
            }

            res.json ({
                success: true,
                data: position
            });
        } catch (error) {
            console.error('Error fetching positionn:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching position',
                error: error.message
            });
        }
    }

    // Get positions by location
    async getByLocation(req, res){
        try {
            const { location_id } = req.params;
            const positions = await LayoutPosTerminal.getByLocation(location_id);

            res.json({
                success: true,
                data: positions,
                count: positions.length
            });
        } catch (error) {
            console.error('Error fetching positions by location:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching positions by location',
                error: error.message
            });
        }
    }

    async getByLayoutAndLocation(req, res) {
        try {
            const { layout_id, location_id } = req.params;
            const positions = await LayoutPosTerminal.getByLayoutAndLocation(layout_id, location_id);

            res.json({
                success: true,
                data: positions,
                count: positions.length
            });
        } catch (error) {
            console.error('Error fetching positions:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching positions',
                error: error.message
            });
        }
    }

    // Create new positions
    async create(req, res) {
        try {
            const { layout_indices_id, location_id, layout_id, item_id, item_type_id, is_active } = req.body;

            if (!layout_indices_id || !location_id || !layout_id || !item_id || !item_type_id) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
            }

            const position = await LayoutPosTerminal.create({
                layout_indices_id,
                location_id,
                layout_id,
                item_id,
                item_type_id,
                is_active
            });

            res.status(201).json({
                success: true,
                message: 'Position created successfully',
                data: position
            });
        } catch (error) {
            console.error('Error creating position:', error);
            res.status(400).json({
                success: false,
                message: 'Error creating position',
                error: error.message
            });
        }
    }

    // Bulk create positions for a location
    async bulkCreateForLocation(req, res) {
        try {
            const { location_id, mappings } = req.body;

            if(!location_id || !mappings || !Array.isArray(mappings)) {
                return res.status(400).json({
                    success: false,
                    message: 'Location ID and mappings array are required'
                });
            }

            const positions = await LayoutPosTerminal.bulkCreateForLocation(location_id, mappings);

            res.status(201).json({
                success: true,
                message: 'Positions created successfully',
                data: positions,
                count: positions.length
            });
        } catch (error) {
            console.error('Error bulk creating positions:', error);
            res.status(400).json({
                success: false,
                message: 'Error bulk creating positions',
                error: error.message
            });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { layout_indices_id, location_id, layout_id, item_id, item_type_id, is_active } = req.body;

            if (!layout_indices_id || !location_id || !layout_id || !item_id || !item_type_id) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
            }

            const position = await LayoutPosTerminal.update(id, {
                layout_indices_id,
                location_id,
                layout_id,
                item_id,
                item_type_id,
                is_active
            });

            if (!position) {
                return res.status(404).json({
                    success: false,
                    message: 'Position not found'
                });
            }

            res.json({
                success: true,
                message: 'Position updated successfully',
                data: position
            });
        } catch (error) {
            console.error('Error updating position:', error);
            res.status(400).json({
                success: false,
                message: 'Error updating position',
                error: error.message
            });
        }
    }

    // Delete position
    async delete(req, res) {
        try {
            const { id } = req.params;
            const position = await LayoutPosTerminal.delete(id);

            if (!position) {
                return res.status(404).json({
                    success: false,
                    message: 'Position not found'
                });
            }

            res.json({
                success: true,
                message: 'Position deleted successfully',
                data: position
            });
        } catch (error) {
            console.error('Error deleting position:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting position',
                error: error.message
            });
        }
    }

    // Delete all positions for a location 
    async deleteByLocation(req, res) {
        try {
            const { location_id } = req.params;
            const positions = await LayoutPosTerminal.deleteByLocation(location_id);

            res.json({
                success: true,
                message: 'All positions for location deleted successfully',
                data: positions,
                count: positions.length
            });
        } catch (error) {
            console.error('Error deleting positions by location:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting positions by location',
                error: error.message
            });
        }
    }
}

module.exports = new LayoutPosTerminalController();