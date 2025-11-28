-- Create tax_config table for managing tax rates
CREATE TABLE IF NOT EXISTS tax_config (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    tax_percentage DECIMAL(5,4) NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    location_id INTEGER REFERENCES location(id),
    effective_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample tax configurations
INSERT INTO tax_config (name, tax_percentage, description, is_default) VALUES 
    ('Standard Sales Tax', 0.0875, 'Standard 8.75% sales tax rate', TRUE),
    ('Food Tax', 0.0500, 'Reduced 5% tax rate for food items', FALSE),
    ('No Tax', 0.0000, 'Tax-exempt items', FALSE),
    ('Luxury Tax', 0.1000, '10% tax for luxury items', FALSE)
ON CONFLICT DO NOTHING;