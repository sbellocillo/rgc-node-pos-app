const pool = require('../config/database');

class Layout {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.item_type_id = data.item_type_id;
        this.is_default = data.is_default;
        this.is_active = data.is_active;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    // Validate layout data
    validate() {
        const errors = [];

        if (!this.name || this.name.trim() === '') {
            errors.push('Name is required');
        }

        if (!this.item_type_id) {
            errors.push('Item type ID is required');
        }

        if (this.name && this.name.length > 50) {
            errors.push('Name must be 50 characters or less');
        }

        return errors;
    }

    // Get all layouts
    static async getAll() {
        try {
            const result = await pool.query(`
                SELECT l.*, it.name as item_type_name
                FROM layouts l
                LEFT JOIN item_type it ON l.item_type_id = it.id
                ORDER BY l.is_default DESC, l.name ASC
            `);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Get layout by id
    static async getById(id) {
        try {
            // FIXED: 'item_tye' -> 'item_type'
            const result = await pool.query(`
                SELECT l.*, it.name as item_type_name
                FROM layouts l
                LEFT JOIN item_type it ON l.item_type_id = it.id 
                WHERE l.id = $1
            `, [id]);
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Get layouts by item type
    static async getByItemType(item_type_id) {
        try {
            // FIXED: 'item_tyoe_name' -> 'item_type_name'
            const result = await pool.query(`
                SELECT l.*, it.name as item_type_name 
                FROM layouts l
                LEFT JOIN item_type it ON l.item_type_id = it.id
                WHERE l.item_type_id = $1
                ORDER BY l.is_default DESC, l.name ASC
            `, [item_type_id]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Get default layouts
    static async getDefaults() {
        try {
            const result = await pool.query(`
                SELECT l.*, it.name as item_type_name
                FROM layouts l
                LEFT JOIN item_type it ON l.item_type_id = it.id
                WHERE l.is_default = true AND l.is_active = true
                ORDER BY l.name ASC
            `);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Create new layout
    static async create(data) {
        const layout = new Layout(data);
        const errors = layout.validate();

        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }

        try {
            const result = await pool.query(`
                INSERT INTO layouts (name, item_type_id, is_default, is_active)
                VALUES ($1, $2, $3, $4)
                RETURNING *
            `, [
                layout.name,
                layout.item_type_id,
                layout.is_default || false,
                layout.is_active !== undefined ? layout.is_active : true
            ]);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') {
                throw new Error('Layout name already exists');
            }
            if (error.code === '23503') {
                throw new Error('Invalid item type ID');
            }
            throw error;
        }
    }

    // Update layout
    static async update(id, data) {
        const layout = new Layout(data);
        const errors = layout.validate();

        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }

        try {
            const result = await pool.query(`
                UPDATE layouts
                SET name = $1, item_type_id = $2, is_default = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP
                WHERE id = $5
                RETURNING *
            `, [
                layout.name,
                layout.item_type_id,
                layout.is_default,
                layout.is_active,
                id
            ]);
            return result.rows[0] || null;
        } catch (error) {
            if (error.code === '23505') {
                throw new Error('Layout name already exists');
            }
            if (error.code === '23503') {
                throw new Error('Invalid item type ID');
            }
            throw error;
        }
    }
    
    static async delete(id) {
        try{
            const result = await pool.query(
                'DELETE FROM layouts WHERE id = $1 RETURNING *',
                [id]
            );
            return result.rows[0] || null;
        } catch (error) {
            throw error
        }
    }
}

module.exports = Layout;