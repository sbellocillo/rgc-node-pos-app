const Items = require('../models/Items');
const pool = require('../config/database');

class ItemsController {
    // Get all items with item type information
    static async getAllItems(req, res) {
        try {
            const query = `
              SELECT i.*, ic.name as category_name
                FROM items i 
                LEFT JOIN item_category ic ON i.category_id = ic.id
            
                WHERE i.is_active = true
                ORDER BY i.id

            `;
            const result = await pool.query(query);

            res.status(200).json({
                success: true,
                message: 'Items retrieved successfully',
                data: result.rows,
                count: result.rows.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving items',
                error: error.message
            });
        }
    }

    // Get item by ID with item type information
    static async getItemById(req, res) {
        try {
            const { id } = req.params;
            const query = `
                SELECT i.*, it.name as item_type_name 
                FROM items i 
                LEFT JOIN item_type it ON i.item_type_id = it.item_type_id 
                WHERE i.item_id = $1 AND i.is_active = true
            `;
            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Item not found'
                });
            }

            res.status(200).json({
                success: true,
                message: 'Item retrieved successfully',
                data: result.rows[0]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving item',
                error: error.message
            });
        }
    }

    // Create new item with item type
    static async createItem(req, res) {
        try {
            const { name, description, image, price, sku, category_id } = req.body;

            // Validate that category_id exists if provided
            if (category_id) {
                //console.log("Type category_id:", category_id);
                const typeCheck = await pool.query('SELECT id FROM item_category WHERE id = $1 AND is_active = true', [category_id]);
                //console.log("Type Check:", typeCheck.rows);
                if (typeCheck.rows.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid item category ID'
                    });
                }
            }

            const tempItem = Items.create({ name, description, price, sku });
            const validation = tempItem.validate();
            console.log("Validation result:", validation);
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.errors
                });
            }

            const query = `
                INSERT INTO items (name, description, image, price, sku, category_id, is_active) 
                VALUES ($1, $2, $3, $4, $5, $6, true) 
                RETURNING id, name, description, image, price, sku, category_id, is_active, created_at, updated_at
            `;
            const result = await pool.query(query, [name, description, image, parseFloat(price), sku, category_id || null]);

            res.status(201).json({
                success: true,
                message: 'Item created successfully',
                data: result.rows[0]
            });
        } catch (error) {
            console.log("Error creating item:", error);
            res.status(500).json({
                success: false,
                message: 'Error creating item',
                error: error.message
            });
        }
    }

    // Update item with item type
    static async updateItem(req, res) {
        try {
            const { id } = req.params;
            const { name, description, image, price, sku, category_id } = req.body;
            console.log("Updating item with ID:", id);
            console.log("Update data:", req.body);
            const existingItem = await pool.query('SELECT * FROM items WHERE id = $1 AND is_active = true', [id]);

            if (existingItem.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Item not found'
                });
            }

            // Validate that item_type_id exists if provided
            if (category_id) {
                const typeCheck = await pool.query('SELECT id FROM item_category WHERE id = $1 AND is_active = true', [category_id]);
                if (typeCheck.rows.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid item type ID'
                    });
                }
            }

            const tempItem = Items.create({ name, description, price, sku });
            const validation = tempItem.validate();

            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.errors
                });
            }

            const query = `
                UPDATE items 
                SET name = $1, description = $2, image = $3, price = $4, sku = $5, category_id = $6, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $7 
                RETURNING id, name, description, image, price, sku, category_id, is_active, created_at, updated_at
            `;
            console.log("158", [name, description, image, parseFloat(price), sku, category_id || null, id])
            const result = await pool.query(query, [name, description, image, parseFloat(price), sku, category_id || null, id]);
            res.status(200).json({
                success: true,
                message: 'Item updated successfully',
                data: result.rows[0]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating item',
                error: error.message
            });
        }
    }

    // Soft delete item (set is_active = false)
    static async deleteItem(req, res) {
        try {
            const { id } = req.params;

            const existingItem = await pool.query('SELECT * FROM items WHERE id = $1 AND is_active = true', [id]);

            if (existingItem.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Item not found'
                });
            }

            // Soft delete by setting is_active = false
            const result = await pool.query(
                'UPDATE items SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, name, is_active',
                [id]
            );

            res.status(200).json({
                success: true,
                message: 'Item deactivated successfully',
                data: result.rows[0]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting item',
                error: error.message
            });
        }
    }

    // Get items by type
    static async getItemsByType(req, res) {
        try {
            const { typeId } = req.params;

            const query = `
                SELECT i.*, it.name as item_type_name 
                FROM items i 
                LEFT JOIN item_type it ON i.item_type_id = it.item_type_id 
                WHERE i.item_type_id = $1 AND i.is_active = true
                ORDER BY i.name
            `;
            const result = await pool.query(query, [typeId]);

            res.status(200).json({
                success: true,
                message: 'Items retrieved successfully',
                data: result.rows,
                count: result.rows.length
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error retrieving items by type',
                error: error.message
            });
        }
    }
}

module.exports = ItemsController;