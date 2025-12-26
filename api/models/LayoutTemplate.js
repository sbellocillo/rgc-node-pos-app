const pool = require('../config/database');

class LayoutTemplate {
    constructor(data) {
        this.id = data.id;
        this.layout_id = data.layout_id;
        this.layout_indices_id = data.layout_indices_id;
        this.item_id = data.item_id;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at; 
    }

    // Validate layout template data
    validate() {
        const errors = [];

        if (!this.layout_id) {
            errors.push('Layout ID is required');
        }
        if (!this.layout_indices_id) {
            errors.push('Layout indices ID is required');
        }

        return errors;
    }

    // Get all templates
    static async getAll(layout_id = null) {
        try {
            let query = `
                SELECT lt.*, i.name as item_name, l.name as layout_name
                FROM layout_templates lt
                LEFT JOIN items i ON lt.item_id = i.id
                LEFT JOIN layouts l ON lt.layout_id = l.id
            `;
            const params = [];

            if (layout_id) {
                query += ` WHERE lt.layout_id = $1`;
                params.push(layout_id);
            }

            query += ` ORDER BY lt.layout_indices_id ASC`;

            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Get template by ID
    static async getById(id) {
        try {
            const result = await pool.query(`
                    SELECT lt.*, i.name as item_name, l.name as layout_name
                    FROM layout_templates lt
                    LEFT JOIN items i ON lt.item_id = i.id
                    LEFT JOIN layouts l ON lt.layout_id = l.id
                    WHERE lt.id = $1
                `, [id]);
                return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Bulk Upsert (Create or Update multiple items)
    static async bulkUpsert(items) {
        if (!items || items.length === 0) return [];

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const results = [];

            for (const itemData of items) {
                // Validate individual item logic
                if (!itemData.layout_id || !itemData.layout_indices_id) continue;

                // --- Do not allow differing item_type_id on layout and item ---
                
                // 1. Fetch the LAYOUT's item_type_id
                const layoutResult = await client.query(
                    'SELECT item_type_id FROM layouts WHERE id = $1', 
                    [itemData.layout_id]
                );
                const layoutRow = layoutResult.rows[0];

                // 2. Fetch the ITEM's item_type_id (Only if an item is being assigned)
                let itemRow = null;
                if (itemData.item_id) {
                    const itemResult = await client.query(
                        'SELECT item_type_id FROM items WHERE id = $1', 
                        [itemData.item_id]
                    );
                    itemRow = itemResult.rows[0];
                }

                // 3. Perform the check using the variables we just fetched
                if (layoutRow && itemRow) {
                    if (layoutRow.item_type_id !== itemRow.item_type_id) {
                        throw new Error(`Mismatch: Item type (${itemRow.item_type_id}) does not match Layout type (${layoutRow.item_type_id})`);
                    }
                }

                // --- End check ---

                const query = `
                    INSERT INTO layout_templates (layout_id, layout_indices_id, item_id)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (layout_id, layout_indices_id) 
                    DO UPDATE SET 
                        item_id = EXCLUDED.item_id,
                        updated_at = CURRENT_TIMESTAMP
                    RETURNING *
                `;
                const values = [itemData.layout_id, itemData.layout_indices_id, itemData.item_id];
                const res = await client.query(query, values);
                results.push(res.rows[0]);
            }

            await client.query('COMMIT')
            return results;
        } catch (error) {
            await client.query('ROLLBACK');
            if (error.code === '23503') {
                throw new Error('Invalid layout ID, indices ID, or item ID');
            }
            throw error;
        } finally {
            client.release();
        }
    }

    // Create singe template entry
    static async create(data){
        const template = new LayoutTemplate(data);
        const errors = template.validate();

        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }

        try {
            const result = await pool.query(`
                    INSERT INTO layout_templates (layout_id, layout_indices_id, item_id)
                    VALUES ($1, $2, $3)
                    RETURNING *
                `, [
                    template.layout_id,
                    template.layout_indices_id,
                    template.item_id
                ]);
                return result.rows[0];
        } catch (error) {
            if (error.code === '23505') {
                throw new Error('Template slot already occupied');
            }
            if (error.code === '23503') {
                throw new Error('Invalid related ID');
            }
            throw error;
        }
    }

    // Delete template entry
    static async delete(id) {
        try {
            const result = await pool.query(
                'DELETE FROM layout_templates WHERE id = $1 RETURNING *',
                [id]
            );
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Delete full template 
    static async deleteByLayoutId(layoutId){
        try {
            const result = await pool.query(
                'DELETE FROM layout_templates WHERE layout_id = $1 RETURNING *',
                [layoutId]
            );
            return result.rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = LayoutTemplate;