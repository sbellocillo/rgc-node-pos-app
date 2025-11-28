const Customer = require('../models/Customer');
const pool = require('../config/database');

class CustomerController {
    // Get all customers
    static async getAllCustomers(req, res) {
        try {
            const { page = 1, limit = 20, search, membership_level, city } = req.query;
            const offset = (page - 1) * limit;
            
            let query = `
                SELECT * FROM customers 
                WHERE is_active = true
            `;
            let countQuery = `
                SELECT COUNT(*) FROM customers 
                WHERE is_active = true
            `;
            const queryParams = [];
            let paramCount = 0;

            // Add search filter
            if (search) {
                paramCount++;
                query += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
                countQuery += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
                queryParams.push(`%${search}%`);
            }

            // Add membership level filter
            if (membership_level) {
                paramCount++;
                query += ` AND membership_level = $${paramCount}`;
                countQuery += ` AND membership_level = $${paramCount}`;
                queryParams.push(membership_level);
            }

            // Add city filter
            if (city) {
                paramCount++;
                query += ` AND city_municipality ILIKE $${paramCount}`;
                countQuery += ` AND city_municipality ILIKE $${paramCount}`;
                queryParams.push(`%${city}%`);
            }

            // Add pagination
            query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
            queryParams.push(limit, offset);

            // Execute queries
            const [result, countResult] = await Promise.all([
                pool.query(query, queryParams),
                pool.query(countQuery, queryParams.slice(0, -2)) // Remove limit and offset for count
            ]);

            const customers = result.rows.map(customerData => Customer.create(customerData).toJSON());
            const totalRecords = parseInt(countResult.rows[0].count);
            const totalPages = Math.ceil(totalRecords / limit);

            res.status(200).json({
                success: true,
                message: 'Customers retrieved successfully',
                data: customers,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: totalPages,
                    total_records: totalRecords,
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Error getting all customers:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving customers',
                error: error.message
            });
        }
    }

    // Get customer by ID
    static async getCustomerById(req, res) {
        try {
            const { id } = req.params;
            
            const result = await pool.query(
                'SELECT * FROM customers WHERE id = $1 AND is_active = true',
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Customer not found'
                });
            }

            const customer = Customer.create(result.rows[0]);
            
