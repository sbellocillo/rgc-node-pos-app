const PosTerminal = require('../models/PosTerminal');

class PosTerminalController {

    // Get all terminals
    async getAll(req, res) {
        try {
            const terminals = await PosTerminal.getAll();
            res.json({
                success: true,
                data: terminals,
                count: terminals.length
            });
        } catch (error) {
            console.error('Error fetching terminals:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching terminals',
                error: error.message
            });
        }
    }

    // Get terminal by ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const terminal = await PosTerminal.getById(id);

            if (!terminal) {
                return res.status(404).json({
                    success: false,
                    message: 'Terminal not found'
                });
            }

            res.json({
                success: true,
                data: terminal
            });
        } catch (error) {
            console.error('Error fetching terminals:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching terminal',
                error: error.message
            });
        }
    }

    // Get terminals by Location
    async getByLocation(req, res) {
        try {
            const { location_id } = req.params;
            const terminals = await PosTerminal.getByLocation(location_id);

            res.json({
                success: true,
                data: terminals,
                count: terminals.length
            });
        } catch (error) {
            console.error('Error fetching terminals by location:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching terminals by location',
                error: error.message
            });
        }
    }

    // Create new terminal
    async create(req, res) {
        try {
            const terminal = await PosTerminal.create(req.body);
            res.status(201).json({
                success: true,
                message: 'Terminal created successfully',
                data: terminal
            });
        } catch (error) {
            console.error('Error creating terminal:', error);
            res.status(400).json({
                success: false,
                message: 'Error creating terminal',
                error: error.message
            });
        }
    }

    // Update terminal
    async update(req, res) {
        try {
            const { id } = req.params;
            const terminal = await PosTerminal.update(id, req.body);

            if(!terminal) {
                return res.status(404).json({
                    success: false,
                    message: 'Terminal not found'
                });
            }
            
            res.json({
                success: true,
                message: 'Terminal updated successfully',
                data: terminal
            })
        } catch (error) {
            console.error('Error updating terminal:', error);
            res.status(400).json({
                success: false,
                message: 'Error updating terminal',
                error: error.message
            });
        }
    }

    // Delete terminal
    async delete(req, res) {
        try {
            const { id } = req.params;
            const terminal = await PosTerminal.delete(id);

            if (!terminal) {
                return res.status(404).json({
                    success: false,
                    message: 'Terminal not found'
                });
            }

            res.json({
                success: true,
                message: 'Terminal deleted successfully',
                data: terminal
            });
        } catch (error) {
            console.error('Error deleting terminal:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting terminal',
                error: error.message
            });
        }
    }
}

module.exports = new PosTerminalController();