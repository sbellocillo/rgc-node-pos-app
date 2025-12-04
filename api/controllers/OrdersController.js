const Orders = require('../models/Orders');
const pool = require('../config/database');

class OrdersController {
    // Get all orders
    static async getAllOrders(req, res) {
        try {
            const result = await pool.query(`SELECT 
              o.*,
              CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
              ot.name AS order_type_name,
              s.name AS status_name,
              pm.name AS payment_method_name,
              l.name AS location_name,
              cn.name AS card_network_name,
              cn.code AS card_network_code
            FROM orders o
            LEFT JOIN customers c ON o.customer_id = c.id
            LEFT JOIN order_type ot ON o.order_type_id = ot.id
            LEFT JOIN status s ON o.status_id = s.id
            LEFT JOIN paymentmethod pm ON o.payment_method_id = pm.id
            LEFT JOIN location l ON o.location_id = l.id
            LEFT JOIN card_networks cn ON o.card_network_id = cn.id`);

            res.status(200).json({
                success: true,
                message: 'Orders retrieved successfully',
                data: result.rows,
                count: result.rows.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving orders',
                error: error.message
            });
        }
    }

    // Get order by ID
    static async getOrderById(req, res) {
        try {
            const { id } = req.params;
            const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Order retrieved successfully',
                data: result.rows[0]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving order',
                error: error.message
            });
        }
    }


    //create order structure
    // {
    //   "customer_id": 1,
    //   "status_id": 1,
    //   "order_type_id": 1,
    //   "subtotal": 100,
    //   "tax_percentage": 0.12,
    //   "tax_amount": 12,
    //   "total": 112,
    //   "role_id": 2,
    //   "location_id": 1,
    //   "payment_method_id": 1,
    //   "created_by": 1,
    //   "items": [
    //     { "item_id": 101, "quantity": 2, "rate": 50, "subtotal": 100, "tax_percentage": 0.12, "tax_amount": 12, "amount": 112 }
    //   ]
    // }


    static async createOrder(req, res) {
        // controllers/orderController.js

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const {
                customer_id,
                status_id,
                order_type_id,
                tax_percentage,
                tax_amount,
                total,
                role_id,
                location_id,
                payment_method_id,
                card_network_id,
                created_by,
                items // array of items [{ item_id, quantity, rate, tax_percentage, tax_amount, amount }]
            } = req.body;
            console.log("creating order", req.body)
            // 1. Insert into orders (no shipping_address or billing_address)
            const orderInsertQuery = `
                INSERT INTO "orders" (
                  customer_id, status_id, order_type_id,
                  tax_percentage, tax_amount, total,
                  role_id, location_id, payment_method_id, card_network_id, created_by
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
                RETURNING id
              `;
            const orderResult = await client.query(orderInsertQuery, [
                customer_id,
                status_id,
                order_type_id,

                tax_percentage,
                tax_amount,
                total,
                role_id,
                location_id,
                payment_method_id,
                card_network_id,
                created_by
            ]);

            const orderId = orderResult.rows[0].id;

            // 2. Insert order items
            const itemPromises = items.map(item => {
                const itemInsertQuery = `
               INSERT INTO order_items (
                 order_id, item_id, quantity, rate, tax_percentage, tax_amount, amount
               )
               VALUES ($1,$2,$3,$4,$5,$6,$7)
             `;
                return client.query(itemInsertQuery, [
                    orderId,
                    item.item_id,
                    item.quantity,
                    item.rate,
                    item.tax_percentage,
                    item.tax_amount,
                    item.amount
                ]);
            });

            await Promise.all(itemPromises);

            await client.query('COMMIT');

            res.status(201).json({ message: 'Order created', orderId });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error(error);
            res.status(500).json({ error: 'Failed to create order' });
        } finally {
            client.release();
        }

    }

    // Create new order with automatic tax calculation
    static async createOrderv1(req, res) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Validate input data using the Orders model
            const orderData = new Orders(req.body);
            const validation = orderData.validate();

            if (!validation.isValid) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.errors
                });
            }

            // Get default tax configuration if tax_percentage not provided
            let taxPercentage = orderData.tax_percentage;
            if (taxPercentage === null || taxPercentage === undefined) {
                try {
                    const taxResult = await client.query(
                        'SELECT tax_rate FROM tax_config WHERE is_default = true AND is_active = true LIMIT 1'
                    );
                    if (taxResult.rows.length > 0) {
                        taxPercentage = taxResult.rows[0].tax_rate;
                    } else {
                        taxPercentage = 0; // Default to 0% if no tax config found
                    }
                } catch (taxError) {
                    console.warn('Could not fetch default tax rate:', taxError.message);
                    taxPercentage = 0;
                }
            }

            // Calculate tax amounts
            const amounts = Orders.calculateAmounts(orderData.subtotal, taxPercentage);

            const result = await client.query(`
                INSERT INTO orders (
                    user_id, customer_name, customer_email, customer_phone,
                    status_id, order_type_id, subtotal, tax_percentage,
                    tax_amount, total_amount, payment_method_id,
                    location_id, card_network_id, special_instructions
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                RETURNING *`,
                [
                    orderData.user_id,
                    orderData.customer_name,
                    orderData.customer_email,
                    orderData.customer_phone,
                    orderData.status_id,
                    orderData.order_type_id,
                    amounts.subtotal,
                    taxPercentage,
                    amounts.taxAmount,
                    amounts.totalAmount,
                    orderData.payment_method_id,
                    orderData.location_id,
                    orderData.card_network_id,
                    orderData.special_instructions
                ]
            );

            await client.query('COMMIT');

            res.status(201).json({
                success: true,
                message: 'Order created successfully',
                data: result.rows[0]
            });
        } catch (error) {
            await client.query('ROLLBACK');
            res.status(500).json({
                success: false,
                message: 'Error creating order',
                error: error.message
            });
        } finally {
            client.release();
        }
    }

    static async updateOrder(req, res) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const {
                order_id,
                customer_id,
                status_id,
                order_type_id,
                subtotal,
                tax_percentage,
                tax_amount,
                total,
                role_id,
                location_id,
                payment_method_id,
                created_by,
                items // new items array to replace existing items
            } = req.body;

            // 1. Update order
            const updateOrderQuery = `
      UPDATE "order"
      SET 
        customer_id = $1,
        status_id = $2,
        order_type_id = $3,
        subtotal = $4,
        tax_percentage = $5,
        tax_amount = $6,
        total = $7,
        role_id = $8,
        location_id = $9,
        payment_method_id = $10,
        created_by = $11
      WHERE id = $12
    `;

            await client.query(updateOrderQuery, [
                customer_id,
                status_id,
                order_type_id,
                subtotal,
                tax_percentage,
                tax_amount,
                total,
                role_id,
                location_id,
                payment_method_id,
                created_by,
                order_id
            ]);

            // 2. Delete old items (soft delete)
            await client.query(`UPDATE order_item SET is_active = false WHERE order_id = $1`, [order_id]);

            // 3. Insert new items
            const itemPromises = items.map(item => {
                const insertItemQuery = `
        INSERT INTO order_item (
          order_id, item_id, quantity, rate, subtotal, tax_percentage, tax_amount, amount
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      `;

                return client.query(insertItemQuery, [
                    order_id,
                    item.item_id,
                    item.quantity,
                    item.rate,
                    item.subtotal,
                    item.tax_percentage,
                    item.tax_amount,
                    item.amount
                ]);
            });

            await Promise.all(itemPromises);

            await client.query('COMMIT');

            res.status(200).json({
                message: 'Order updated successfully',
                orderId: order_id
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error(error);
            res.status(500).json({ error: 'Failed to update order' });
        } finally {
            client.release();
        }
    };
    // Update order with tax recalculation
    static async updateOrderv1(req, res) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const { id } = req.params;

            const existingOrder = await client.query('SELECT * FROM orders WHERE order_id = $1', [id]);

            if (existingOrder.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            // Validate input data using the Orders model
            const orderData = new Orders(req.body);
            const validation = orderData.validate();

            if (!validation.isValid) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.errors
                });
            }

            // Recalculate tax if subtotal or tax_percentage changed
            let taxPercentage = orderData.tax_percentage;
            if (taxPercentage === null || taxPercentage === undefined) {
                taxPercentage = existingOrder.rows[0].tax_percentage; // Keep existing
            }

            const amounts = Orders.calculateAmounts(orderData.subtotal, taxPercentage);

            const result = await client.query(`
                UPDATE orders SET 
                    user_id = $1, customer_name = $2, customer_email = $3, customer_phone = $4,
                    status_id = $5, order_type_id = $6, subtotal = $7, tax_percentage = $8,
                    tax_amount = $9, total_amount = $10, payment_method_id = $11,
                    location_id = $12, card_network_id = $13, special_instructions = $14, updated_at = CURRENT_TIMESTAMP
                WHERE order_id = $15
                RETURNING *`,
                [
                    orderData.user_id,
                    orderData.customer_name,
                    orderData.customer_email,
                    orderData.customer_phone,
                    orderData.status_id,
                    orderData.order_type_id,
                    amounts.subtotal,
                    taxPercentage,
                    amounts.taxAmount,
                    amounts.totalAmount,
                    orderData.payment_method_id,
                    orderData.location_id,
                    orderData.card_network_id,
                    orderData.special_instructions,
                    id
                ]
            );

            await client.query('COMMIT');

            res.status(200).json({
                success: true,
                message: 'Order updated successfully',
                data: result.rows[0]
            });
        } catch (error) {
            await client.query('ROLLBACK');
            res.status(500).json({
                success: false,
                message: 'Error updating order',
                error: error.message
            });
        } finally {
            client.release();
        }
    }

    // Delete order
    static async deleteOrder(req, res) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const { id } = req.params;

            const existingOrder = await client.query('SELECT * FROM orders WHERE order_id = $1', [id]);

            if (existingOrder.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            // Delete related order items first
            await client.query('DELETE FROM order_items WHERE order_id = $1', [id]);

            // Delete the order
            const result = await client.query('DELETE FROM orders WHERE order_id = $1 RETURNING *', [id]);
            await client.query('COMMIT');

            res.status(200).json({
                success: true,
                message: 'Order deleted successfully',
                data: result.rows[0]
            });
        } catch (error) {
            await client.query('ROLLBACK');
            res.status(500).json({
                success: false,
                message: 'Error deleting order',
                error: error.message
            });
        } finally {
            client.release();
        }
    }

    // Cancel order and all related order items
    static async cancelOrder(req, res) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const { id } = req.params;

            // Check if order exists and is not already cancelled
            const orderCheck = await client.query(
                'SELECT o.*, s.name as status_name FROM orders o LEFT JOIN status s ON o.status_id = s.id WHERE o.id = $1 AND o.is_active = true',
                [id]
            );

            if (orderCheck.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({
                    success: false,
                    message: 'Order not found or already inactive'
                });
            }

            const order = orderCheck.rows[0];

            // Check if order is already cancelled
            if (order.status_name && order.status_name.toLowerCase() === 'cancelled') {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    success: false,
                    message: 'Order is already cancelled'
                });
            }

            // Get cancelled status ID
            const cancelledStatusQuery = await client.query(
                "SELECT id FROM status WHERE LOWER(name) = 'cancelled' LIMIT 1"
            );

            if (cancelledStatusQuery.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(500).json({
                    success: false,
                    message: 'Cancelled status not found in system'
                });
            }

            const cancelledStatusId = cancelledStatusQuery.rows[0].id;

            // Update order status to cancelled
            const orderResult = await client.query(
                'UPDATE orders SET status_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
                [cancelledStatusId, id]
            );

            // Update all related order items to cancelled status
            const orderItemsResult = await client.query(
                'UPDATE order_items SET status_id = $1, is_active = false WHERE order_id = $2 RETURNING *',
                [cancelledStatusId, id]
            );

            await client.query('COMMIT');

            res.status(200).json({
                success: true,
                message: 'Order and all items cancelled successfully',
                data: {
                    order: orderResult.rows[0],
                    cancelled_items: orderItemsResult.rows,
                    cancelled_items_count: orderItemsResult.rows.length
                }
            });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error cancelling order:', error);
            res.status(500).json({
                success: false,
                message: 'Error cancelling order',
                error: error.message
            });
        } finally {
            client.release();
        }
    }

    // Get cancelled orders
    static async getCancelledOrders(req, res) {
        try {
            const query = `
                SELECT o.*, s.name as status_name, 
                       COUNT(oi.id) as total_items,
                       COUNT(oi.id) FILTER (WHERE oi.is_active = false) as cancelled_items
                FROM orders o 
                LEFT JOIN status s ON o.status_id = s.id 
                LEFT JOIN order_items oi ON o.id = oi.order_id
                WHERE LOWER(s.name) = 'cancelled' AND o.is_active = true
                GROUP BY o.id, s.name
                ORDER BY o.updated_at DESC
            `;

            const result = await pool.query(query);

            res.status(200).json({
                success: true,
                message: 'Cancelled orders retrieved successfully',
                data: result.rows,
                count: result.rows.length
            });
        } catch (error) {
            console.error('Error getting cancelled orders:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving cancelled orders',
                error: error.message
            });
        }
    }
}

module.exports = OrdersController;