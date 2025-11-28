// Item Category Model
class ItemCategory {
    constructor(data = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.description = data.description || '';
        this.parent_category_id = data.parent_category_id || null;
        this.display_order = data.display_order || 0;
        this.color_code = data.color_code || '#000000';
        this.icon = data.icon || '';
        this.is_taxable = data.is_taxable !== undefined ? data.is_taxable : true;
        this.tax_rate = data.tax_rate || 0.1200;
        this.track_inventory = data.track_inventory !== undefined ? data.track_inventory : true;
        this.allow_backorders = data.allow_backorders !== undefined ? data.allow_backorders : false;
        this.is_active = data.is_active !== undefined ? data.is_active : true;
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
        this.created_by = data.created_by || null;
    }

    // Validation method
    validate() {
        const errors = [];

        // Required fields
        if (!this.name || this.name.trim().length === 0) {
            errors.push('Category name is required');
        }

        if (this.name && this.name.length > 100) {
            errors.push('Category name must be 100 characters or less');
        }

        // Validate color code format (hex)
        if (this.color_code && !/^#[0-9A-Fa-f]{6}$/.test(this.color_code)) {
            errors.push('Color code must be in hex format (#RRGGBB)');
        }

        // Validate tax rate
        if (this.tax_rate !== null && (this.tax_rate < 0 || this.tax_rate > 1)) {
            errors.push('Tax rate must be between 0 and 1 (0% to 100%)');
        }

        // Validate display order
        if (this.display_order < 0) {
            errors.push('Display order cannot be negative');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Get formatted tax rate as percentage
    getTaxRatePercentage() {
        return this.tax_rate ? (this.tax_rate * 100).toFixed(2) + '%' : '0.00%';
    }

    // Check if category has subcategories
    hasSubcategories() {
        return this.parent_category_id === null;
    }

    // Get category hierarchy path (for breadcrumb navigation)
    getHierarchyPath(allCategories = []) {
        const path = [this];
        let current = this;

        while (current.parent_category_id) {
            const parent = allCategories.find(cat => cat.id === current.parent_category_id);
            if (parent) {
                path.unshift(parent);
                current = parent;
            } else {
                break;
            }
        }

        return path;
    }

    // Convert to JSON for API responses
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            parent_category_id: this.parent_category_id,
            display_order: this.display_order,
            color_code: this.color_code,
            icon: this.icon,
            is_taxable: this.is_taxable,
            tax_rate: this.tax_rate,
            tax_rate_percentage: this.getTaxRatePercentage(),
            track_inventory: this.track_inventory,
            allow_backorders: this.allow_backorders,
            is_active: this.is_active,
            created_at: this.created_at,
            updated_at: this.updated_at,
            created_by: this.created_by
        };
    }
}

module.exports = ItemCategory;