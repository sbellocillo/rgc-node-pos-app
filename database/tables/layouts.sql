 -- Grid Layouts Table
 -- Default layouts: 5 (or more as system adds categories) 
 -- Custom layouts: created per location as needed

CREATE TABLE IF NOT EXISTS layouts (
	id SERIAL PRIMARY KEY,
	name VARCHAR(50) NOT NULL UNIQUE,
	item_type_id INT NOT NULL,
	is_default BOOLEAN NOT NULL DEFAULT false,
	is_active BOOLEAN NOT NULL DEFAULT true,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_layouts_item_type
		FOREIGN KEY (item_type_id)
		REFERENCES item_type(id)
		ON DELETE RESTRICT
		ON UPDATE CASCADE
);

CREATE INDEX idx_layouts_item_type ON layouts(item_type_id);
CREATE INDEX idx_layouts_default ON layouts(is_default) WHERE is_default = true;
CREATE INDEX idx_layouts_active ON layouts(is_active) WHERE is_active = true;