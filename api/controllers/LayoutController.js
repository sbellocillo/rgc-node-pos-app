const Layout = require('../models/Layout');

class LayoutController {
    // Get all layouts
    async getAll(req, res) {
        try {
            const layouts = await Layout.getAll();
            res.json({
                success: true,
                data: layouts,
                count: layouts.length
            });
        } catch (error) {
            console.error('Error fetching layouts:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching layouts',
                error: error.message
            });
        }
    }

    // Get layout by ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const layout = await Layout.getById(id);

            if (!layout) {
                return res.status(404).json({
                    success: false,
                    message: 'Layout not found'
                });
            }

            res.json({
                success: true,
                data: layout
            });
        } catch (error) {
            console.error('Error fetching layout:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching layout',
                error: error.message
            });
        }
    }

    // Get layouts by item type
    async getByItemType(req, res) {
        try {
            const { item_type_id } = req.params;
            const layouts = await Layout.getByItemType(item_type_id);

            res.json({
                success: true,
                data: layouts,
                count: layouts.length
            });
        } catch (error) {
            console.error('Error fetching layouts by item type:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching layouts by item type',
                error: error.message
            });
        }
    }

    // Get default layouts
    async getDefaults(req, res) {
        try {
            const layouts = await Layout.getDefaults();
            res.json({
                success: true,
                data: layouts,
                count: layouts.length
            });
        } catch (error) {
            console.error('Error fetching default layouts:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching default layouts',
                error: error.message
            });
        }
    }

    // Create new layout
    async create(req, res) {
        try {
            const { name, item_type_id, is_default, is_active } = req.body;

            if (!name || !item_type_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Name and item type ID are required'
                });
            }

            const layout = await Layout.create({
                name,
                item_type_id,
                is_default,
                is_active
            });

            res.status(201).json({
                success: true,
                message: 'Layout created successfully',
                data: layout
            });
        } catch (error) {
            console.error('Error creating layout:', error);
            res.status(400).json({
                success: false,
                message: 'Error creating layout',
                error: error.message
            });
        }
    } 

    // Update layout
    async update(req, res) {
        try {
            const { id } = req.params;
            const { name, item_type_id, is_default, is_active } = req.body;

            if (!name || !item_type_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Name and item type ID are required'
                });
            }

            const layout = await Layout.update(id, {
                name,
                item_type_id,
                is_default,
                is_active
            });

            if (!layout) {
                return res.status(404).json({
                    success: false,
                    message: 'Layout not found'
                });
            }

            res.json({
                success: true,
                message: 'Layout updated successfully',
                data: layout
            });
        } catch (error) {
            console.error('Error updating layout:', error);
            res.status(400).json({
                success: false,
                message: 'Error updating layout',
                error: error.message
            });
        }
    }

    // Delete layout
    async delete(req, res) {
        try {
            const { id } = req.params;
            const layout = await Layout.delete(id);

            if (!layout) {
                return res.status(404).json({
                    success: false,
                    message: 'Layout not found'
                });
            } 

            res.json({
                success: true,
                message: 'Layout deleted successfully',
                data: layout
            });
        } catch (error) {
            console.error('Error deleting layout:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting layout',
                error: error.message
            });
        }
    }
}

module.exports = new LayoutController();