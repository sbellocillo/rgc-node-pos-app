CREATE TABLE public.pos_terminals (
	id SERIAL PRIMARY KEY,
	location_id INTEGER REFERENCES public.location(id) ON DELETE CASCADE,
	terminal_number INTEGER NOT NULL,
	pos_serial_number VARCHAR(50),
	min_num VARCHAR(50),
	permit_num VARCHAR(50),
	permit_date_issued DATE,
	permit_valid_until DATE,
	is_active BOOLEAN DEFAULT TRUE,
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	UNIQUE(location_id, terminal_number)
);