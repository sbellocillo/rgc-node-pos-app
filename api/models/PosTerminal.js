const pool = require('../config/database');

class PosTerminal {
    constructor(data) {
        this.id = data.id;
        this.location_id = data.location_id;
        this.terminal_number = data.terminal_number;
        this.pos_serial_number = data.pos_serial_number;
        this.min_num = data.min_num;
        this.permit_num = data.permit_num;
        this.permit_date_issued = data.permit_date_issued;
        this.permit_valid_until = data.permit_valid_until;
        this.is_active = data.is_active;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    validate() {
        const errors = [];

        if(!this.location_id) {
            errors.push('location ID is required');
        }

        if (!this.terminal_number) {
            errors.push('Terminal number is required!');
        }

        if (this.pos_serial_number && this.pos_serial_number.length > 50) {
            errors.push('Serial Number must be 50 characters or less');
        }

        return errors;
    }

    // Get all terminals
    static async getAll() {
        try {
            const result = await pool.query(`
                    SELECT t.*, l.name as location_name
                    FROM pos_terminals t
                    JOIN location l ON t.location_id = l.id
                    WHERE t.is_active = true
                    ORDER BY l.name, t.terminal_number
                `);
                return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async getById(id) {
        try {
            const result = await pool.query(`
                    SELECT
                        t.*,
                        l.name AS branch_name,
                        l.tin AS branch_tin,
                        l.street_name,
                        l.barangay,
                        l.city_municipality
                    FROM pos_terminals t
                    JOIN location l ON t.location_id = l.id
                    WHERE t.id = $1
                `, [id]);
                return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Get terminals by Location
    static async getByLocation(location_id) {
        try {
            const result = await pool.query(`
                SELECT id, terminal_number, pos_serial_number
                FROM pos_terminals
                WHERE location_id = $1 AND is_active = true
                ORDER BY terminal_number ASC
                `, [location_id]);
                return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Create new terminal
    static async create(data) {
        const terminal = new PosTerminal(data);
        const errors = terminal.validate();

        if (errors.length > 0) {
            throw new Error(errors.join(', '));
        }

        try {
            const result = await pool.query(`
                INSERT INTO pos_terminals (
                location_id, terminal_number, pos_serial_number,
                min_num, permit_num, permit_date_issued, permit_valid_until, is_active
                )
                VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
                RETURNING *
                `, [
                    terminal.location_id,
                    terminal.terminal_number,
                    terminal.pos_serial_number,
                    terminal.min_num,
                    terminal.permit_num,
                    terminal.permit_date_issued,
                    terminal.permit_valid_until,
                    terminal.is_active !== undefined ? terminal.is_active : true
                ]);
                return result.rows[0];
        } catch (error) {
            if (error.code === '23505') {
                throw new Error('Terminal number already exists for this location');
            }
            throw error;
        }
    }

    // Update terminal
    static async update(id, data) {
        try {
            const result = await pool.query(`
                UPDATE pos_terminals
                SET
                    terminal_number = COALESCE($1, terminal_number),
                    pos_serial_number = COALESCE($2, pos_serial_number),
                    min_num = COALESCE($3, min_num),
                    permit_num = COALESCE($4, permit_num),
                    permit_date_issued = COALESCE($5, permit_date_issued),
                    permit_valid_until = COALESCE($6, permit_valid_until),
                    is_active = COALESCE($7, is_active),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $8
                RETURNING *
                `, [
                    data.terminal_number,
                    data.pos_serial_number,
                    data.min_num,
                    data.permit_num,
                    data.permit_date_issued,
                    data.permit_valid_until,
                    data.is_active,
                    id
                ]);
                return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }

    // Soft Delete (set is_active = false)
    static async delete(id) {
        try {
            const result = await pool.query(`
                    UPDATE pos_terminals SET is_active = false WHERE id = $1 RETURNING *
                `, [id]);
                return result.rows[0] || null;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = PosTerminal;