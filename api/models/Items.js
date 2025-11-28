class Items {
    constructor(id, name, description, image, price, sku, item_type_id, category_id, is_active, created_at, updated_at) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.image = image;
        this.price = typeof price === 'string' ? parseFloat(price) : price;
        this.sku = sku;
        this.item_type_id = item_type_id;
        this.category_id = category_id;
        this.is_active = is_active;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }



    static create(itemData) {
        return new Items(
            itemData.id,
            itemData.name,
            itemData.description,
            itemData.image,
            itemData.price,
            itemData.sku,
            itemData.item_type_id,
            itemData.category_id,
            itemData.is_active,
            itemData.created_at || new Date(),
            itemData.updated_at || new Date()
        );
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            image: this.image,
            price: this.price,
            sku: this.sku,
            item_type_id: this.item_type_id,
            category_id: this.category_id,
            is_active: this.is_active,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }

    validate() {
        const errors = [];

        if (!this.name || this.name.trim().length === 0) {
            errors.push('Name is required');
        }

        // Convert price to number if it's a string
        const numericPrice = typeof this.price === 'string' ? parseFloat(this.price) : this.price;

        if (!this.price || isNaN(numericPrice) || numericPrice <= 0) {
            errors.push('Valid price is required');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

module.exports = Items;