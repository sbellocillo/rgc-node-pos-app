const CardNetwork = require('../models/CardNetwork');

class CardNetworkController {
    // Get all card networks
    async getAll(req, res) {
        try {
            const cardNetworks = await CardNetwork.getAll();
            res.json({
                success: true,
                data: cardNetworks,
                count: cardNetworks.length
            });
        } catch (error) {
            console.error('Error fetching card networks:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching card networks',
                error: error.message
            });
        }
    }

    // Get card network by ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const cardNetwork = await CardNetwork.getById(id);
            
            if (!cardNetwork) {
                return res.status(404).json({
                    success: false,
                    message: 'Card network not found'
                });
            }

            res.json({
                success: true,
                data: cardNetwork
            });
        } catch (error) {
            console.error('Error fetching card network:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching card network',
                error: error.message
            });
        }
    }

    // Get card network by code
    async getByCode(req, res) {
        try {
            const { code } = req.params;
            const cardNetwork = await CardNetwork.getByCode(code);
            
            if (!cardNetwork) {
                return res.status(404).json({
                    success: false,
                    message: 'Card network not found'
                });
            }

            res.json({
                success: true,
                data: cardNetwork
            });
        } catch (error) {
            console.error('Error fetching card network:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching card network',
                error: error.message
            });
        }
    }

    // Create new card network
    async create(req, res) {
        try {
            const { code, name, description } = req.body;

            if (!code || !name) {
                return res.status(400).json({
                    success: false,
                    message: 'Code and name are required'
                });
            }

            const cardNetwork = await CardNetwork.create({
                code,
                name,
                description
            });

            res.status(201).json({
                success: true,
                message: 'Card network created successfully',
                data: cardNetwork
            });
        } catch (error) {
            console.error('Error creating card network:', error);
            res.status(400).json({
                success: false,
                message: 'Error creating card network',
                error: error.message
            });
        }
    }

    // Update card network
    async update(req, res) {
        try {
            const { id } = req.params;
            const { code, name, description } = req.body;

            if (!code || !name) {
                return res.status(400).json({
                    success: false,
                    message: 'Code and name are required'
                });
            }

            const cardNetwork = await CardNetwork.update(id, {
                code,
                name,
                description
            });

            if (!cardNetwork) {
                return res.status(404).json({
                    success: false,
                    message: 'Card network not found'
                });
            }

            res.json({
                success: true,
                message: 'Card network updated successfully',
                data: cardNetwork
            });
        } catch (error) {
            console.error('Error updating card network:', error);
            res.status(400).json({
                success: false,
                message: 'Error updating card network',
                error: error.message
            });
        }
    }

    // Delete card network
    async delete(req, res) {
        try {
            const { id } = req.params;
            const cardNetwork = await CardNetwork.delete(id);

            if (!cardNetwork) {
                return res.status(404).json({
                    success: false,
                    message: 'Card network not found'
                });
            }

            res.json({
                success: true,
                message: 'Card network deleted successfully',
                data: cardNetwork
            });
        } catch (error) {
            console.error('Error deleting card network:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting card network',
                error: error.message
            });
        }
    }
}

module.exports = new CardNetworkController();
