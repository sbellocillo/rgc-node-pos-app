-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id), -- Staff/user who processed the order
    customer_id INTEGER REFERENCES customers(id), -- Customer who placed the order
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    memo TEXT, -- Order notes, special instructions, or comments
    shipping_address VARCHAR(500),
    billing_address VARCHAR(500),
    status_id INTEGER REFERENCES status(id),
    order_type_id INTEGER REFERENCES order_type(id),
    subtotal DECIMAL(10,2) NOT NULL,
    tax_percentage DECIMAL(5,4) DEFAULT 0.1200, -- Default 12% tax rate
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    location_id INTEGER REFERENCES location(id),
    payment_method_id INTEGER REFERENCES paymentmethod(id),
    card_network_id INTEGER REFERENCES card_networks(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id)
);

-- 1. Create Index (Matches your WHERE clause perfectly for speed)
CREATE INDEX IF NOT EXISTS idx_orders_pos_lookup
ON public.orders (location_id, pos_terminal_number);

-- 2. Create Function
CREATE OR REPLACE FUNCTION set_location_order_number()
RETURNS TRIGGER AS $$
DECLARE
    next_order INTEGER;
    lock_key TEXT;
BEGIN
    -- Logic: Create unique lock key like "order_seq_15_1"
    -- This ensures POS 1 never blocks POS 2
    lock_key := 'order_seq_' || NEW.location_id::text || '_' || NEW.pos_terminal_number::text;
    
    -- Pause only if another transaction is writing to THIS exact POS at the same microsecond
    PERFORM pg_advisory_xact_lock(hashtext(lock_key));

    -- Count existing orders for this specific POS terminal
    SELECT COALESCE(MAX(order_number), 0) + 1
    INTO next_order
    FROM public.orders
    WHERE location_id = NEW.location_id
      AND pos_terminal_number = NEW.pos_terminal_number;

    NEW.order_number := next_order;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create Trigger
DROP TRIGGER IF EXISTS trigger_set_order_number ON public.orders;

CREATE TRIGGER trigger_set_order_number
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION set_location_order_number();

-- 1. Add the column to store the device's UUID
ALTER TABLE public.orders 
ADD COLUMN offline_uuid VARCHAR(36);

-- 2. Make it UNIQUE (Critical for preventing duplicate orders during sync)
ALTER TABLE public.orders 
ADD CONSTRAINT uq_orders_offline_uuid UNIQUE (offline_uuid);

-- 3. Add an index so the sync check is fast
CREATE INDEX idx_orders_offline_uuid ON public.orders(offline_uuid);