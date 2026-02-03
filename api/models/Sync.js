const pool = require('../config/database');

class Sync {
    constructor(data) {
        // Essential Identifiers
        this.offline_uuid = data.offline_uuid;
        
        // Financials
        this.total = data.total;
        this.subtotal = data.subtotal;
        this.tax_amount = data.tax_amount;
        this.discount_amount = data.discount_amount; // kept in object, just not inserted
        this.tax_percentage = data.tax_percentage;
        
        // Context
        this.location_id = data.location_id;
        this.created_at = data.created_at || new Date(); 
        this.memo = data.memo || null;
        
        // References / Foreign Keys
        this.user_id = data.user_id;
        this.created_by = data.created_by;
        this.customer_id = data.customer_id;
        this.status_id = data.status_id;
        this.order_type_id = data.order_type_id;
        this.payment_method_id = data.payment_method_id;
        this.pos_terminal_number = data.pos_terminal_number;

        // Map items to clean structure
        this.items = (data.items || []).map(item => {
            const price = item.rate || item.price || 0;
            const quantity = item.quantity || 0;
            
            return {
                itemId: item.item_id,      
                quantity: quantity,
                price: price,          
                amount: item.amount,
                tax_amount: item.tax_amount,
                // Fix for previous error: Calculate subtotal for the item line
                subtotal: (price * quantity) 
            };
        });
    }

    validate() {
        const errors = [];
        if (!this.offline_uuid) errors.push('Offline UUID is required');
        if (!this.items || this.items.length === 0) errors.push('Order must contain items');
        if (this.total === undefined || this.total === null) errors.push('Total amount is required');
        if (!this.location_id) errors.push('Location ID is required');
        return errors;
    }

    static async processOrder(data) {
        const syncOrder = new Sync(data);
        const errors = syncOrder.validate();

        if (errors.length > 0) throw new Error(errors.join(', '));

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // 1. Idempotency Check
            const existingCheck = await client.query(
                'SELECT id, order_number FROM orders WHERE offline_uuid = $1',
                [syncOrder.offline_uuid]
            );

            if (existingCheck.rows.length > 0) {
                await client.query('ROLLBACK');
                return {
                    status: 'already_synced',
                    server_id: existingCheck.rows[0].id,
                    order_number: existingCheck.rows[0].order_number
                };
            }

            // 2. Generate Integer Order Number (e.g. 1000001)
            const countResult = await client.query('SELECT count(*) as count FROM orders');
            const nextSeq = parseInt(countResult.rows[0].count) + 1;
            const generatedOrderNumber = 1000000 + nextSeq; 

            // 3. Insert Order
            // REMOVED: discount_amount from columns and values
            const insertOrderQuery = `
                INSERT INTO orders (
                    offline_uuid, order_number, total, created_at, location_id,
                    user_id, customer_id, status_id, order_type_id,
                    tax_percentage, tax_amount, subtotal,
                    payment_method_id, pos_terminal_number, memo, created_by
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                RETURNING id
            `;

            const orderResult = await client.query(insertOrderQuery, [
                syncOrder.offline_uuid,
                generatedOrderNumber,
                syncOrder.total,
                syncOrder.created_at,
                syncOrder.location_id,
                syncOrder.user_id,
                syncOrder.customer_id,
                syncOrder.status_id,
                syncOrder.order_type_id,
                syncOrder.tax_percentage,
                syncOrder.tax_amount,
                syncOrder.subtotal,
                // syncOrder.discount_amount,  <-- REMOVED
                syncOrder.payment_method_id,
                syncOrder.pos_terminal_number,
                syncOrder.memo,
                syncOrder.created_by
            ]);

            const newOfficialId = orderResult.rows[0].id;

            // 4. Insert Items (Includes the subtotal fix)
            const insertItemQuery = `
                INSERT INTO order_items (
                    order_id, item_id, quantity, rate, amount, tax_amount, subtotal
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `;

            for (const item of syncOrder.items) {
                await client.query(insertItemQuery, [
                    newOfficialId,
                    item.itemId,    
                    item.quantity,
                    item.price,     
                    item.amount,
                    item.tax_amount,
                    item.subtotal 
                ]);
            }

            await client.query('COMMIT');

            return {
                status: 'success',
                server_id: newOfficialId,
                order_number: generatedOrderNumber
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = Sync;