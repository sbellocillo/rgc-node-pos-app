const pool = require('../config/database');

// Generic controller for simple lookup tables (status, location, paymentmethod, order_type)
class LookupController {
    // Get all records from a lookup table
    static createGetAll(tableName, modelClass) {
        return async (req, res) => {
            try {
                const result = await pool.query(`SELECT * FROM ${tableName} ORDER BY id`);
                const data = result.rows.map(rowData => modelClass.create(rowData));

                res.status(200).json({
                    success: true,
                    message: `${tableName} retrieved successfully`,
                    data: data,
                    count: data.length
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: `Error retrieving ${tableName}`,
                    error: error.message
                });
            }
        };
    }

    // Get record by ID from a lookup table
    static createGetById(tableName, modelClass) {
        return async (req, res) => {
            try {
                const { id } = req.params;
                const result = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);

                if (result.rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: `${tableName.slice(0, -1)} not found`
                    });
                }

                const data = modelClass.create(result.rows[0]);

                res.status(200).json({
                    success: true,
                    message: `${tableName.slice(0, -1)} retrieved successfully`,
                    data: data
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: `Error retrieving ${tableName.slice(0, -1)}`,
                    error: error.message
                });
            }
        };
    }

    // Create new record in a lookup table
    static createPost(tableName, modelClass) {
        return async (req, res) => {
            try {
                const { name, house_number, unit_number, street_name, barangay, city_municipality, province, region, zipcode, phone, manager_id, is_active } = req.body;

                const tempData = modelClass.create({ name, house_number, unit_number, street_name, barangay, city_municipality, province, region, zipcode, phone, manager_id, is_active });
                const validation = tempData.validate();

                if (!validation.isValid) {
                    return res.status(400).json({
                        success: false,
                        message: 'Validation failed',
                        errors: validation.errors
                    });
                }

                const result = await pool.query(
                    `INSERT INTO ${tableName} (name, house_number, unit_number, street_name, barangay, city_municipality, province, region, zipcode, phone, manager_id, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
                    [name, house_number, unit_number, street_name, barangay, city_municipality, province, region, zipcode, phone, manager_id, is_active]
                );

                const data = modelClass.create(result.rows[0]);

                res.status(201).json({
                    success: true,
                    message: `${tableName.slice(0, -1)} created successfully`,
                    data: data
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: `Error creating ${tableName.slice(0, -1)}`,
                    error: error.message
                });
            }
        };
    }

    // Update record in a lookup table
    static createPut(tableName, modelClass) {
        return async (req, res) => {
            try {
                console.log("Updating record in request", req);
                console.log("Updating record in body", req.body);
                console.log("Updating record req.params", req.params);
                const { id } = req.params;
                const { name, house_number, unit_number, street_name, barangay, city_municipality, province, region, zipcode, phone, manager_id, is_active } = req.body;


                const existingRecord = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);

                if (existingRecord.rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: `${tableName.slice(0, -1)} not found`
                    });
                }

                const tempData = modelClass.create({ name, house_number, unit_number, street_name, barangay, city_municipality, province, region, zipcode, phone, manager_id, is_active });
                const validation = tempData.validate();

                if (!validation.isValid) {
                    return res.status(400).json({
                        success: false,
                        message: 'Validation failed',
                        errors: validation.errors
                    });
                }

                const result = await pool.query(
                    `UPDATE ${tableName} SET name = $1, house_number = $2, unit_number = $3, street_name = $4, barangay = $5, city_municipality = $6, province = $7, region = $8, zipcode = $9, phone = $10, manager_id = $11, is_active = $12 WHERE id = $13 RETURNING *`,
                    [name, house_number, unit_number, street_name, barangay, city_municipality, province, region, zipcode, phone, manager_id, is_active, id]
                );

                const data = modelClass.create(result.rows[0]);

                res.status(200).json({
                    success: true,
                    message: `${tableName.slice(0, -1)} updated successfully`,
                    data: data
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: `Error updating ${tableName.slice(0, -1)}`,
                    error: error.message
                });
            }
        };
    }

    // Delete record from a lookup table
    static createDelete(tableName) {
        return async (req, res) => {
            try {
                const { id } = req.params;

                const existingRecord = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);

                if (existingRecord.rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: `${tableName.slice(0, -1)} not found`
                    });
                }

                await pool.query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);

                res.status(200).json({
                    success: true,
                    message: `${tableName.slice(0, -1)} deleted successfully`,
                    data: { id: parseInt(id) }
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: `Error deleting ${tableName.slice(0, -1)}`,
                    error: error.message
                });
            }
        };
    }
}

module.exports = LookupController;