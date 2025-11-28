class TaxConfig {
    constructor(id, name, tax_percentage, description, is_default, location_id, effective_date, created_at, updated_at) {
        this.id = id;
        this.name = name;
        this.tax_percentage = tax_percentage;
        this.description = description;
        this.is_default = is_default;
        this.location_id = location_id;
        this.effective_date = effective_date;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    static create(taxData) {
        return new TaxConfig(
            taxData.id,
            taxData.name,
            taxData.tax_percentage,
            taxData.description,
            taxData.is_default || false,
            taxData.location_id,
            taxData.effective_date || new Date(),
            taxData.created_at || new Date(),
            taxData.updated_at || new Date()
        );
    }

    // Get tax percentage as a decimal (e.g., 8.75% = 0.0875)
    getTaxPercentageAsDecimal() {
        return this.tax_percentage;
    }

    // Get tax percentage as a display string (e.g., "8.75%")
    getTaxPercentageDisplay() {
        return `${(this.tax_percentage * 100).toFixed(2)}%`;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            tax_percentage: this.tax_percentage,
            tax_percentage_display: this.getTaxPercentageDisplay(),
            description: this.description,
            is_default: this.is_default,
            location_id: this.location_id,
            effective_date: this.effective_date,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }

    validate() {
        const errors = [];
        
        if (!this.name || this.name.trim().length === 0) {
            errors.push('Name is required');
        }
        
        if (this.tax_percentage === undefined || this.tax_percentage === null || typeof this.tax_percentage !== 'number' || this.tax_percentage < 0 || this.tax_percentage > 1) {
            errors.push('Tax percentage must be between 0 and 1 (e.g., 0.0875 for 8.75%)');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

module.exports = TaxConfig;