const User = require('../models/User');
const pool = require('../config/database');

class UserController {
    // Get all users
    static async getAllUsers(req, res) {
        try {
            const result = await pool.query(`SELECT 
                u.*,
                l.name AS location_name
            FROM users u
            LEFT JOIN location l 
                ON u.location_id = l.id
            ORDER BY u.id`);
            const users = result.rows.map(userData => User.create(userData));

            res.status(200).json({
                success: true,
                message: 'Users retrieved successfully',
                data: result.rows,
                count: users.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving users',
                error: error.message
            });
        }
    }

    // Get user by ID
    static async getUserById(req, res) {
        try {
            const { id } = req.params;

            const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const user = User.create(result.rows[0]);

            res.status(200).json({
                success: true,
                message: 'User retrieved successfully',
                data: user
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving user',
                error: error.message
            });
        }
    }

    // Create new user
    static async createUser(req, res) {
        try {
            const { username, role_id, role_name, location_id, password, employee_num } = req.body;

            // Create temporary user object for validation
            const tempUser = User.create({ username, role_id, role_name });
            const validation = tempUser.validate();

            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.errors
                });
            }

            // Check if employee_num already exists
            if (employee_num) {
                const existingEmployee = await pool.query(
                    'SELECT id FROM users WHERE employee_num = $1',
                    [employee_num]
                );

                if (existingEmployee.rows.length > 0) {
                    return res.status(409).json({
                        success: false,
                        message: `Employee number '${employee_num}' is already in use`
                    });
                }
            }

            // Insert into database
            const result = await pool.query(
                `INSERT INTO users (username, role_id, role_name, location_id, password, created_at, employee_num) VALUES ($1, $2, $3, $4, crypt($5, gen_salt(\'bf\')), NOW(), $6) 
                 RETURNING id, username, role_id, role_name, location_id, created_at, employee_num`,
                [username, role_id, role_name, location_id || null, password, employee_num]
            );

            const user = result.rows[0];

            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: user
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating user',
                error: error.message
            });
        }
    }

    // Update user
    static async updateUser(req, res) {
        try {
            const { id } = req.params;
            console.log("Updating user with body:", req.body);
            const { username, role_id, role_name, location_id } = req.body;

            // Check if user exists
            const existingUser = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

            if (existingUser.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Create temporary user object for validation
            const tempUser = User.create({ username, role_id, role_name });
            const validation = tempUser.validate();

            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.errors
                });
            }

            // Update in database
            const result = await pool.query(
                'UPDATE users SET username = $1, role_id = $2, role_name = $3, location_id = $4 WHERE id = $5 RETURNING *',
                [username, role_id, role_name, location_id || null, id]
            );

            const user = User.create(result.rows[0]);

            res.status(200).json({
                success: true,
                message: 'User updated successfully',
                data: user
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating user',
                error: error.message
            });
        }
    }

    // Delete user
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;

            // Check if user exists
            const existingUser = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

            if (existingUser.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Delete from database
            await pool.query('DELETE FROM users WHERE id = $1', [id]);

            res.status(200).json({
                success: true,
                message: 'User deleted successfully',
                data: { id: parseInt(id) }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting user',
                error: error.message
            });
        }
    }

    // Login by employee number
    static async loginByEmployeeNum(req, res) {
        try {
            const { employee_num } = req.body;

            if (!employee_num) {
                return res.status(400).json({
                    success: false,
                    message: 'Employee number is required'
                });
            }

            const result = await pool.query(
                `SELECT u.id, u.username, u.role_id, u.role_name, u.location_id, u.employee_num, u.is_active,
                        l.name AS location_name
                 FROM users u
                 LEFT JOIN location l ON u.location_id = l.id
                 WHERE u.employee_num = $1`,
                [employee_num]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid employee number'
                });
            }

            const user = result.rows[0];

            if (!user.is_active) {
                return res.status(403).json({
                    success: false,
                    message: 'Account is inactive'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: user
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Login failed',
                error: error.message
            });
        }
    }

    // Get users by role
    static async getUsersByRole(req, res) {
        try {
            const { role_id } = req.params;

            const result = await pool.query('SELECT * FROM users WHERE role_id = $1 ORDER BY id', [role_id]);
            const users = result.rows.map(userData => User.create(userData));

            res.status(200).json({
                success: true,
                message: `Users with role_id ${role_id} retrieved successfully`,
                data: users,
                count: users.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving users by role',
                error: error.message
            });
        }
    }
}

module.exports = UserController;