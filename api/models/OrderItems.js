class OrderItems {
    constructor(id, order_id, item_id, quantity, rate, subtotal, tax_percentage, tax_amount, amount) {
        this.id = id;
        this.order_id = order_id;
        this.item_id = item_id;
        this.quantity = quantity;
        this.rate = rate;
        this.subtotal = subtotal;
        this.tax_percentage = tax_percentage;
        this.tax_amount = tax_amount;
        this.amount = amount;
    }

    static create(orderItemData) {
        return new OrderItems(
            orderItemData.id,
            orderItemData.order_id,
            orderItemData.item_id,
            orderItemData.quantity,
            orderItemData.rate,
            orderItemData.subtotal,
            orderItemData.tax_percentage || 0.0875,
            orderItemData.tax_amount || 0,
            orderItemData.amount
        );
    }

    // Calculate subtotal, tax, and total amounts
    calculateAmounts() {
        if (this.quantity && this.rate) {
            this.subtotal = parseFloat((this.quantity * this.rate).toFixed(2));
            this.tax_amount = parseFloat((this.subtotal * (this.tax_percentage || 0)).toFixed(2));
            this.amount = parseFloat((this.subtotal + this.tax_amount).toFixed(2));
        }
        return {
            subtotal: this.subtotal,
            tax_amount: this.tax_amount,
            amount: this.amount
        };
    }

    toJSON() {
        return {
            id: this.id,
            order_id: this.order_id,
            item_id: this.item_id,
            quantity: this.quantity,
            rate: this.rate,
            subtotal: this.subtotal,
            tax_percentage: this.tax_percentage,
            tax_amount: this.tax_amount,
            amount: this.amount
        };
    }

    validate() {
        const errors = [];
        
        if (!this.order_id || typeof this.order_id !== 'number') {
            errors.push('Order ID is required');
        }
        
        if (!this.item_id || typeof this.item_id !== 'number') {
            errors.push('Item ID is required');
        }
        
        if (!this.quantity || typeof this.quantity !== 'number' || this.quantity <= 0) {
            errors.push('Valid quantity is required');
        }
        
        if (!this.rate || typeof this.rate !== 'number' || this.rate <= 0) {
            errors.push('Valid rate is required');
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

module.exports = OrderItems;