            res.status(200).json({
                success: true,
                message: 'Customer retrieved successfully',
                data: customer.toJSON()
            });
        } catch (error) {
            console.error('Error getting customer by ID:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving customer',
                error: error.message
            });
        }
    }

    // Create new customer
    static async createCustomer(req, res) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            // Validate input data
            const customer = Customer.create(req.body);
            const validation = customer.validate();
            
            if (!validation.isValid) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.errors
                });
            }

            // Check for duplicate email
            if (customer.email) {
                const emailCheck = await client.query(
                    'SELECT id FROM customers WHERE email = $1 AND is_active = true',
                    [customer.email]
                );
                
                if (emailCheck.rows.length > 0) {
                    await client.query('ROLLBACK');
                    return res.status(400).json({
                        success: false,
                        message: 'Email already exists'
                    });
                }
            }

            const query = `
                INSERT INTO customers (
                    first_name, last_name, email, phone, date_of_birth, gender,
                    house_number, unit_number, street_name, barangay, city_municipality, 
                    province, region, zipcode, dietary_preferences, allergies, notes,
                    membership_level, loyalty_points
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
                RETURNING *
            `;
            
            const values = [
                customer.first_name, customer.last_name, customer.email, customer.phone,
                customer.date_of_birth, customer.gender, customer.house_number, customer.unit_number,
                customer.street_name, customer.barangay, customer.city_municipality, customer.province,
                customer.region, customer.zipcode, customer.dietary_preferences, customer.allergies,
                customer.notes, customer.membership_level, customer.loyalty_points
            ];

            const result = await client.query(query, values);
            await client.query('COMMIT');

            const newCustomer = Customer.create(result.rows[0]);

            res.status(201).json({
                success: true,
                message: 'Customer created successfully',
                data: newCustomer.toJSON()
            });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error creating customer:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating customer',
                error: error.message
            });
        } finally {
            client.release();
        }
    }

    // Update customer
    static async updateCustomer(req, res) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const { id } = req.params;
            
            // Check if customer exists
            const existingCustomer = await client.query(
                'SELECT * FROM customers WHERE id = $1 AND is_active = true',
                [id]
            );
            
            if (existingCustomer.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({
                    success: false,
                    message: 'Customer not found'
                });
            }

            // Validate input data
            const updatedData = { ...existingCustomer.rows[0], ...req.body, id: parseInt(id) };
            const customer = Customer.create(updatedData);
            const validation = customer.validate();
            
            if (!validation.isValid) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.errors
                });
            }

            // Check for duplicate email (excluding current customer)
            if (customer.email) {
                const emailCheck = await client.query(
                    'SELECT id FROM customers WHERE email = $1 AND id != $2 AND is_active = true',
                    [customer.email, id]
                );
                
                if (emailCheck.rows.length > 0) {
                    await client.query('ROLLBACK');
                    return res.status(400).json({
                        success: false,
                        message: 'Email already exists'
                    });
                }
            }

            const query = `
                UPDATE customers SET 
                    first_name = $1, last_name = $2, email = $3, phone = $4, 
                    date_of_birth = $5, gender = $6, house_number = $7, unit_number = $8,
                    street_name = $9, barangay = $10, city_municipality = $11, province = $12,
                    region = $13, zipcode = $14, dietary_preferences = $15, allergies = $16,
                    notes = $17, membership_level = $18, loyalty_points = $19, 
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $20 AND is_active = true
                RETURNING *
            `;
            
            const values = [
                customer.first_name, customer.last_name, customer.email, customer.phone,
                customer.date_of_birth, customer.gender, customer.house_number, customer.unit_number,
                customer.street_name, customer.barangay, customer.city_municipality, customer.province,
                customer.region, customer.zipcode, customer.dietary_preferences, customer.allergies,
                customer.notes, customer.membership_level, customer.loyalty_points, id
            ];

            const result = await client.query(query, values);
            await client.query('COMMIT');

            const updatedCustomer = Customer.create(result.rows[0]);

            res.status(200).json({
                success: true,
                message: 'Customer updated successfully',
                data: updatedCustomer.toJSON()
            });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error updating customer:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating customer',
                error: error.message
            });
        } finally {
            client.release();
        }
    }

    // Soft delete customer
    static async deleteCustomer(req, res) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const { id } = req.params;
            
            const existingCustomer = await client.query(
                'SELECT * FROM customers WHERE id = $1 AND is_active = true',
                [id]
            );
            
            if (existingCustomer.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({
                    success: false,
                    message: 'Customer not found'
                });
            }
            
            const result = await client.query(
                'UPDATE customers SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, first_name, last_name, is_active',
                [id]
            );
            
            await client.query('COMMIT');
            
            res.status(200).json({
                success: true,
                message: 'Customer deactivated successfully',
                data: result.rows[0]
            });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error deleting customer:', error);
            res.status(500).json({
                success: false,
                message: 'Error deleting customer',
                error: error.message
            });
        } finally {
            client.release();
        }
    }

    // Get customer order history
    static async getCustomerOrderHistory(req, res) {
        try {
            const { id } = req.params;
            const { page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;
            
            // Check if customer exists
            const customerCheck = await pool.query(
                'SELECT id, first_name, last_name FROM customers WHERE id = $1 AND is_active = true',
                [id]
            );
            
            if (customerCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Customer not found'
                });
            }

            const query = `
                SELECT o.*, s.name as status_name, ot.name as order_type_name, 
                       pm.name as payment_method_name, l.name as location_name
                FROM orders o
                LEFT JOIN status s ON o.status_id = s.id
                LEFT JOIN order_type ot ON o.order_type_id = ot.id
                LEFT JOIN paymentmethod pm ON o.payment_method_id = pm.id
                LEFT JOIN location l ON o.location_id = l.id
                WHERE o.customer_id = $1 AND o.is_active = true
                ORDER BY o.created_at DESC
                LIMIT $2 OFFSET $3
            `;
            
            const countQuery = `
                SELECT COUNT(*) FROM orders 
                WHERE customer_id = $1 AND is_active = true
            `;

            const [ordersResult, countResult] = await Promise.all([
                pool.query(query, [id, limit, offset]),
                pool.query(countQuery, [id])
            ]);

            const totalRecords = parseInt(countResult.rows[0].count);
            const totalPages = Math.ceil(totalRecords / limit);

            res.status(200).json({
                success: true,
                message: 'Customer order history retrieved successfully',
                customer: customerCheck.rows[0],
                data: ordersResult.rows,
                pagination: {
                    current_page: parseInt(page),
                    total_pages: totalPages,
                    total_records: totalRecords,
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Error getting customer order history:', error);
            res.status(500).json({
                success: false,
                message: 'Error retrieving customer order history',
                error: error.message
            });
        }
    }

    // Update customer loyalty points
    static async updateLoyaltyPoints(req, res) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            const { id } = req.params;
            const { points, order_amount } = req.body;
            
            if (!points && !order_amount) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    success: false,
                    message: 'Either points or order_amount is required'
                });
            }

            const existingCustomer = await client.query(
                'SELECT * FROM customers WHERE id = $1 AND is_active = true',
                [id]
            );
            
            if (existingCustomer.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({
                    success: false,
                    message: 'Customer not found'
                });
            }

            const customer = Customer.create(existingCustomer.rows[0]);
            
            if (order_amount) {
                customer.updateOrderStats(parseFloat(order_amount));
            } else if (points) {
                customer.addLoyaltyPoints(parseInt(points));
            }

            const result = await client.query(`
                UPDATE customers SET 
                    loyalty_points = $1, 
                    membership_level = $2, 
                    total_orders = $3,
                    total_spent = $4,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $5 
                RETURNING *`,
                [customer.loyalty_points, customer.membership_level, customer.total_orders, customer.total_spent, id]
            );

            await client.query('COMMIT');

            const updatedCustomer = Customer.create(result.rows[0]);

            res.status(200).json({
                success: true,
                message: 'Customer loyalty points updated successfully',
                data: updatedCustomer.toJSON()
            });
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error updating loyalty points:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating loyalty points',
                error: error.message
            });
        } finally {
            client.release();
        }
    }
}

module.exports = CustomerController;