CREATE TABLE IF NOT EXISTS layout_templates (
    id SERIAL PRIMARY KEY,
    layout_id INT NOT NULL,
    layout_indices_id INT NOT NULL,
    default_item_id INT NOT NULL, -- The item to place here by default
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 1. Link to the Layout (Metadata)
    CONSTRAINT fk_template_layout
        FOREIGN KEY (layout_id)
        REFERENCES layouts(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    -- 2. Link to the Grid Position (1-25)
    CONSTRAINT fk_template_indices
        FOREIGN KEY (layout_indices_id)
        REFERENCES layout_indices(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    -- 3. Link to the Item (The content)
    CONSTRAINT fk_template_item
        FOREIGN KEY (default_item_id)
        REFERENCES items(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    -- 4. CRITICAL: Ensure we never assign two items to the same slot in the same master layout
    CONSTRAINT unique_template_slot 
        UNIQUE (layout_id, layout_indices_id)
);

-- Indexes for performance
CREATE INDEX idx_layout_templates_layout ON layout_templates(layout_id);
CREATE INDEX idx_layout_templates_item ON layout_templates(default_item_id);