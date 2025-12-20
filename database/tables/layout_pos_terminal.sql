-- Rows = active layouts × 25 positions per location 
-- Each location can have different numbers of rows

CREATE TABLE IF NOT EXISTS layout_pos_terminal (
	id SERIAL PRIMARY KEY,
	layout_indices_id INT NOT NULL,
	location_id INT NOT NULL,
	layout_id INT NOT NULL,
	item_id INT NOT NULL,
	item_type_id INT NOT NULL,
	is_active BOOLEAN NOT NULL DEFAULT true,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_pos_layout_indices
		FOREIGN KEY (layout_indices_id)
		REFERENCES layout_indices(id)
		ON DELETE RESTRICT
		ON UPDATE CASCADE,
	CONSTRAINT fk_pos_location
		FOREIGN KEY (location_id)
		REFERENCES location(id)
		ON DELETE CASCADE
		ON UPDATE CASCADE,
	CONSTRAINT fk_pos_layout
		FOREIGN KEY (layout_id)
		REFERENCES layouts(id)
		ON DELETE CASCADE
		ON UPDATE CASCADE,
	CONSTRAINT fk_pos_item
		FOREIGN KEY (item_id)
		REFERENCES items(id)
		ON DELETE RESTRICT
		ON UPDATE CASCADE,
	CONSTRAINT fk_pos_item_type
		FOREIGN KEY (item_type_id)
		REFERENCES item_type(id)
		ON DELETE RESTRICT
		ON UPDATE CASCADE,
	CONSTRAINT unique_position_per_layout_location
		UNIQUE (layout_id, location_id, layout_indices_id)
);

CREATE INDEX idx_pos_terminal_location ON layout_pos_terminal(location_id);
CREATE INDEX idx_pos_terminal_layout ON layout_pos_terminal(layout_id);
CREATE INDEX idx_pos_terminal_item ON layout_pos_terminal(item_id);
CREATE INDEX idx_pos_terminal_active ON layout_pos_terminal(is_active) WHERE is_active = true;
CREATE INDEX idx_pos_terminal_location_layout ON layout_pos_terminal(layout_id, location_id);

CREATE INDEX idx_pos_terminal_location ON layout_pos_terminal(location_id);
CREATE INDEX idx_pos_terminal_layout ON layout_pos_terminal(layout_id);
CREATE INDEX idx_pos_terminal_item ON layout_pos_terminal(item_id);
CREATE INDEX idx_pos_terminal_active ON layout_pos_terminal(is_active) WHERE is_active = true;
CREATE INDEX idx_pos_terminal_location_layout ON layout_pos_terminal(layout_id, location_id);
