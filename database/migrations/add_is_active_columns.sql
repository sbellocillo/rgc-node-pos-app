-- Migration script to add is_active columns to existing tables
-- Run this script to add is_active columns without dropping tables

-- Add is_active column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add is_active column to roles table  
ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add is_active column to status table
ALTER TABLE status ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add is_active column to location table
ALTER TABLE location ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add is_active column to paymentmethod table
ALTER TABLE paymentmethod ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add is_active column to order_type table
ALTER TABLE order_type ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add is_active column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add is_active column to order_items table
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add is_active column to items table (if not already exists)
ALTER TABLE items ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Add is_active column to item_type table (if not already exists)
ALTER TABLE item_type ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create indexes on is_active columns for better query performance
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_roles_is_active ON roles(is_active);
CREATE INDEX IF NOT EXISTS idx_status_is_active ON status(is_active);
CREATE INDEX IF NOT EXISTS idx_location_is_active ON location(is_active);
CREATE INDEX IF NOT EXISTS idx_paymentmethod_is_active ON paymentmethod(is_active);
CREATE INDEX IF NOT EXISTS idx_order_type_is_active ON order_type(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_is_active ON orders(is_active);
CREATE INDEX IF NOT EXISTS idx_order_items_is_active ON order_items(is_active);
CREATE INDEX IF NOT EXISTS idx_items_is_active ON items(is_active);
CREATE INDEX IF NOT EXISTS idx_item_type_is_active ON item_type(is_active);

-- Verify the changes
SELECT 'users' as table_name, COUNT(*) as total_records, COUNT(*) FILTER (WHERE is_active = true) as active_records FROM users
UNION ALL
SELECT 'roles', COUNT(*), COUNT(*) FILTER (WHERE is_active = true) FROM roles
UNION ALL
SELECT 'status', COUNT(*), COUNT(*) FILTER (WHERE is_active = true) FROM status
UNION ALL
SELECT 'location', COUNT(*), COUNT(*) FILTER (WHERE is_active = true) FROM location
UNION ALL
SELECT 'paymentmethod', COUNT(*), COUNT(*) FILTER (WHERE is_active = true) FROM paymentmethod
UNION ALL
SELECT 'order_type', COUNT(*), COUNT(*) FILTER (WHERE is_active = true) FROM order_type
UNION ALL
SELECT 'orders', COUNT(*), COUNT(*) FILTER (WHERE is_active = true) FROM orders
UNION ALL
SELECT 'order_items', COUNT(*), COUNT(*) FILTER (WHERE is_active = true) FROM order_items
UNION ALL
SELECT 'items', COUNT(*), COUNT(*) FILTER (WHERE is_active = true) FROM items
UNION ALL
SELECT 'item_type', COUNT(*), COUNT(*) FILTER (WHERE is_active = true) FROM item_type;