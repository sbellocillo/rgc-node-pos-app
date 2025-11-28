-- Create order_type table
CREATE TABLE IF NOT EXISTS order_type (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Insert sample data
INSERT INTO order_type (name) VALUES 
    ('Dine In'),
    ('Take Out'),
    ('Delivery'),
    ('Drive Thru'),
    ('Online')
ON CONFLICT DO NOTHING;