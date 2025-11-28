-- Create item_category table
CREATE TABLE IF NOT EXISTS item_category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    
    -- Category hierarchy support
    parent_category_id INTEGER REFERENCES item_category(id),
    
    -- Display and ordering
    display_order INTEGER DEFAULT 0,
    color_code VARCHAR(7), -- For UI color coding (hex format)
    icon VARCHAR(50), -- Icon name/class for UI
    
    -- Business rules
    is_taxable BOOLEAN DEFAULT TRUE,
    tax_rate DECIMAL(5,4) DEFAULT 0.1200, -- Default 12% tax rate
    
    -- Inventory settings
    track_inventory BOOLEAN DEFAULT TRUE,
    allow_backorders BOOLEAN DEFAULT FALSE,
    
    -- Status and tracking
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_item_category_parent ON item_category(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_item_category_active ON item_category(is_active);
CREATE INDEX IF NOT EXISTS idx_item_category_display_order ON item_category(display_order);

-- Insert default categories for restaurant POS
INSERT INTO item_category (name, description, display_order, color_code, icon, is_taxable, tax_rate) VALUES
('Appetizers', 'Starter dishes and small plates', 1, '#FF6B6B', 'appetizer', true, 0.1200),
('Main Course', 'Primary dishes and entrees', 2, '#4ECDC4', 'main-dish', true, 0.1200),
('Desserts', 'Sweet treats and desserts', 3, '#45B7D1', 'dessert', true, 0.1200),
('Beverages', 'Drinks and beverages', 4, '#96CEB4', 'beverage', true, 0.1200),
('Alcoholic Drinks', 'Beer, wine, cocktails', 5, '#FFEAA7', 'alcohol', true, 0.1200),
('Side Dishes', 'Side orders and accompaniments', 6, '#DDA0DD', 'side-dish', true, 0.1200),
('Seafood', 'Fresh seafood dishes', 7, '#FFB6C1', 'seafood', true, 0.1200),
('Grilled Items', 'Barbecue and grilled dishes', 8, '#F4A261', 'grill', true, 0.1200),
('Vegetarian', 'Plant-based dishes', 9, '#90EE90', 'vegetarian', true, 0.1200),
('Special Menu', 'Chef specials and seasonal items', 10, '#FFD700', 'special', true, 0.1200)
ON CONFLICT (name) DO NOTHING;