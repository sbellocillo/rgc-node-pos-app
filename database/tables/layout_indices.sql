 -- Grid Positions Table
 -- (25 static records) - position slots 1-25

CREATE TABLE IF NOT EXISTS layout_indices (
	id SERIAL PRIMARY KEY,
	grid_index INT NOT NULL UNIQUE CHECK (grid_index BETWEEN 1 AND 25),
	is_active BOOLEAN NOT NULL DEFAULT true,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_layout_indices_index ON layout_indices(grid_index);
CREATE INDEX idx_layout_indices_active ON layout_indices(is_active) WHERE is_active = true;

INSERT INTO layout_indices (grid_index, is_active) VALUES
(1, true), (2, true), (3, true), (4, true), (5, true),
(6, true), (7, true), (8, true), (9, true), (10, true),
(11, true), (12, true), (13, true), (14, true), (15, true),
(16, true), (17, true), (18, true), (19, true), (20, true),
(21, true), (22, true), (23, true), (24, true), (25, true);