const pool = require('../config/database');

class LayoutPosTerminal {
    constructor(data) {
        this.id = data.id;
        this.layout_indices_id = data.layout_indices_id;
        this.location_id = data.location_id;  // FIXED: was data.layout_id
        this.layout_id = data.layout_id;
        this.item_id = data.item_id;
        this.item_type_id = data.item_type_id;
        this.is_active = data.is_active;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    // Validate data
    validate() {  // FIXED: lowercase v
        const errors = [];

        if (!this.layout_indices_id) {
            errors.push('Layout indices ID is required');
        }

        if (!this.location_id) {
            errors.push('Location ID is required');
        }

        if (!this.layout_id) {
            errors.push('Layout ID is required');  // FIXED: typo
        }

        if (!this.item_id) {
            errors.push('Item ID is required');
        }

        if (!this.item_type_id) {
            errors.push('Item type ID is required');
        }

        return errors;
    }

    // Get all positions
    static async getAll() {
        try {
            const result = await pool.query(`
                SELECT
                    lpt.*,
                    li.grid_index,
                    l.name as layout_name,
                    loc.name as location_name,
                    i.name as item_name,
                    it.name as item_type_name
                FROM layout_pos_terminal lpt
                LEFT JOIN layout_indices li ON lpt.layout_indices_id = li.id
                LEFT JOIN layouts l ON lpt.layout_id = l.id       
                LEFT JOIN location loc ON lpt.location_id = loc.id  
                LEFT JOIN items i ON lpt.item_id = i.id
                LEFT JOIN item_type it ON lpt.item_type_id = it.id
                ORDER BY lpt.location_id, lpt.layout_id, li.grid_index
            `);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Get position by ID
    static async getById(id) {
        try {
            const result = await pool.query(`
                SELECT
                    lpt.*,
                    li.grid_index,
                    l.name as layout_name,
                    loc.name as location_name,
                    i.name as item_name,
                    it.name as item_type_name
                FROM layout_pos_terminal lpt
                LEFT JOIN layout_indices li ON lpt.layout_indices_id = li.id
                LEFT JOIN layouts l ON lpt.layout_id = l.id
                LEFT JOIN location loc ON lpt.location_id = loc.id  -- FIXED
                LEFT JOIN items i ON lpt.item_id = i.id
                LEFT JOIN item_type it ON lpt.item_type_id = it.id
                WHERE lpt.id = $1
            `, [id]);
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }
    
    // Get positions by location 
    static async getByLocation(location_id) {
        try {
            const result = await pool.query(`
                SELECT
                    lpt.*,
                    li.grid_index,
                    l.name as layout_name,
                    i.name as item_name,
                    it.name as item_type_name
                FROM layout_pos_terminal lpt
                LEFT JOIN layout_indices li ON lpt.layout_indices_id = li.id
                LEFT JOIN layouts l ON lpt.layout_id = l.id
                LEFT JOIN items i ON lpt.item_id = i.id
                LEFT JOIN item_type it ON lpt.item_type_id = it.id  -- FIXED: was minus sign
                WHERE lpt.location_id = $1
                ORDER BY lpt.layout_id, li.grid_index
            `, [location_id]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Get positions by layout and location
    static async getByLayoutAndLocation(layout_id, location_id) {
        try {
            const result = await pool.query(`
                SELECT
                    lpt.*,
                    li.grid_index,
                    l.name as layout_name,
                    i.name as item_name,
                    it.name as item_type_name
                FROM layout_pos_terminal lpt
                LEFT JOIN layout_indices li ON lpt.layout_indices_id = li.id
                LEFT JOIN layouts l ON lpt.layout_id = l.id
                LEFT JOIN items i ON lpt.item_id = i.id
                LEFT JOIN item_type it ON lpt.item_type_id = it.id  -- FIXED: spacing
                WHERE lpt.layout_id = $1 AND lpt.location_id = $2
                ORDER BY li.grid_index
            `, [layout_id, location_id]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Create new position
    static async create(data) {
        const position = new LayoutPosTerminal(data);
        const errors = position.validate();  // FIXED: lowercase

        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }

        try {
            const result = await pool.query(`
                INSERT INTO layout_pos_terminal
                (layout_indices_id, location_id, layout_id, item_id, item_type_id, is_active)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `, [
                position.layout_indices_id,
                position.location_id,
                position.layout_id,
                position.item_id,
                position.item_type_id,
                position.is_active !== undefined ? position.is_active : true
            ]);
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') {
                throw new Error('Position already exists for this layout and location');
            }
            if (error.code === '23503') {
                throw new Error('Invalid foreign key reference');
            }
            throw error;
        }
    }

    // Bulk create positions for a location
    static async bulkCreateForLocation(location_id, layoutItemMappings) {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const results = [];
            for (const mapping of layoutItemMappings) {
                const result = await client.query(`
                    INSERT INTO layout_pos_terminal
                    (layout_indices_id, location_id, layout_id, item_id, item_type_id, is_active)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    RETURNING *
                `, [
                    mapping.layout_indices_id,
                    location_id,
                    mapping.layout_id,
                    mapping.item_id,
                    mapping.item_type_id,
                    true
                ]);
                results.push(result.rows[0]);
            }

            await client.query('COMMIT');
            return results;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Update position
    static async update(id, data) {
        const position = new LayoutPosTerminal(data);
        const errors = position.validate();  // FIXED: lowercase

        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }

        try {
            const result = await pool.query(`
                UPDATE layout_pos_terminal  -- FIXED: was layout_post_terminal
                SET layout_indices_id = $1, location_id = $2, layout_id = $3,
                    item_id = $4, item_type_id = $5, is_active = $6,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $7
                RETURNING *
            `, [
                position.layout_indices_id,
                position.location_id,
                position.layout_id,
                position.item_id,
                position.item_type_id,
                position.is_active,
                id
            ]);
            return result.rows[0] || null;
        } catch (error) {
            if (error.code === '23505') {
                throw new Error('Position already exists for this layout and location');
            }
            if (error.code === '23503') {
                throw new Error('Invalid foreign key reference');
            }
            throw error;
        }
    }

    // Delete position
    static async delete(id) {
        try {
            const result = await pool.query(
                'DELETE FROM layout_pos_terminal WHERE id = $1 RETURNING *',
                [id]
            );
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Delete all positions for a location
    static async deleteByLocation(location_id) {
        try {
            const result = await pool.query(
                'DELETE FROM layout_pos_terminal WHERE location_id = $1 RETURNING *',
                [location_id]
            );
            return result.rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = LayoutPosTerminal;