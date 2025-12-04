-- Card Networks Table
-- Stores credit/debit card network types (Visa, Mastercard, Amex, etc.)

CREATE TABLE IF NOT EXISTS card_networks (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,          -- 'visa', 'mastercard', 'amex'
    name VARCHAR(50) NOT NULL,                 -- 'Visa', 'Mastercard', 'American Express'
    description TEXT,                          -- optional details about the network
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default card networks
INSERT INTO card_networks (code, name, description) VALUES
    ('visa', 'Visa', 'Visa credit and debit cards'),
    ('mastercard', 'Mastercard', 'Mastercard credit and debit cards'),
    ('amex', 'American Express', 'American Express cards'),
    ('discover', 'Discover', 'Discover credit cards'),
    ('jcb', 'JCB', 'Japan Credit Bureau cards'),
    ('unionpay', 'UnionPay', 'China UnionPay cards'),
    ('diners', 'Diners Club', 'Diners Club cards')
ON CONFLICT (code) DO NOTHING;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_card_networks_code ON card_networks(code);
