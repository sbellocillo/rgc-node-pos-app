-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10) CHECK (gender IN ('Male', 'Female', 'Other')),
    
    -- Address fields using Philippine address structure
    house_number VARCHAR(20),
    unit_number VARCHAR(20),
    street_name VARCHAR(100),
    barangay VARCHAR(100),
    city_municipality VARCHAR(100),
    province VARCHAR(100),
    region VARCHAR(50),
    zipcode VARCHAR(10),
    
    -- Customer preferences and notes
    dietary_preferences TEXT,
    allergies TEXT,
    notes TEXT,
    
    -- Membership and status
    membership_level VARCHAR(50) DEFAULT 'Regular',
    loyalty_points INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_spent DECIMAL(12,2) DEFAULT 0.00,
    
    -- Status and tracking
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_last_name ON customers(last_name);
CREATE INDEX idx_customers_city_municipality ON customers(city_municipality);
CREATE INDEX idx_customers_province ON customers(province);
CREATE INDEX idx_customers_membership_level ON customers(membership_level);
CREATE INDEX idx_customers_is_active ON customers(is_active);

-- Insert sample customer data
INSERT INTO customers (
    first_name, last_name, email, phone, date_of_birth, gender,
    house_number, street_name, barangay, city_municipality, province, region, zipcode,
    membership_level, loyalty_points, total_orders, total_spent
) VALUES 
    ('Juan', 'Dela Cruz', 'juan.delacruz@email.com', '09171234567', '1985-06-15', 'Male',
     '123', 'Rizal Street', 'Barangay San Antonio', 'Manila', 'Metro Manila', 'NCR', '1000',
     'Gold', 250, 15, 3500.00),
    ('Maria', 'Santos', 'maria.santos@email.com', '09181234567', '1990-03-22', 'Female',
     '456', 'Bonifacio Street', 'Barangay Poblacion', 'Quezon City', 'Metro Manila', 'NCR', '1100',
     'Silver', 150, 8, 1200.00),
    ('Pedro', 'Garcia', 'pedro.garcia@email.com', '09191234567', '1982-12-05', 'Male',
     '789', 'Mabini Avenue', 'Barangay Centro', 'Makati City', 'Metro Manila', 'NCR', '1200',
     'Regular', 50, 3, 450.00),
    ('Ana', 'Rodriguez', 'ana.rodriguez@email.com', '09201234567', '1995-08-18', 'Female',
     '321', 'Colon Street', 'Barangay Lahug', 'Cebu City', 'Cebu', 'Region VII', '6000',
     'Platinum', 500, 25, 7500.00),
    ('Carlos', 'Villanueva', 'carlos.villanueva@email.com', '09211234567', '1988-11-30', 'Male',
     '654', 'C.M. Recto Avenue', 'Barangay Poblacion District', 'Davao City', 'Davao del Sur', 'Region XI', '8000',
     'Gold', 200, 12, 2800.00);

-- Display created table
SELECT id, first_name, last_name, email, phone, city_municipality, 
       membership_level, loyalty_points, total_orders, total_spent, is_active
FROM customers 
ORDER BY id;