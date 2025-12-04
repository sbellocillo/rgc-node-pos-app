-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id), -- Staff/user who processed the order
    customer_id INTEGER REFERENCES customers(id), -- Customer who placed the order
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    memo TEXT, -- Order notes, special instructions, or comments
    shipping_address VARCHAR(500),
    billing_address VARCHAR(500),
    status_id INTEGER REFERENCES status(id),
    order_type_id INTEGER REFERENCES order_type(id),
    subtotal DECIMAL(10,2) NOT NULL,
    tax_percentage DECIMAL(5,4) DEFAULT 0.1200, -- Default 12% tax rate
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    location_id INTEGER REFERENCES location(id),
    payment_method_id INTEGER REFERENCES paymentmethod(id),
    card_network_id INTEGER REFERENCES card_networks(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);