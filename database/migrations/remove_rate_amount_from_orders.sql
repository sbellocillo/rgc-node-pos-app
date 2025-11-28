-- Migration script to remove rate and amount columns from orders table

-- Remove rate and amount columns from orders table
ALTER TABLE orders DROP COLUMN IF EXISTS rate;
ALTER TABLE orders DROP COLUMN IF EXISTS amount;

-- Display updated table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;