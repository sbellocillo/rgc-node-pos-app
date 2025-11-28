class User {
    constructor(id, username, role_id, role_name, created_at, location_id) {
        this.id = id;
        this.username = username;
        this.role_id = role_id;
        this.role_name = role_name;
        this.created_at = created_at;
        this.location_id = location_id;
        this.location_name = null;
  
    }

    // Static method to create a new user instance
    static create(userData) {
        return new User(
            userData.id,
            userData.username,
            userData.role_id,
            userData.role_name,
            userData.created_at || new Date(),
            userData.location_id || null,
            userData.location_name || null
        );
    }

    // Convert to JSON object
    toJSON() {
        return {
            id: this.id,
            username: this.username,
            role_id: this.role_id,
            role_name: this.role_name,
            created_at: this.created_at,
            location_id: this.location_id,
            location_name: this.location_name
        };
    }

    // Validation method
    validate() {
        const errors = [];

        if (!this.username || this.username.trim().length === 0) {
            errors.push('Username is required');
        }

        if (!this.role_id || typeof this.role_id !== 'number') {
            errors.push('Valid role_id is required');
        }

        // if (!this.role_name || this.role_name.trim().length === 0) {
        //     errors.push('Role name is required');
        // }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

module.exports = User;