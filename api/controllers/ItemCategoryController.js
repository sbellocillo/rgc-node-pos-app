const pool = require('../config/database');
const ItemCategory = require('../models/ItemCategory');

class ItemCategoryController {
    // Get all categories with optional filtering
    static async getAllCategories(req, res) {
        try {
            const {
                active_only = 'true',
                parent_id = null,
                include_hierarchy = 'false',
                page = 1,
                limit = 50,
                search = ''
            } = req.query;

            let query = `
                SELECT ic.*, u.username as created_by_name
                FROM item_category ic
                LEFT JOIN users u ON ic.created_by = u.id
                WHERE 1=1
            `;
            const params = [];
            let paramCount = 0;

            // Filter by active status
            if (active_only === 'true') {
                query += ` AND ic.is_active = $${++paramCount}`;
                params.push(true);
            }

            // Filter by parent category
            if (parent_id) {
                query += ` AND ic.parent_category_id = $${++paramCount}`;
                params.push(parent_id);
            } else if (parent_id === 'null') {
                query += ` AND ic.parent_category_id IS NULL`;
            }

            // Search filter
            if (search.trim()) {
                query += ` AND (ic.name ILIKE $${++paramCount} OR ic.description ILIKE $${++paramCount})`;
                const searchPattern = `%${search.trim()}%`;
                params.push(searchPattern, searchPattern);
            }

            // Order by display_order and name
            query += ` ORDER BY ic.display_order ASC, ic.name ASC`;

            // Pagination
            const offset = (parseInt(page) - 1) * parseInt(limit);
            query += ` LIMIT $${++paramCount} OFFSET $${++paramCount}`;
            params.push(parseInt(limit), offset);

            const result = await pool.query(query, params);

            // Get total count for pagination
            let countQuery = `
                SELECT COUNT(*) 
                FROM item_category ic 
                WHERE 1=1
            `;
            let countParams = [];
            let countParamCount = 0;

            if (active_only === 'true') {
                countQuery += ` AND ic.is_active = $${++countParamCount}`;
                countParams.push(true);
            }

            if (parent_id) {
                countQuery += ` AND ic.parent_category_id = $${++countParamCount}`;
                countParams.push(parent_id);
            } else if (parent_id === 'null') {
                countQuery += ` AND ic.parent_category_id IS NULL`;
            }

            if (search.trim()) {
                countQuery += ` AND (ic.name ILIKE $${++countParamCount} OR ic.description ILIKE $${++countParamCount})`;
                const searchPattern = `%${search.trim()}%`;
                countParams.push(searchPattern, searchPattern);
            }

            const countResult = await pool.query(countQuery, countParams);
            const totalCount = parseInt(countResult.rows[0].count);

            const categories = result.rows.map(row => new ItemCategory(row));

            res.json({
                success: true,
                data: categories.map(category => category.toJSON()),
                pagination: {
                    current_page: parseInt(page),
                    per_page: parseInt(limit),
                    total_items: totalCount,
                    total_pages: Math.ceil(totalCount / parseInt(limit))
                }
            });

        } catch (error) {
            console.error('Error fetching categories:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get category by ID
    static async getCategoryById(req, res) {
        try {
            const { id } = req.params;

            const query = `
                SELECT ic.*, u.username as created_by_name
                FROM item_category ic
                LEFT JOIN users u ON ic.created_by = u.id
                WHERE ic.id = $1
            `;

            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            const category = new ItemCategory(result.rows[0]);

            res.json({
                success: true,
                data: category.toJSON()
            });

        } catch (error) {
            console.error('Error fetching category:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Create new category
    static async createCategory(req, res) {
        try {
            const categoryData = req.body;
            const category = new ItemCategory(categoryData);
            console.log("Creating category:", category);

            // Validate category data
            const validation = category.validate();
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.errors
                });
            }

            const query = `
                INSERT INTO item_category (
                    name, description
                ) VALUES ($1, $2)
                RETURNING *
            `;

            const values = [
                category.name.trim(),
                category.description
            ];

            const result = await pool.query(query, values);
            const newCategory = new ItemCategory(result.rows[0]);

            res.status(201).json({
                success: true,
                message: 'Category created successfully',
                data: newCategory.toJSON()
            });

        } catch (error) {
            console.error('Error creating category:', error);

            if (error.code === '23505') { // Unique violation
                return res.status(409).json({
                    success: false,
                    message: 'Category name already exists'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Update category
    static async updateCategory(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Check if category exists
            const existingResult = await pool.query('SELECT * FROM item_category WHERE id = $1', [id]);
            if (existingResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            // Merge existing data with updates
            const existingCategory = new ItemCategory(existingResult.rows[0]);
            const updatedCategory = new ItemCategory({ ...existingCategory, ...updateData, id: parseInt(id) });

            // Validate updated data
            const validation = updatedCategory.validate();
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: validation.errors
                });
            }

            const query = `
                UPDATE item_category SET 
                    name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
                WHERE id = $3
                RETURNING *
            `;

            const values = [
                updatedCategory.name.trim(),
                updatedCategory.description,
                id
            ];

            const result = await pool.query(query, values);
            const category = new ItemCategory(result.rows[0]);

            res.json({
                success: true,
                message: 'Category updated successfully',
                data: category.toJSON()
            });

        } catch (error) {
            console.error('Error updating category:', error);

            if (error.code === '23505') { // Unique violation
                return res.status(409).json({
                    success: false,
                    message: 'Category name already exists'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Delete category (soft delete)
    static async deleteCategory(req, res) {
        try {
            const { id } = req.params;

            // Check if category exists
            const existingResult = await pool.query('SELECT * FROM item_category WHERE id = $1', [id]);
            if (existingResult.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Category not found'
                });
            }

            // Check for subcategories
            const subcategoriesResult = await pool.query(
                'SELECT COUNT(*) FROM item_category WHERE parent_category_id = $1 AND is_active = true',
                [id]
            );

            if (parseInt(subcategoriesResult.rows[0].count) > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete category that has active subcategories'
                });
            }

            // Check for items using this category
            const itemsResult = await pool.query(
                'SELECT COUNT(*) FROM items WHERE category_id = $1 AND is_active = true',
                [id]
            );

            if (parseInt(itemsResult.rows[0].count) > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete category that has active items'
                });
            }

            // Soft delete
            await pool.query(
                'UPDATE item_category SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
                [id]
            );

            res.json({
                success: true,
                message: 'Category deleted successfully'
            });

        } catch (error) {
            console.error('Error deleting category:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }

    // Get category hierarchy (tree structure)
    static async getCategoryHierarchy(req, res) {
        try {
            const query = `
                SELECT * FROM item_category 
                WHERE is_active = true 
                ORDER BY display_order ASC, name ASC
            `;

            const result = await pool.query(query);
            const categories = result.rows.map(row => new ItemCategory(row));

            // Build hierarchy tree
            const categoryMap = new Map();
            const rootCategories = [];

            // Create map for quick lookup
            categories.forEach(category => {
                categoryMap.set(category.id, { ...category.toJSON(), children: [] });
            });

            // Build tree structure
            categories.forEach(category => {
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

            res.json({
                success: true,
                data: rootCategories
            });

        } catch (error) {
            console.error('Error fetching category hierarchy:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}

module.exports = ItemCategoryController;