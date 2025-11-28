-- Create items table with item_type relationship
DROP TABLE IF EXISTS items CASCADE;

CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(500), -- URL or file path to item image
    price DECIMAL(10,2) NOT NULL,
    sku VARCHAR(50) UNIQUE,
    item_type_id INTEGER REFERENCES item_type(id) ON DELETE SET NULL,
    category_id INTEGER REFERENCES item_category(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_items_name ON items(name);
CREATE INDEX idx_items_sku ON items(sku);
CREATE INDEX idx_items_item_type_id ON items(item_type_id);
CREATE INDEX idx_items_is_active ON items(is_active);

-- Insert sample data with item types
INSERT INTO items (name, description, price, sku, item_type_id) VALUES 
    ('BBQ Ribs', 'Full rack of slow-cooked baby back ribs', 24.99, 'RIB001', 5),  -- Main Course
    ('Pulled Pork Sandwich', 'Tender pulled pork with BBQ sauce', 12.99, 'PPK001', 5),  -- Main Course
    ('Brisket Platter', 'Sliced beef brisket with sides', 18.99, 'BRK001', 5),  -- Main Course
    ('Coleslaw', 'Creamy coleslaw side dish', 3.99, 'COL001', 6),  -- Side Dish
    ('Mac and Cheese', 'Homemade mac and cheese', 5.99, 'MAC001', 6),  -- Side Dish
    ('Cornbread', 'Fresh baked cornbread', 2.99, 'CRN001', 6),  -- Side Dish
    ('Buffalo Wings', 'Spicy buffalo chicken wings', 8.99, 'BWG001', 4),  -- Appetizer
    ('Nachos Supreme', 'Loaded nachos with all the fixings', 9.99, 'NCH001', 4),  -- Appetizer
    ('Chocolate Cake', 'Rich chocolate layer cake', 6.99, 'CHC001', 3),  -- Dessert
    ('Apple Pie', 'Homemade apple pie with ice cream', 5.99, 'APP001', 3),  -- Dessert
    ('Coca Cola', 'Ice cold Coca Cola', 2.49, 'COK001', 8),  -- Non-Alcoholic Beverage
    ('Sweet Tea', 'Southern style sweet tea', 2.99, 'TEA001', 8),  -- Non-Alcoholic Beverage
    ('Beer - Draft', 'Local craft beer on tap', 4.99, 'BER001', 7),  -- Alcoholic Beverage
    ('House Wine', 'Red or white house wine', 6.99, 'WIN001', 7);  -- Alcoholic Beverage

-- Display the created table
SELECT i.*, it.name as item_type_name 
FROM items i 
LEFT JOIN item_type it ON i.item_type_id = it.id 
ORDER BY i.id;