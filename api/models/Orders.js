class Orders {
    constructor(id, customer_id, order_date, shipping_address, billing_address, status_id, quantity, order_type_id, subtotal, tax_percentage, tax_amount, total, role_id, location_id, payment_method_id, card_network_id, created_at, created_by) {
        this.id = id;
        this.customer_id = customer_id;
        this.order_date = order_date;
        this.shipping_address = shipping_address;
        this.billing_address = billing_address;
        this.status_id = status_id;
        this.quantity = quantity;
        this.order_type_id = order_type_id;
        this.subtotal = subtotal;
        this.tax_percentage = tax_percentage;
        this.tax_amount = tax_amount;
        this.total = total;
        this.role_id = role_id;
        this.location_id = location_id;
        this.payment_method_id = payment_method_id;
        this.card_network_id = card_network_id;
        this.created_at = created_at;
        this.created_by = created_by;
    }

    static create(orderData) {
        return new Orders(
            orderData.id,
            orderData.customer_id,
            orderData.order_date || new Date(),
            orderData.shipping_address,
            orderData.billing_address,
            orderData.status_id,
            orderData.quantity,
            orderData.order_type_id,
            orderData.subtotal,
            orderData.tax_percentage || 0.0875,
            orderData.tax_amount || 0,
            orderData.total,
            orderData.role_id,
            orderData.location_id,
            orderData.payment_method_id,
            orderData.card_network_id,
            orderData.created_at || new Date(),
            orderData.created_by
        );
    }

    // Calculate tax amount based on subtotal and tax percentage
    calculateTax() {
        if (this.subtotal && this.tax_percentage) {
            this.tax_amount = parseFloat((this.subtotal * this.tax_percentage).toFixed(2));
            this.total = parseFloat((this.subtotal + this.tax_amount).toFixed(2));
        }
        return this.tax_amount;
    }

    toJSON() {
        return {
            id: this.id,
            customer_id: this.customer_id,
            order_date: this.order_date,
            shipping_address: this.shipping_address,
            billing_address: this.billing_address,
            status_id: this.status_id,
            quantity: this.quantity,
            rate: this.rate,
            amount: this.amount,
            order_type_id: this.order_type_id,
            subtotal: this.subtotal,
            tax_percentage: this.tax_percentage,
            tax_amount: this.tax_amount,
            total: this.total,
            role_id: this.role_id,
            location_id: this.location_id,
            payment_method_id: this.payment_method_id,
            card_network_id: this.card_network_id,
            created_at: this.created_at,
            created_by: this.created_by
        };
    }

    validate() {
        const errors = [];
        
        if (!this.subtotal || typeof this.subtotal !== 'number' || this.subtotal <= 0) {
            errors.push('Valid subtotal is required');
        }
        
        if (!this.status_id || typeof this.status_id !== 'number') {
            errors.push('Status ID is required');
        }
        
        if (this.tax_percentage && (typeof this.tax_percentage !== 'number' || this.tax_percentage < 0 || this.tax_percentage > 1)) {
            errors.push('Tax percentage must be between 0 and 1');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

module.exports = Orders;