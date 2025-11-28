class Location {
    constructor(id, name, house_number, unit_number, street_name, barangay, city_municipality, province, region, zipcode, phone, manager_id, is_active) {
        this.id = id;
        this.name = name;
        this.house_number = house_number;
        this.unit_number = unit_number;
        this.street_name = street_name;
        this.barangay = barangay;
        this.city_municipality = city_municipality;
        this.province = province;
        this.region = region;
        this.zipcode = zipcode;
        this.phone = phone;
        this.manager_id = manager_id;
        this.is_active = is_active;


    }

    static create(locationData) {
        return new Location(
            locationData.id,
            locationData.name,
            locationData.house_number,
            locationData.unit_number,
            locationData.street_name,
            locationData.barangay,
            locationData.city_municipality,
            locationData.province,
            locationData.region,
            locationData.zipcode,
            locationData.phone,
            locationData.manager_id,
            locationData.is_active
        );
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            house_number: this.house_number,
            unit_number: this.unit_number,
            street_name: this.street_name,
            barangay: this.barangay,
            city_municipality: this.city_municipality,
            province: this.province,
            region: this.region,
            zipcode: this.zipcode,
            phone: this.phone,
            manager_id: this.manager_id,
            is_active: this.is_active

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

module.exports = Location;