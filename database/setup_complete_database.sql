-- Master script to drop all tables and recreate with updated schema
-- This script will completely rebuild the database with all new columns

-- Drop all tables in correct order (reverse dependency order)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS item_type CASCADE;
DROP TABLE IF EXISTS tax_config CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS status CASCADE;
DROP TABLE IF EXISTS location CASCADE;
DROP TABLE IF EXISTS paymentmethod CASCADE;
DROP TABLE IF EXISTS order_type CASCADE;

-- Recreate all tables with updated schema

-- 1. Create roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (name) VALUES 
    ('Administrator'),
    ('Cashier'),
    ('Manager'),
    ('Kitchen Staff'),
    ('Server');

-- 2. Create status table
CREATE TABLE status (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO status (name) VALUES 
    ('Pending'),
    ('Processing'),
    ('Completed'),
    ('Cancelled'),
    ('On Hold');

-- 3. Create location table with Philippine address structure
CREATE TABLE location (
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

-- Create indexes for location
CREATE INDEX idx_location_barangay ON location(barangay);
CREATE INDEX idx_location_city_municipality ON location(city_municipality);
CREATE INDEX idx_location_province ON location(province);
CREATE INDEX idx_location_zipcode ON location(zipcode);
CREATE INDEX idx_location_is_active ON location(is_active);

INSERT INTO location (
    name, house_number, unit_number, street_name, barangay, 
    city_municipality, province, region, zipcode, phone
) VALUES 
    ('Ribshack Main Branch', '123', NULL, 'Rizal Street', 'Barangay San Isidro', 'Quezon City', 'Metro Manila', 'NCR', '1101', '(02) 8123-4567'),
    ('Ribshack BGC Branch', '456', 'Unit 2B', 'Bonifacio High Street', 'Barangay Fort Bonifacio', 'Taguig City', 'Metro Manila', 'NCR', '1634', '(02) 8234-5678'),
    ('Ribshack Makati Branch', '789', 'Ground Floor', 'Ayala Avenue', 'Barangay Poblacion', 'Makati City', 'Metro Manila', 'NCR', '1226', '(02) 8345-6789');

-- 4. Create paymentmethod table
CREATE TABLE paymentmethod (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO paymentmethod (name) VALUES 
    ('Cash'),
    ('Credit Card'),
    ('Debit Card'),
    ('Mobile Payment'),
    ('Gift Card');

-- 5. Create order_type table
CREATE TABLE order_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO order_type (name) VALUES 
    ('Dine In'),
    ('Take Out'),
    ('Delivery'),
    ('Drive Thru');

-- 6. Create item_type table
CREATE TABLE item_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_item_type_name ON item_type(name);
CREATE INDEX idx_item_type_is_active ON item_type(is_active);

INSERT INTO item_type (name, description) VALUES 
    ('Food', 'General food items'),
    ('Beverage', 'All beverages'),
    ('Dessert', 'Sweet treats and desserts'),
    ('Appetizer', 'Starter dishes and appetizers'),
    ('Main Course', 'Primary entrees and main dishes'),
    ('Side Dish', 'Side items and accompaniments'),
    ('Alcoholic Beverage', 'Beer, wine, and spirits'),
    ('Non-Alcoholic Beverage', 'Soft drinks, juices, and non-alcoholic drinks');

-- 7. Create tax_config table
CREATE TABLE tax_config (
    id SERIAL PRIMARY KEY,
    tax_name VARCHAR(100) NOT NULL,
    tax_rate DECIMAL(5,4) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tax_config_is_default ON tax_config(is_default);
CREATE INDEX idx_tax_config_is_active ON tax_config(is_active);

INSERT INTO tax_config (tax_name, tax_rate, description, is_default) VALUES
    ('Standard VAT', 0.1200, 'Philippines 12% VAT', true),
    ('No Tax', 0.0000, 'Tax-exempt items', false),
    ('Service Charge', 0.1000, '10% Service charge', false);

-- 8. Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    role_id INTEGER NOT NULL REFERENCES roles(id),
    role_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, role_id, role_name) VALUES
    ('admin', 1, 'Administrator'),
    ('cashier1', 2, 'Cashier'),
    ('manager1', 3, 'Manager');

-- 9. Create items table
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    sku VARCHAR(50) UNIQUE,
    item_type_id INTEGER REFERENCES item_type(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_items_name ON items(name);
CREATE INDEX idx_items_sku ON items(sku);
CREATE INDEX idx_items_item_type_id ON items(item_type_id);
CREATE INDEX idx_items_is_active ON items(is_active);

INSERT INTO items (name, description, price, sku, item_type_id) VALUES 
    ('BBQ Ribs', 'Full rack of slow-cooked baby back ribs', 24.99, 'RIB001', 5),
    ('Pulled Pork Sandwich', 'Tender pulled pork with BBQ sauce', 12.99, 'PPK001', 5),
    ('Coleslaw', 'Creamy coleslaw side dish', 3.99, 'COL001', 6),
    ('Mac and Cheese', 'Homemade mac and cheese', 5.99, 'MAC001', 6),
    ('Coca Cola', 'Ice cold Coca Cola', 2.49, 'COK001', 8);

-- 10. Create orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shipping_address VARCHAR(500),
    billing_address VARCHAR(500),
    status_id INTEGER REFERENCES status(id),
    quantity DECIMAL(10,2),
    order_type_id INTEGER REFERENCES order_type(id),
    subtotal DECIMAL(10,2) NOT NULL,
    tax_percentage DECIMAL(5,4) DEFAULT 0.1200,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    location_id INTEGER REFERENCES location(id),
    payment_method_id INTEGER REFERENCES paymentmethod(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- 11. Create order_items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES items(id),
    status_id INTEGER REFERENCES status(id),
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    rate DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_percentage DECIMAL(5,4) DEFAULT 0.1200,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    amount DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Display all created tables
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;