class PaymentMethod {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }

    static create(paymentData) {
        return new PaymentMethod(
            paymentData.id,
            paymentData.name
        );
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name
        };
    }

    validate() {
        const errors = [];
        
        if (!this.name || this.name.trim().length === 0) {
            errors.push('Name is required');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

module.exports = PaymentMethod;