CREATE TABLE IF NOT EXISTS layout_templates (
id SERIAL PRIMARY KEY,
    layout_id INT NOT NULL,
    layout_indices_id INT NOT NULL,
    item_id INT NOT NULL,  -- Renamed from default_item_id
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Link to Layout
    CONSTRAINT fk_template_layout
        FOREIGN KEY (layout_id)
        REFERENCES layouts(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    -- Link to Grid Index
    CONSTRAINT fk_template_indices
        FOREIGN KEY (layout_indices_id)
        REFERENCES layout_indices(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    -- Link to Item (updated to use item_id)
    CONSTRAINT fk_template_item
        FOREIGN KEY (item_id)
        REFERENCES items(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    -- Ensure unique slots per layout
    CONSTRAINT unique_template_slot 
        UNIQUE (layout_id, layout_indices_id)
);

-- 3. CREATE Indexes (Updated for item_id)
CREATE INDEX idx_layout_templates_layout ON layout_templates(layout_id);
CREATE INDEX idx_layout_templates_item ON layout_templates(item_id);