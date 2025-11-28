const TaxConfig = require('../models/TaxConfig');
const pool = require('../config/database');

class TaxConfigController {
    // Get all tax configurations
    static async getAllTaxConfigs(req, res) {
        try {
            const result = await pool.query('SELECT * FROM tax_config ORDER BY is_default DESC, name');
            const taxConfigs = result.rows.map(taxData => TaxConfig.create(taxData));
            
            res.status(200).json({
                success: true,
                message: 'Tax configurations retrieved successfully',
                data: taxConfigs,
                count: taxConfigs.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving tax configurations',
                error: error.message
            });
        }
    }

    // Get default tax configuration
    static async getDefaultTaxConfig(req, res) {
        try {
            const result = await pool.query('SELECT * FROM tax_config WHERE is_default = TRUE LIMIT 1');
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'No default tax configuration found'
                });
            }

            const taxConfig = TaxConfig.create(result.rows[0]);
            
            res.status(200).json({
                success: true,
                message: 'Default tax configuration retrieved successfully',
                data: taxConfig
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving default tax configuration',
                error: error.message
            });
        }
    }

    // Get tax configuration by ID
    static async getTaxConfigById(req, res) {
        try {
            const { id } = req.params;
            const result = await pool.query('SELECT * FROM tax_config WHERE id = $1', [id]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Tax configuration not found'
                });
            }

            const taxConfig = TaxConfig.create(result.rows[0]);
            
            res.status(200).json({
                success: true,
                message: 'Tax configuration retrieved successfully',
                data: taxConfig
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving tax configuration',
                error: error.message
            });
        }
    }

    // Create new tax configuration
    static async createTaxConfig(req, res) {
        try {
            const { name, tax_percentage, description, is_default, location_id, effective_date } = req.body;
            
            const tempTaxConfig = TaxConfig.create({ name, tax_percentage, description, is_default, location_id, effective_date });
            const validation = tempTaxConfig.validate();

            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.errors
                });
            }

            // If setting as default, update other configs to not be default
            if (is_default) {
                await pool.query('UPDATE tax_config SET is_default = FALSE');
            }

            const result = await pool.query(
                'INSERT INTO tax_config (name, tax_percentage, description, is_default, location_id, effective_date, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *',
                [name, tax_percentage, description, is_default || false, location_id, effective_date || new Date()]
            );
            
            const taxConfig = TaxConfig.create(result.rows[0]);
            
            res.status(201).json({
                success: true,
                message: 'Tax configuration created successfully',
                data: taxConfig
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating tax configuration',
                error: error.message
            });
        }
    }

    // Update tax configuration
    static async updateTaxConfig(req, res) {
        try {
            const { id } = req.params;
            const { name, tax_percentage, description, is_default, location_id, effective_date } = req.body;

            const existingTaxConfig = await pool.query('SELECT * FROM tax_config WHERE id = $1', [id]);
            
            if (existingTaxConfig.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Tax configuration not found'
                });
            }

            const tempTaxConfig = TaxConfig.create({ name, tax_percentage, description, is_default, location_id, effective_date });
            const validation = tempTaxConfig.validate();

            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.errors
                });
            }

            // If setting as default, update other configs to not be default
            if (is_default) {
                await pool.query('UPDATE tax_config SET is_default = FALSE WHERE id != $1', [id]);
            }

            const result = await pool.query(
                'UPDATE tax_config SET name = $1, tax_percentage = $2, description = $3, is_default = $4, location_id = $5, effective_date = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
                [name, tax_percentage, description, is_default || false, location_id, effective_date, id]
            );
            
            const taxConfig = TaxConfig.create(result.rows[0]);
            
            res.status(200).json({
                success: true,
                message: 'Tax configuration updated successfully',
                data: taxConfig
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating tax configuration',
                error: error.message
            });
        }
    }

    // Delete tax configuration
    static async deleteTaxConfig(req, res) {
        try {
            const { id } = req.params;
            
            const existingTaxConfig = await pool.query('SELECT * FROM tax_config WHERE id = $1', [id]);
            
            if (existingTaxConfig.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Tax configuration not found'
                });
            }
            
            // Don't allow deletion of default tax config
            if (existingTaxConfig.rows[0].is_default) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete default tax configuration'
                });
            }
            
            await pool.query('DELETE FROM tax_config WHERE id = $1', [id]);
            
            res.status(200).json({
                success: true,
                message: 'Tax configuration deleted successfully',
                data: { id: parseInt(id) }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting tax configuration',
                error: error.message
            });
        }
    }

    // Calculate tax for given amount
    static async calculateTax(req, res) {
        try {
            const { amount, tax_config_id } = req.body;
            
            if (!amount || typeof amount !== 'number' || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid amount is required'
                });
            }

            let taxQuery;
            let taxParams;
            
            if (tax_config_id) {
                taxQuery = 'SELECT * FROM tax_config WHERE id = $1';
                taxParams = [tax_config_id];
            } else {
                taxQuery = 'SELECT * FROM tax_config WHERE is_default = TRUE LIMIT 1';
                taxParams = [];
            }

            const result = await pool.query(taxQuery, taxParams);
            
            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Tax configuration not found'
                });
            }

            const taxConfig = TaxConfig.create(result.rows[0]);
            const taxAmount = parseFloat((amount * taxConfig.tax_percentage).toFixed(2));
            const totalAmount = parseFloat((amount + taxAmount).toFixed(2));
            
            res.status(200).json({
                success: true,
                message: 'Tax calculated successfully',
                data: {
                    subtotal: amount,
                    tax_config: taxConfig.toJSON(),
                    tax_amount: taxAmount,
                    total: totalAmount
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error calculating tax',
                error: error.message
            });
        }
    }
}

module.exports = TaxConfigController;