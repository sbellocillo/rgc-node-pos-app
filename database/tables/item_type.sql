-- Create item_type table
-- This table stores different categories or types of items (e.g., Food, Beverage, Dessert, etc.)

DROP TABLE IF EXISTS item_type CASCADE;

CREATE TABLE item_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster lookups
CREATE INDEX idx_item_type_name ON item_type(name);
CREATE INDEX idx_item_type_is_active ON item_type(is_active);

-- Insert sample item types
INSERT INTO item_type (name, description) VALUES 
    ('Food', 'General food items'),
    ('Beverage', 'All beverages'),
    ('Dessert', 'Sweet treats and desserts'),
    ('Appetizer', 'Starter dishes and appetizers'),
    ('Main Course', 'Primary entrees and main dishes'),
    ('Side Dish', 'Side items and accompaniments'),
    ('Alcoholic Beverage', 'Beer, wine, and spirits'),
    ('Non-Alcoholic Beverage', 'Soft drinks, juices, and non-alcoholic drinks'),
    ('Snack', 'Light snacks and finger foods'),
    ('Special', 'Daily specials and seasonal items');

-- Display the created table
SELECT * FROM item_type ORDER BY id;