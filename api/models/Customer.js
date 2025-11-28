class Customer {
    constructor(customerData) {
        this.id = customerData.id;
        this.first_name = customerData.first_name;
        this.last_name = customerData.last_name;
        this.email = customerData.email;
        this.phone = customerData.phone;
        this.date_of_birth = customerData.date_of_birth;
        this.gender = customerData.gender;
        
        // Address fields
        this.house_number = customerData.house_number;
        this.unit_number = customerData.unit_number;
        this.street_name = customerData.street_name;
        this.barangay = customerData.barangay;
        this.city_municipality = customerData.city_municipality;
        this.province = customerData.province;
        this.region = customerData.region;
        this.zipcode = customerData.zipcode;
        
        // Preferences and notes
        this.dietary_preferences = customerData.dietary_preferences;
        this.allergies = customerData.allergies;
        this.notes = customerData.notes;
        
        // Membership and loyalty
        this.membership_level = customerData.membership_level || 'Regular';
        this.loyalty_points = customerData.loyalty_points || 0;
        this.total_orders = customerData.total_orders || 0;
        this.total_spent = customerData.total_spent || 0.00;
        
        // Status
        this.is_active = customerData.is_active !== undefined ? customerData.is_active : true;
        this.created_at = customerData.created_at;
        this.updated_at = customerData.updated_at;
    }

    // Static method to create a new customer instance
    static create(customerData) {
        return new Customer(customerData);
    }

    // Get full name
    getFullName() {
        return `${this.first_name} ${this.last_name}`.trim();
    }

    // Get formatted address
    getFormattedAddress() {
        const addressParts = [];
        
        if (this.house_number) addressParts.push(this.house_number);
        if (this.unit_number) addressParts.push(this.unit_number);
        if (this.street_name) addressParts.push(this.street_name);
        if (this.barangay) addressParts.push(this.barangay);
        if (this.city_municipality) addressParts.push(this.city_municipality);
        if (this.province) addressParts.push(this.province);
        if (this.zipcode) addressParts.push(this.zipcode);
        
        return addressParts.join(', ');
    }

    // Calculate loyalty tier based on points
    getLoyaltyTier() {
        if (this.loyalty_points >= 500) return 'Platinum';
        if (this.loyalty_points >= 250) return 'Gold';
        if (this.loyalty_points >= 100) return 'Silver';
        return 'Regular';
    }

    // Add loyalty points
    addLoyaltyPoints(points) {
        this.loyalty_points += points;
        this.membership_level = this.getLoyaltyTier();
    }

    // Update order statistics
    updateOrderStats(orderAmount) {
        this.total_orders += 1;
        this.total_spent += parseFloat(orderAmount);
        // Award 1 point per peso spent
        this.addLoyaltyPoints(Math.floor(orderAmount));
    }

    // Validate customer data
    validate() {
        const errors = [];

        // Required fields validation
        if (!this.first_name || this.first_name.trim().length === 0) {
            errors.push('First name is required');
        }
        if (!this.last_name || this.last_name.trim().length === 0) {
            errors.push('Last name is required');
        }

        // Email validation (optional but must be valid if provided)
        if (this.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(this.email)) {
                errors.push('Invalid email format');
            }
        }

        // Phone validation (optional but must be valid if provided)
        if (this.phone) {
            const phoneRegex = /^(\+63|0)[0-9]{10}$/;
            if (!phoneRegex.test(this.phone.replace(/[\s\-\(\)]/g, ''))) {
                errors.push('Invalid Philippine phone number format');
            }
        }

        // Gender validation
        if (this.gender && !['Male', 'Female', 'Other'].includes(this.gender)) {
            errors.push('Gender must be Male, Female, or Other');
        }

        // Membership level validation
        const validMembershipLevels = ['Regular', 'Silver', 'Gold', 'Platinum'];
        if (this.membership_level && !validMembershipLevels.includes(this.membership_level)) {
            errors.push('Invalid membership level');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Convert to JSON for API responses
    toJSON() {
        return {
            id: this.id,
            full_name: this.getFullName(),
            first_name: this.first_name,
            last_name: this.last_name,
            email: this.email,
            phone: this.phone,
            date_of_birth: this.date_of_birth,
            gender: this.gender,
            address: this.getFormattedAddress(),
            address_details: {
                house_number: this.house_number,
                unit_number: this.unit_number,
                street_name: this.street_name,
                barangay: this.barangay,
                city_municipality: this.city_municipality,
                province: this.province,
                region: this.region,
                zipcode: this.zipcode
            },
            dietary_preferences: this.dietary_preferences,
            allergies: this.allergies,
            notes: this.notes,
            membership_level: this.membership_level,
            loyalty_points: this.loyalty_points,
            total_orders: this.total_orders,
            total_spent: this.total_spent,
            is_active: this.is_active,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

module.exports = Customer;