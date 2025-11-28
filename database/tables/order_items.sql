-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES items(id),
    status_id INTEGER REFERENCES status(id),
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    rate DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL, -- quantity * rate
    tax_percentage DECIMAL(5,4) DEFAULT 0.1200, -- Item-level tax rate
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    amount DECIMAL(10,2) NOT NULL, -- subtotal + tax_amount
    is_active BOOLEAN DEFAULT TRUE
);