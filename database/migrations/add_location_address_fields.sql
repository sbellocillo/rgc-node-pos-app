-- Migration script to add address fields to existing location table
-- Add new address columns to location table

ALTER TABLE location ADD COLUMN IF NOT EXISTS house_number VARCHAR(20);
ALTER TABLE location ADD COLUMN IF NOT EXISTS unit_number VARCHAR(20);
ALTER TABLE location ADD COLUMN IF NOT EXISTS street_name VARCHAR(100);
ALTER TABLE location ADD COLUMN IF NOT EXISTS barangay VARCHAR(100);
ALTER TABLE location ADD COLUMN IF NOT EXISTS city_municipality VARCHAR(100);
ALTER TABLE location ADD COLUMN IF NOT EXISTS province VARCHAR(100);
ALTER TABLE location ADD COLUMN IF NOT EXISTS region VARCHAR(50);
ALTER TABLE location ADD COLUMN IF NOT EXISTS zipcode VARCHAR(10);
ALTER TABLE location ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE location ADD COLUMN IF NOT EXISTS manager_id INTEGER;
ALTER TABLE location ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE location ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create new indexes for address lookups
CREATE INDEX IF NOT EXISTS idx_location_barangay ON location(barangay);
CREATE INDEX IF NOT EXISTS idx_location_city_municipality ON location(city_municipality);
CREATE INDEX IF NOT EXISTS idx_location_province ON location(province);
CREATE INDEX IF NOT EXISTS idx_location_zipcode ON location(zipcode);

-- Update existing records with sample Philippine addresses
UPDATE location SET 
    house_number = '123',
    street_name = 'Rizal Street',
    barangay = 'Barangay San Isidro',
    city_municipality = 'Quezon City',
    province = 'Metro Manila',
    region = 'NCR',
    zipcode = '1101',
    phone = '(02) 8123-4567'
WHERE name = 'Main Dining Room';

UPDATE location SET 
    house_number = '456',
    unit_number = 'Unit 2B',
    street_name = 'Bonifacio High Street',
    barangay = 'Barangay Fort Bonifacio',
    city_municipality = 'Taguig City',
    province = 'Metro Manila',
    region = 'NCR',
    zipcode = '1634',
    phone = '(02) 8234-5678'
WHERE name = 'Patio';

UPDATE location SET 
    house_number = '789',
    unit_number = 'Ground Floor',
    street_name = 'Ayala Avenue',
    barangay = 'Barangay Poblacion',
    city_municipality = 'Makati City',
    province = 'Metro Manila',
    region = 'NCR',
    zipcode = '1226',
    phone = '(02) 8345-6789'
WHERE name = 'Bar Area';

UPDATE location SET 
    house_number = '321',
    street_name = 'Colon Street',
    barangay = 'Barangay Lahug',
    city_municipality = 'Cebu City',
    province = 'Cebu',
    region = 'Region VII',
    zipcode = '6000',
    phone = '(032) 412-3456'
WHERE name = 'Private Room';

UPDATE location SET 
    house_number = '654',
    unit_number = 'Unit 1A',
    street_name = 'C.M. Recto Avenue',
    barangay = 'Barangay Poblacion District',
    city_municipality = 'Davao City',
    province = 'Davao del Sur',
    region = 'Region XI',
    zipcode = '8000',
    phone = '(082) 321-4567'
WHERE name = 'Counter Service';

-- Display updated table
SELECT id, name, house_number, unit_number, street_name, barangay, 
       city_municipality, province, region, zipcode, phone, is_active 
FROM location 
ORDER BY id;