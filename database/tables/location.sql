-- Create location table with detailed Philippine address structure
CREATE TABLE IF NOT EXISTS location (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    house_number VARCHAR(20),
    unit_number VARCHAR(20),
    street_name VARCHAR(100),
    barangay VARCHAR(100),
    city_municipality VARCHAR(100),
    province VARCHAR(100),
    region VARCHAR(50),
    zipcode VARCHAR(10),
    phone VARCHAR(20),
    manager_id INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for address lookups
CREATE INDEX idx_location_barangay ON location(barangay);
CREATE INDEX idx_location_city_municipality ON location(city_municipality);
CREATE INDEX idx_location_province ON location(province);
CREATE INDEX idx_location_zipcode ON location(zipcode);
CREATE INDEX idx_location_is_active ON location(is_active);

-- Insert sample data with Philippine addresses
INSERT INTO location (
    name, house_number, unit_number, street_name, barangay, 
    city_municipality, province, region, zipcode, phone
) VALUES 
    ('Ribshack Main Branch', '123', NULL, 'Rizal Street', 'Barangay San Isidro', 'Quezon City', 'Metro Manila', 'NCR', '1101', '(02) 8123-4567'),
    ('Ribshack BGC Branch', '456', 'Unit 2B', 'Bonifacio High Street', 'Barangay Fort Bonifacio', 'Taguig City', 'Metro Manila', 'NCR', '1634', '(02) 8234-5678'),
    ('Ribshack Makati Branch', '789', 'Ground Floor', 'Ayala Avenue', 'Barangay Poblacion', 'Makati City', 'Metro Manila', 'NCR', '1226', '(02) 8345-6789'),
    ('Ribshack Cebu Branch', '321', NULL, 'Colon Street', 'Barangay Lahug', 'Cebu City', 'Cebu', 'Region VII', '6000', '(032) 412-3456'),
    ('Ribshack Davao Branch', '654', 'Unit 1A', 'C.M. Recto Avenue', 'Barangay Poblacion District', 'Davao City', 'Davao del Sur', 'Region XI', '8000', '(082) 321-4567')
ON CONFLICT (name) DO NOTHING;