const pool = require('../config/database');

// Generic controller for simple lookup tables (status, location, paymentmethod, order_type)
// NOTE: Because createPost and createPut have hardcoded columns (house_number, etc.), 
// this controller is currently strictly tailored for 'locations'.
class LocationController {
    
    // --- UPDATED HELPER FUNCTION START ---
    // Generates 125 rows, but uses the CORRECT item_type_id from the layouts table
    static async generateTerminalRows(locationId) {

        // 1. Default layouts when a new locations is created
        const DEFAULT_LAYOUT_IDS = [1, 2, 3, 4, 5];

        try {
            console.log(`Starting menu generation for Location ${locationId}...`);

            // 2. "Copy" Query
            // - Generates the 25 slots for each layout (CROSS JOIN)
            // - Pulls the correct Item Id if it exists (LEFT JOIN layout_templates) 
            // - Pulls the correct Item Type (from layouts)

            const insertQuery = `
                INSERT INTO layout_pos_terminal
                (location_id, layout_id, layout_indices_id, item_id, item_type_id, is_active)
                SELECT
                    $1,
                    l.id,
                    li.id,
                    lt.item_id,
                    l.item_type_id,
                    true
                FROM layouts l
                CROSS JOIN layout_indices li
                LEFT JOIN layout_templates lt ON
                    lt.layout_id = l.id AND
                    lt.layout_indices_id = li.id
                WHERE 
                    l.id = ANY($2::int[])
                    AND li.grid_index BETWEEN 1 AND 25;
            `;

            const result = await pool.query(insertQuery, [locationId, DEFAULT_LAYOUT_IDS]);

            console.log(`Successfully generated ${result.rowCount} terminal rows for Location ${locationId}`);

        } catch (error) {
            console.error("Critical Error in generateTerminalRows:", error)
        }
    }
    // --- UPDATED HELPER FUNCTION END ---

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
                
                // Helper to format name (remove 's' if plural, otherwise keep)
                const entityName = tableName.endsWith('s') ? tableName.slice(0, -1) : tableName;

                if (result.rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: `${entityName} not found`
                    });
                }

                const data = modelClass.create(result.rows[0]);

                res.status(200).json({
                    success: true,
                    message: `${entityName} retrieved successfully`,
                    data: data
                });
            } catch (error) {
                const entityName = tableName.endsWith('s') ? tableName.slice(0, -1) : tableName;
                res.status(500).json({
                    success: false,
                    message: `Error retrieving ${entityName}`,
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

                // --- MODIFICATION: CHECK FOR 'location' OR 'locations' ---
                if (tableName === 'location' || tableName === 'locations') {
                    console.log(`Auto-generating terminal rows for Location ID: ${data.id}`);
                    try {
                        // *** FIX APPLIED HERE: Changed LookupController to LocationController ***
                        await LocationController.generateTerminalRows(data.id);
                    } catch (genError) {
                        console.error("Error generating terminal rows:", genError);
                    }
                }

                const entityName = tableName.endsWith('s') ? tableName.slice(0, -1) : tableName;

                res.status(201).json({
                    success: true,
                    message: `${entityName} created successfully`,
                    data: data
                });
            } catch (error) {
                const entityName = tableName.endsWith('s') ? tableName.slice(0, -1) : tableName;
                res.status(500).json({
                    success: false,
                    message: `Error creating ${entityName}`,
                    error: error.message
                });
            }
        };
    }

    // Update record in a lookup table
    static createPut(tableName, modelClass) {
        return async (req, res) => {
            try {
                const { id } = req.params;
                const { name, house_number, unit_number, street_name, barangay, city_municipality, province, region, zipcode, phone, manager_id, is_active } = req.body;

                const existingRecord = await pool.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
                
                const entityName = tableName.endsWith('s') ? tableName.slice(0, -1) : tableName;

                if (existingRecord.rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: `${entityName} not found`
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
                    message: `${entityName} updated successfully`,
                    data: data
                });
            } catch (error) {
                const entityName = tableName.endsWith('s') ? tableName.slice(0, -1) : tableName;
                res.status(500).json({
                    success: false,
                    message: `Error updating ${entityName}`,
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

                const entityName = tableName.endsWith('s') ? tableName.slice(0, -1) : tableName;

                if (existingRecord.rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: `${entityName} not found`
                    });
                }

                await pool.query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);

                res.status(200).json({
                    success: true,
                    message: `${entityName} deleted successfully`,
                    data: { id: parseInt(id) }
                });
            } catch (error) {
                const entityName = tableName.endsWith('s') ? tableName.slice(0, -1) : tableName;
                res.status(500).json({
                    success: false,
                    message: `Error deleting ${entityName}`,
                    error: error.message
                });
            }
        };
    }
}

module.exports = LocationController;