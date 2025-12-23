const pool = require('../config/database');

class LayoutIndices {
    constructor(data){
        this.id = data.id;
        this.grid_index = data.grid_index;
        this.is_active = data.is_active;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }
    
    // Get all layout indices
    static async getAll() {
        try {
            const result = await pool.query(
                'SELECT * FROM layout_indices ORDER BY grid_index ASC'
            );
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Get layout index by ID
    static async getById(id) {
        try {
            const result = await pool.query(
                'SELECT * FROM layout_indices WHERE id = $1',
                [id]
            );
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Get layout index by grid_index (position 1-25)
    static async getByGridIndex(grid_index) {
        try {
            const result = await pool.query(
                'SELECT * FROM layout_indices WHERE grid_index = $1',
                [grid_index]
            );
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Get all active layout indices
    static async getActive() {
        try {
            const result = await pool.query(
                'SELECT * FROM layout_indices WHERE is_active = true ORDER BY grid_index ASC'
            );
            return result.rows;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = LayoutIndices;