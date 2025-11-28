const Roles = require('../models/Roles');
const pool = require('../config/database');

class RolesController {
    // Get all roles
    static async getAllRoles(req, res) {
        try {
            const result = await pool.query('SELECT * FROM roles ORDER BY id');
            const roles = result.rows.map(roleData => Roles.create(roleData));
            
            res.status(200).json({
                success: true,
                message: 'Roles retrieved successfully',
                data: roles,
                count: roles.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving roles',
                error: error.message
            });
        }
    }

    // Get role by ID
    static async getRoleById(req, res) {
        try {
            const { id } = req.params;
            const result = await pool.query('SELECT * FROM roles WHERE id = $1', [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Role not found'
                });
            }

            const role = Roles.create(result.rows[0]);
            
            res.status(200).json({
                success: true,
                message: 'Role retrieved successfully',
                data: role
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving role',
                error: error.message
            });
        }
    }

    // Create new role
    static async createRole(req, res) {
        try {
            const { name } = req.body;
            
            const tempRole = Roles.create({ name });
            const validation = tempRole.validate();

            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.errors
                });
            }

            const result = await pool.query(
                'INSERT INTO roles (name) VALUES ($1) RETURNING *',
                [name]
            );
            
            const role = Roles.create(result.rows[0]);
            
            res.status(201).json({
                success: true,
                message: 'Role created successfully',
                data: role
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating role',
                error: error.message
            });
        }
    }

    // Update role
    static async updateRole(req, res) {
        try {
            const { id } = req.params;
            const { name } = req.body;

            const existingRole = await pool.query('SELECT * FROM roles WHERE id = $1', [id]);
            
            if (existingRole.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Role not found'
                });
            }

            const tempRole = Roles.create({ name });
            const validation = tempRole.validate();

            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.errors
                });
            }

            const result = await pool.query(
                'UPDATE roles SET name = $1 WHERE id = $2 RETURNING *',
                [name, id]
            );
            
            const role = Roles.create(result.rows[0]);
            
            res.status(200).json({
                success: true,
                message: 'Role updated successfully',
                data: role
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating role',
                error: error.message
            });
        }
    }

    // Delete role
    static async deleteRole(req, res) {
        try {
            const { id } = req.params;
            console.log("deleting role with ID:", id);
            
            const existingRole = await pool.query('SELECT * FROM roles WHERE id = $1', [id]);
            console.log("Existing role check result:", existingRole.rows);
            if (existingRole.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Role not found'
                });
            }
            
            await pool.query('DELETE FROM roles WHERE id = $1', [id]);
            
            res.status(200).json({
                success: true,
                message: 'Role deleted successfully',
                data: { id: parseInt(id) }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting role',
                error: error.message
            });
        }
    }
}

module.exports = RolesController;