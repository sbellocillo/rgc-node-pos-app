const OrderItems = require('../models/OrderItems');
const pool = require('../config/database');

class OrderItemsController {
    // Get all order items
    static async getAllOrderItems(req, res) {
        try {
            const result = await pool.query('SELECT * FROM order_items ORDER BY id');
            const orderItems = result.rows.map(itemData => OrderItems.create(itemData));
            
            res.status(200).json({
                success: true,
                message: 'Order items retrieved successfully',
                data: orderItems,
                count: orderItems.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving order items',
                error: error.message
            });
        }
    }

    // Get order items by order ID
    static async getOrderItemsByOrderId(req, res) {
        try {
            const { order_id } = req.params;
            const result = await pool.query('SELECT * FROM order_items WHERE order_id = $1 ORDER BY id', [order_id]);
            const orderItems = result.rows.map(itemData => OrderItems.create(itemData));
            
            res.status(200).json({
                success: true,
                message: `Order items for order ${order_id} retrieved successfully`,
                data: orderItems,
                count: orderItems.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving order items',
                error: error.message
            });
        }
    }

    // Get order item by ID
    static async getOrderItemById(req, res) {
        try {
            const { id } = req.params;
            const result = await pool.query('SELECT * FROM order_items WHERE id = $1', [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Order item not found'
                });
            }

            const orderItem = OrderItems.create(result.rows[0]);
            
            res.status(200).json({
                success: true,
                message: 'Order item retrieved successfully',
                data: orderItem
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving order item',
                error: error.message
            });
        }
    }

    // Create new order item
    static async createOrderItem(req, res) {
        try {
            const { order_id, item_id, quantity, rate, amount } = req.body;
            
            const tempOrderItem = OrderItems.create({ order_id, item_id, quantity, rate, amount });
            const validation = tempOrderItem.validate();

            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.errors
                });
            }

            const result = await pool.query(
                'INSERT INTO order_items (order_id, item_id, quantity, rate, amount) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [order_id, item_id, quantity, rate, amount]
            );
            
            const orderItem = OrderItems.create(result.rows[0]);
            
            res.status(201).json({
                success: true,
                message: 'Order item created successfully',
                data: orderItem
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating order item',
                error: error.message
            });
        }
    }

    // Update order item
    static async updateOrderItem(req, res) {
        try {
            const { id } = req.params;
            const { order_id, item_id, quantity, rate, amount } = req.body;

            const existingOrderItem = await pool.query('SELECT * FROM order_items WHERE id = $1', [id]);
            
            if (existingOrderItem.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Order item not found'
                });
            }

            const tempOrderItem = OrderItems.create({ order_id, item_id, quantity, rate, amount });
            const validation = tempOrderItem.validate();

            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.errors
                });
            }

            const result = await pool.query(
                'UPDATE order_items SET order_id = $1, item_id = $2, quantity = $3, rate = $4, amount = $5 WHERE id = $6 RETURNING *',
                [order_id, item_id, quantity, rate, amount, id]
            );
            
            const orderItem = OrderItems.create(result.rows[0]);
            
            res.status(200).json({
                success: true,
                message: 'Order item updated successfully',
                data: orderItem
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating order item',
                error: error.message
            });
        }
    }

    // Delete order item
    static async deleteOrderItem(req, res) {
        try {
            const { id } = req.params;
            
            const existingOrderItem = await pool.query('SELECT * FROM order_items WHERE id = $1', [id]);
            
            if (existingOrderItem.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Order item not found'
                });
            }
            
            await pool.query('DELETE FROM order_items WHERE id = $1', [id]);
            
            res.status(200).json({
                success: true,
                message: 'Order item deleted successfully',
                data: { id: parseInt(id) }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting order item',
                error: error.message
            });
        }
    }
}

module.exports = OrderItemsController;