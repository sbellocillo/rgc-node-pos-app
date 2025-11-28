-- Create paymentmethod table
CREATE TABLE IF NOT EXISTS paymentmethod (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Insert sample data
INSERT INTO paymentmethod (name) VALUES 
    ('Cash'),
    ('Credit Card'),
    ('Debit Card'),
    ('Mobile Payment'),
    ('Gift Card'),
    ('Check')
ON CONFLICT DO NOTHING;