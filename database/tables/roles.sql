-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Insert sample data
INSERT INTO roles (name) VALUES 
    ('Administrator'),
    ('Cashier'),
    ('Manager'),
    ('Kitchen Staff'),
    ('Server')
ON CONFLICT DO NOTHING;