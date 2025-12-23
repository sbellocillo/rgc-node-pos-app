const LayoutIndices = require('../models/LayoutIndices');

class LayoutIndicesController {
    // Get all layout indices
    async getAll(req, res){
        try {
            const indices = await LayoutIndices.getAll();
            res.json({
                success: true,
                data: indices,
                count: indices.length
            });
        } catch (error) {
            console.error('Error fetchcing layout indices', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching layout indices',
                error: error.message
            });
        }
    }

    // Get layout index by ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const index = await LayoutIndices.getById(id);

            if(!index) {
                return res.status(404).json({
                    success: false,
                    message: 'Layout index not found'
                });
            }

            res.json({
                success: true,
                data: index
            });
        } catch (error) {
            console.error('Error fetching layout index:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching layout index',
                error: error.message
            });
        }
    }

    // Get layout index by grid_index
    async getByGridIndex(req, res) {
        try {
            const { grid_index } = req.params;
            const index = await LayoutIndices.getByGridIndex(grid_index);

            if (!index) {
                return res.status(404).json({
                    success: false,
                    message: 'Layout index not found'
                });
            }

            res.json({
                success: true,
                data: index
            });
        } catch (error) {
            console.error('Error fetching layout index:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching layout index',
                error: error.message
            });
        }
    }

    // Get all active layout indices
    async getActive(req, res) {
        try {
            const indices = await LayoutIndices.getActive();
            res.json({
                success: true,
                data: indices,
                count: indices.length
            });
        } catch (error) {
            console.error('Error fetching acctive layout indices:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching active layout indices',
                error: error.message
            });
        }
    }
}

module.exports = new LayoutIndicesController();