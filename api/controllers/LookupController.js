const pool = require('../config/database');

class LookupController {
    // Get all roles for dropdown/selection
    static async getRoles(req, res) {
        try {
            const query = 'SELECT * FROM roles WHERE is_active = true ORDER BY name';
            const result = await pool.query(query);

            res.json({
                success: true,
                data: result.rows,
                count: result.rows.length
            });
        } catch (error) {
            console.error('Error fetching roles:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching roles',
                error: error.message
            });
        }
    }

    // Get all item types for dropdown/selection
    static async getItemTypes(req, res) {
        try {
            const query = 'SELECT * FROM item_type WHERE is_active = true ORDER BY name';
            const result = await pool.query(query);

            res.json({
                success: true,
                data: result.rows,
                count: result.rows.length
            });
        } catch (error) {
            console.error('Error fetching item types:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching item types',
                error: error.message
            });
        }
    }

    // Get all item categories for dropdown/selection
    static async getItemCategories(req, res) {
        try {
            const { include_hierarchy = 'false' } = req.query;

            let query = 'SELECT * FROM item_category WHERE is_active = true ORDER BY display_order ASC, name ASC';
            const result = await pool.query(query);

            let data = result.rows;

            // If hierarchy is requested, build tree structure
            if (include_hierarchy === 'true') {
                const categoryMap = new Map();
                const rootCategories = [];

                // Create map for quick lookup
                data.forEach(category => {
                    categoryMap.set(category.id, { ...category, children: [] });
                });

                // Build tree structure
                data.forEach(category => {
                    const categoryNode = categoryMap.get(category.id);

                    if (category.parent_category_id) {
                        const parent = categoryMap.get(category.parent_category_id);
                        if (parent) {
                            parent.children.push(categoryNode);
                        }
                    } else {
                        rootCategories.push(categoryNode);
                    }
                });

                data = rootCategories;
            }

            res.json({
                success: true,
                data: data,
                count: result.rows.length
            });
        } catch (error) {
            console.error('Error fetching item categories:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching item categories',
                error: error.message
            });
        }
    }

    // Get all locations for dropdown/selection
    static async getLocations(req, res) {
        try {
            const query = 'SELECT * FROM location WHERE is_active = true ORDER BY name';
            const result = await pool.query(query);

            res.json({
                success: true,
                data: result.rows,
                count: result.rows.length
            });
        } catch (error) {
            console.error('Error fetching locations:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching locations',
                error: error.message
            });
        }
    }

    // Get all order statuses for dropdown/selection
    static async getOrderStatuses(req, res) {
        try {
            const query = 'SELECT * FROM status WHERE is_active = true ORDER BY name';
            const result = await pool.query(query);

            res.json({
                success: true,
                data: result.rows,
                count: result.rows.length
            });
        } catch (error) {
            console.error('Error fetching order statuses:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching order statuses',
                error: error.message
            });
        }
    }

    // Get all order types for dropdown/selection
    static async getOrderTypes(req, res) {
        try {
            const query = 'SELECT * FROM order_type WHERE is_active = true ORDER BY name';
            const result = await pool.query(query);

            res.json({
                success: true,
                data: result.rows,
                count: result.rows.length
            });
        } catch (error) {
            console.error('Error fetching order types:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching order types',
                error: error.message
            });
        }
    }

    // Get all payment methods for dropdown/selection
    static async getPaymentMethods(req, res) {
        try {
            const query = 'SELECT * FROM paymentmethod WHERE is_active = true ORDER BY name';
            const result = await pool.query(query);

            res.json({
                success: true,
                data: result.rows,
                count: result.rows.length
            });
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching payment methods',
                error: error.message
            });
        }
    }

    // Get tax configuration for calculations
    static async getTaxConfig(req, res) {
        try {
            const query = 'SELECT * FROM tax_config WHERE is_active = true ORDER BY name';
            const result = await pool.query(query);

            res.json({
                success: true,
                data: result.rows,
                count: result.rows.length
            });
        } catch (error) {
            console.error('Error fetching tax config:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching tax config',
                error: error.message
            });
        }
    }

    // Get all lookup data in one request for form initialization
    static async getAllLookups(req, res) {
        try {
            const queries = {
                roles: 'SELECT * FROM roles WHERE is_active = true ORDER BY name',
                itemTypes: 'SELECT * FROM item_type WHERE is_active = true ORDER BY name',
                itemCategories: 'SELECT * FROM item_category WHERE is_active = true ORDER BY display_order ASC, name ASC',
                locations: 'SELECT * FROM location WHERE is_active = true ORDER BY name',
                orderStatuses: 'SELECT * FROM status WHERE is_active = true ORDER BY name',
                orderTypes: 'SELECT * FROM order_type WHERE is_active = true ORDER BY name',
                paymentMethods: 'SELECT * FROM paymentmethod WHERE is_active = true ORDER BY name',
                taxConfig: 'SELECT * FROM tax_config WHERE is_active = true ORDER BY name'
            };

            const results = {};

            // Execute all queries in parallel
            const queryPromises = Object.entries(queries).map(async ([key, query]) => {
                try {
                    const result = await pool.query(query);
                    results[key] = result.rows;
                } catch (error) {
                    console.error(`Error fetching ${key}:`, error);
                    results[key] = [];
                }
            });

            await Promise.all(queryPromises);

            res.json({
                success: true,
                data: results,
                message: 'All lookup data retrieved successfully'
            });
        } catch (error) {
            console.error('Error fetching all lookups:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching lookup data',
                error: error.message
            });
        }
    }

    // Get system configuration and settings
    static async getSystemConfig(req, res) {
        try {
            const systemInfo = {
                defaultTaxRate: 0.12, // 12% default tax rate for Philippines
                currency: 'PHP',
                currencySymbol: '₱',
                dateFormat: 'YYYY-MM-DD',
                timeFormat: 'HH:mm:ss',
                timezone: 'Asia/Manila',
                maxOrderItems: 100,
                maxCustomerLoyaltyPoints: 999999,
                loyaltyPointsPerPeso: 0.01, // 1 point per peso spent
                supportedImageFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
                maxImageSizeKB: 5120, // 5MB
                orderNumberPrefix: 'RBS',
                receiptFooter: 'Thank you for dining with Ribshack!',
                supportEmail: 'support@ribshack.com',
                supportPhone: '+63-xxx-xxx-xxxx'
            };

            res.json({
                success: true,
                data: systemInfo,
                message: 'System configuration retrieved successfully'
            });
        } catch (error) {
            console.error('Error fetching system config:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching system configuration',
                error: error.message
            });
        }
    }

    // Get dashboard summary data
    static async getDashboardSummary(req, res) {
        try {
            const { date = new Date().toISOString().split('T')[0] } = req.query;

            const summaryQueries = {
                // Today's order count
                todayOrders: `
                    SELECT COUNT(*) as count 
                    FROM orders 
                    WHERE DATE(created_at) = $1 AND is_active = true
                `,
                // Today's revenue
                todayRevenue: `
                    SELECT COALESCE(SUM(total), 0) as total 
                    FROM orders 
                    WHERE DATE(created_at) = $1 AND is_active = true
                `,
                // Active items count
                activeItems: `
                    SELECT COUNT(*) as count 
                    FROM items 
                    WHERE is_active = true
                `,
                // Active customers count
                activeCustomers: `
                    SELECT COUNT(*) as count 
                    FROM customers 
                    WHERE is_active = true
                `,
                // Pending orders
                pendingOrders: `
                    SELECT COUNT(*) as count 
                    FROM orders o
                    JOIN status s ON o.status_id = s.id
                    WHERE s.name IN ('Pending', 'In Progress', 'Preparing') 
                    AND o.is_active = true
                `
            };

            const results = {};

            for (const [key, query] of Object.entries(summaryQueries)) {
                try {
                    const result = await pool.query(query, [date]);
                    results[key] = result.rows[0];
                } catch (error) {
                    console.error(`Error fetching ${key}:`, error);
                    results[key] = { count: 0, total: 0 };
                }
            }

            res.json({
                success: true,
                data: {
                    date: date,
                    summary: results
                },
                message: 'Dashboard summary retrieved successfully'
            });
        } catch (error) {
            console.error('Error fetching dashboard summary:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching dashboard summary',
                error: error.message
            });
        }
    }

    static async getAllStatuses(req, res) {
        // Implementation for getting all statuses  
        try {
            const query = 'SELECT * FROM status WHERE is_active = true ORDER BY name';
            const result = await pool.query(query);

            res.json({
                success: true,
                data: result.rows,
                count: result.rows.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving statuses',
                error: error.message
            });
        }
    }

    static async createStatus(req, res) {
        // Implementation for creating a new status
        try {
            const { name, description } = req.body;

            const insertQuery = `
                INSERT INTO status (name, is_active, created_at, updated_at)
                VALUES ($1,true, NOW(), NOW())
                RETURNING *
            `;
            const result = await pool.query(insertQuery, [name]);

            res.status(201).json({
                success: true,
                message: 'Status created successfully',
                data: result.rows[0]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating status',
                error: error.message
            });
        }
    }

    static async updateStatus(req, res) {
        // Implementation for updating an existing status
        try {
            const { id } = req.params;
            const { name, description, is_active } = req.body;

            const updateQuery = `
                UPDATE status
                SET name = $1,
                    description = $2,
                    is_active = $3,
                    updated_at = NOW()
                WHERE id = $4
                RETURNING *
            `;
            const result = await pool.query(updateQuery, [name, description, is_active, id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Status not found'
                });
            }

            res.json({
                success: true,
                message: 'Status updated successfully',
                data: result.rows[0]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating status',
                error: error.message
            });
        }
    }
    static async deleteStatus(req, res) {
        // Implementation for deleting a status
        try {
            const { id } = req.params;

            const deleteQuery = `
                DELETE FROM status
                WHERE id = $1
                RETURNING *
            `;
            const result = await pool.query(deleteQuery, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Status not found'
                });
            }

            res.json({
                success: true,
                message: 'Status deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting status',
                error: error.message
            });
        }
    }

    static async getStatusById(req, res) {
        // Implementation for getting a status by ID
        try {
            const { id } = req.params;

            const query = 'SELECT * FROM status WHERE id = $1';
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Status not found'
                });
            }

            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving status',
                error: error.message
            });
        }
    }

    static async getAllOrderTypes(req, res) {
        // Implementation for getting all order types  
        try {
            const query = 'SELECT * FROM order_type WHERE is_active = true ORDER BY name';
            const result = await pool.query(query);

            res.json({
                success: true,
                data: result.rows,
                count: result.rows.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving order types',
                error: error.message
            });
        }
    }

    static async createOrderType(req, res) {
        // Implementation for creating a new order type
        try {
            const { name, description } = req.body;

            const insertQuery = `
                INSERT INTO order_type (name, is_active, created_at, updated_at)
                VALUES ($1,true, NOW(), NOW())
                RETURNING *
            `;
            const result = await pool.query(insertQuery, [name]);

            res.status(201).json({
                success: true,
                message: 'Order type created successfully',
                data: result.rows[0]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating order type',
                error: error.message
            });
        }
    }

    static async updateOrderType(req, res) {
        // Implementation for updating an existing order type
        try {
            const { id } = req.params;
            const { name, is_active } = req.body;
            const updateQuery = `
                UPDATE order_type
                SET name = $1,
                    updated_at = NOW()
                WHERE id = $2
                RETURNING *
            `;
            const result = await pool.query(updateQuery, [name, id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Order type not found'
                });
            }

            res.json({
                success: true,
                message: 'Order type updated successfully',
                data: result.rows[0]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating order type',
                error: error.message
            });
        }
    }

    static async deleteOrderType(req, res) {
        // Implementation for deleting an order type
        try {
            const { id } = req.params;

            const deleteQuery = `
                DELETE FROM order_type
                WHERE id = $1
                RETURNING *
            `;
            const result = await pool.query(deleteQuery, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Order type not found'
                });
            }

            res.json({
                success: true,
                message: 'Order type deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting order type',
                error: error.message
            });
        }
    }

    static async getOrderTypeById(req, res) {
        // Implementation for getting an order type by ID
        try {
            const { id } = req.params;

            const query = 'SELECT * FROM order_type WHERE id = $1';
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Order type not found'
                });
            }

            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving order type',
                error: error.message
            });
        }
    }

    static async getAllPaymentMethods(req, res) {
        // Implementation for getting all payment methods  
        try {
            const query = 'SELECT * FROM paymentmethod WHERE is_active = true ORDER BY name';
            const result = await pool.query(query);

            res.json({
                success: true,
                data: result.rows,
                count: result.rows.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving payment methods',
                error: error.message
            });
        }
    }

    static async getPaymentMethodById(req, res) {
        // Implementation for getting a payment method by ID
        try {
            const { id } = req.params;

            const query = 'SELECT * FROM paymentmethod WHERE id = $1';
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment method not found'
                });
            }

            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving payment method',
                error: error.message
            });
        }
    }

    static async createPaymentMethod(req, res) {
        // Implementation for creating a new payment method
        console.log('Creating payment method with name:', req.body);
        try {
            const { name } = req.body;

            const insertQuery = `
                INSERT INTO paymentmethod (name, is_active, created_at, updated_at)
                VALUES ($1,true, NOW(), NOW())
                RETURNING *
            `;
            const result = await pool.query(insertQuery, [name]);

            res.status(201).json({
                success: true,
                message: 'Payment method created successfully',
                data: result.rows[0]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating payment method',
                error: error.message
            });
        }
    }

    static async updatePaymentMethod(req, res) {

        // Implementation for updating an existing payment method
        try {
            const { id } = req.params;
            const { name } = req.body;

            const updateQuery = `
                UPDATE paymentmethod
                SET name = $1,
                    updated_at = NOW()
                WHERE id = $2
                RETURNING *
            `;
            const result = await pool.query(updateQuery, [name, id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment method not found'
                });
            }

            res.json({
                success: true,
                message: 'Payment method updated successfully',
                data: result.rows[0]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating payment method',
                error: error.message
            });
        }
    }

    static async deletePaymentMethod(req, res) {
        // Implementation for deleting a payment method
        try {
            const { id } = req.params;

            const deleteQuery = `
                DELETE FROM paymentmethod
                WHERE id = $1
                RETURNING *
            `;
            const result = await pool.query(deleteQuery, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment method not found'
                });
            }

            res.json({
                success: true,
                message: 'Payment method deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting payment method',
                error: error.message
            });
        }
    }
}

module.exports = LookupController;