-- Create status table
CREATE TABLE IF NOT EXISTS status (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Insert sample data
INSERT INTO status (name) VALUES 
    ('Pending'),
    ('Processing'),
    ('Completed'),
    ('Cancelled'),
    ('On Hold')
ON CONFLICT DO NOTHING;