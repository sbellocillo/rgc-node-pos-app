class OrderType {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }

    static create(orderTypeData) {
        return new OrderType(
            orderTypeData.id,
            orderTypeData.name
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

module.exports = OrderType;