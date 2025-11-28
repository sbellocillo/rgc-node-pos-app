-- Ribshack POS Database Setup Script
-- Run this script to create all tables with proper relationships

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create users table first (referenced by orders)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id INTEGER NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    location_id INTEGER REFERENCES location(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample users data
INSERT INTO users (username, password, role_id, role_name) VALUES
('admin', '$2b$10$rOeWrqkZ1M4YZqZqP1QgO.ZQF6QzFrfzG7t9YHXfzK8vK0Z1M4YZq', 1, 'Administrator'),
('cashier1', '$2b$10$rOeWrqkZ1M4YZqZqP1QgO.ZQF6QzFrfzG7t9YHXfzK8vK0Z1M4YZq', 2, 'Cashier'),
('manager1', '$2b$10$rOeWrqkZ1M4YZqZqP1QgO.ZQF6QzFrfzG7t9YHXfzK8vK0Z1M4YZq', 3, 'Manager')
ON CONFLICT (username) DO NOTHING;

-- Create base tables (no foreign key dependencies)
\i tables/roles.sql
\i tables/status.sql  
\i tables/order_type.sql
\i tables/location.sql
\i tables/paymentmethod.sql

-- Create items table (no foreign key dependencies)
\i tables/items.sql

-- Create orders table (references multiple tables)
\i tables/orders.sql

-- Create order_items table (references orders and items)
\i tables/order_items.sql

-- Success message
SELECT 'Ribshack POS database setup completed successfully!' AS message;