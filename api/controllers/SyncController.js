const Sync = require('../models/Sync');

class SyncController {
    // Process offline orders
    async syncOrders(req, res) {
        try {
            // Assume the body contains the order data directly
            const result = await Sync.processOrder(req.body);

            // If it was already synced, still return 200 OK but with status info
            if (result.status === 'already_synced') {
                return res.json({
                    success: true,
                    message: 'Order already synced',
                    data: result
                });
            }

            res.status(201).json({
                success: true,
                message: 'Order synced successfully',
                data: result
            });
        } catch (error) {
            console.error('Error syncing order:', error);

            // Handle validation errors
            if (error.message.includes('required') || error.message.includes('must contain')) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    error: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error processing sync',
                error: error.message
            });
        }
    }
}

module.exports = new SyncController();