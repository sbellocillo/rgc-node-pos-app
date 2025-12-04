const pool = require('../config/database');

class CardNetwork {
    constructor(data) {
        this.id = data.id;
        this.code = data.code;
        this.name = data.name;
        this.description = data.description;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    // Validate card network data
    validate() {
        const errors = [];

        if (!this.code || this.code.trim() === '') {
            errors.push('Code is required');
        }

        if (!this.name || this.name.trim() === '') {
            errors.push('Name is required');
        }

        if (this.code && this.code.length > 20) {
            errors.push('Code must be 20 characters or less');
        }

        if (this.name && this.name.length > 50) {
            errors.push('Name must be 50 characters or less');
        }

        return errors;
    }

    // Get all card networks
    static async getAll() {
        try {
            const result = await pool.query(
                'SELECT * FROM card_networks ORDER BY name ASC'
            );
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Get card network by ID
    static async getById(id) {
        try {
            const result = await pool.query(
                'SELECT * FROM card_networks WHERE id = $1',
                [id]
            );
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Get card network by code
    static async getByCode(code) {
        try {
            const result = await pool.query(
                'SELECT * FROM card_networks WHERE code = $1',
                [code]
            );
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Create new card network
    static async create(data) {
        const cardNetwork = new CardNetwork(data);
        const errors = cardNetwork.validate();
        
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }

        try {
            const result = await pool.query(
                `INSERT INTO card_networks (code, name, description) 
                 VALUES ($1, $2, $3) 
                 RETURNING *`,
                [cardNetwork.code, cardNetwork.name, cardNetwork.description]
            );
            return result.rows[0];
        } catch (error) {
            if (error.code === '23505') { // Unique violation
                throw new Error('Card network code already exists');
            }
            throw error;
        }
    }

    // Update card network
    static async update(id, data) {
        const cardNetwork = new CardNetwork(data);
        const errors = cardNetwork.validate();
        
        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }

        try {
            const result = await pool.query(
                `UPDATE card_networks 
                 SET code = $1, name = $2, description = $3, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $4 
                 RETURNING *`,
                [cardNetwork.code, cardNetwork.name, cardNetwork.description, id]
            );
            return result.rows[0] || null;
        } catch (error) {
            if (error.code === '23505') { // Unique violation
                throw new Error('Card network code already exists');
            }
            throw error;
        }
    }

    // Delete card network
    static async delete(id) {
        try {
            const result = await pool.query(
                'DELETE FROM card_networks WHERE id = $1 RETURNING *',
                [id]
            );
            return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = CardNetwork;
