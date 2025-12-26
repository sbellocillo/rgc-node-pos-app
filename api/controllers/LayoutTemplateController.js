const LayoutTemplate = require('../models/LayoutTemplate');

class LayoutTemplateController {
    
    // Get all templates (supports ?layout_id=1 filter)
    async getAll(req, res) {
        try {
            const { layout_id } = req.query;
            const templates = await LayoutTemplate.getAll(layout_id);
            
            res.json({
                success: true,
                data: templates,
                count: templates.length
            });
        } catch (error) {
            console.error('Error fetching layout templates:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching layout templates',
                error: error.message
            });
        }
    }

    // Get template by ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const template = await LayoutTemplate.getById(id);

            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: 'Layout template not found'
                });
            }

            res.json({
                success: true,
                data: template
            });
        } catch (error) {
            console.error('Error fetching layout template:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching layout template',
                error: error.message
            });
        }
    }

    // Bulk Upsert (Save multiple slots at once)
    async bulkSave(req, res) {
        try {
            const { items } = req.body;

            if (!items || !Array.isArray(items)) {
                return res.status(400).json({
                    success: false,
                    message: 'Items array is required'
                });
            }

            const results = await LayoutTemplate.bulkUpsert(items);

            res.status(200).json({
                success: true,
                message: 'Layout templates updated successfully',
                data: results,
                count: results.length
            });
        } catch (error) {
            console.error('Error saving layout templates:', error);
            res.status(400).json({
                success: false,
                message: 'Error saving layout templates',
                error: error.message
            });
        }
    }

    // Create single entry (Optional helper)
    async create(req, res) {
        try {
            const { layout_id, layout_indices_id, item_id } = req.body;

            if (!layout_id || !layout_indices_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Layout ID and indices ID are required'
                });
            }

            const template = await LayoutTemplate.create({
                layout_id,
                layout_indices_id,
                item_id
            });

            res.status(201).json({
                success: true,
                message: 'Template created successfully',
                data: template
            });

        } catch (error) {
            console.error('Error creating template:', error);
            res.status(400).json({
                success: false,
                message: 'Error creating template',
                error: error.message
            });
        }
    }

    // Delete template entry
    async delete(req, res) {
        try {
            const { id } = req.params;
            const template = await LayoutTemplate.delete(id);

            if (!template) {
                return res.status(404).json({
                    success: false,
                    message: 'Layout template not found'
                });
            }

            res.json({
                success: true,
                message: 'Layout template deleted successfully',
                data: template
            });
        } catch (error) {
            console.error('Error deleting layout template:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting layout template',
                error: error.message
            });
        }
    }

    // Clear all items from a layout
    async deleteByLayout(req, res) {
        try {
            const { layout_id } = req.params;

            if (!layout_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Layout ID is required'
                });
            }

            const deletedItems = await LayoutTemplate.deleteByLayoutId(layout_id);

            res.json({
                success: true,
                message: `Layout template cleared successfully. Removed ${deletedItems.length} items`,
                count: deletedItems.length
            });
        } catch (error) {
            console.error('Error clearing layout template:', error);
            res.status(500).json({
                success: false,
                message: 'Error clearing layout template',
                error: error.message
            });
        }
    }
}

module.exports = new LayoutTemplateController();