-- =====================================================
-- Financial Profiler Application Database Schema
-- =====================================================
-- Description: Database schema for client-centric financial 
--              profiling and transaction tracking system
-- Timestamp: WITHOUT TIME ZONE
-- Table Prefix: profiler_
-- Schema: staging (configurable)
-- =====================================================

-- =====================================================
-- SCHEMA CONFIGURATION
-- =====================================================
-- Change 'staging' to your desired schema name (e.g., 'public', 'production', etc.)
-- =====================================================

-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS staging;
CREATE SCHEMA IF NOT EXISTS production;

-- Set search path to use the schema
SET search_path TO staging;

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS profiler_transactions CASCADE;
DROP TABLE IF EXISTS profiler_profiles CASCADE;
DROP TABLE IF EXISTS profiler_banks CASCADE;
DROP TABLE IF EXISTS profiler_clients CASCADE;

-- Drop existing types if they exist
DROP TYPE IF EXISTS profiler_transaction_type CASCADE;
DROP TYPE IF EXISTS profiler_profile_status CASCADE;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS profiler_update_timestamp() CASCADE;
DROP FUNCTION IF EXISTS profiler_update_balance_on_transaction() CASCADE;
DROP FUNCTION IF EXISTS profiler_revert_balance_on_transaction_delete() CASCADE;
DROP FUNCTION IF EXISTS profiler_initialize_profile_balance() CASCADE;

-- =====================================================
-- CREATE CUSTOM TYPES
-- =====================================================

-- Transaction type enum
CREATE TYPE profiler_transaction_type AS ENUM ('deposit', 'withdraw');

-- Profile status enum
CREATE TYPE profiler_profile_status AS ENUM ('active', 'done');

-- =====================================================
-- TABLE: profiler_clients
-- =====================================================
-- Description: Stores client information
-- =====================================================

CREATE TABLE profiler_clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    mobile_number VARCHAR(20),
    aadhaar_card_number VARCHAR(12),
    aadhaar_card_image TEXT,
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraints
    CONSTRAINT profiler_clients_email_check CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT profiler_clients_mobile_check CHECK (mobile_number IS NULL OR LENGTH(mobile_number) >= 10),
    CONSTRAINT profiler_clients_aadhaar_check CHECK (aadhaar_card_number IS NULL OR LENGTH(aadhaar_card_number) = 12)
);

-- Indexes for profiler_clients
CREATE INDEX idx_profiler_clients_name ON profiler_clients(name);
CREATE INDEX idx_profiler_clients_email ON profiler_clients(email);
CREATE INDEX idx_profiler_clients_mobile ON profiler_clients(mobile_number);
CREATE INDEX idx_profiler_clients_aadhaar ON profiler_clients(aadhaar_card_number);
CREATE INDEX idx_profiler_clients_created_at ON profiler_clients(created_at DESC);

-- =====================================================
-- TABLE: profiler_banks
-- =====================================================
-- Description: Stores credit card bank information
-- =====================================================

CREATE TABLE profiler_banks (
    id SERIAL PRIMARY KEY,
    bank_name VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Constraints
    CONSTRAINT profiler_banks_name_not_empty CHECK (LENGTH(TRIM(bank_name)) > 0)
);

-- Indexes for profiler_banks
CREATE INDEX idx_profiler_banks_name ON profiler_banks(bank_name);
CREATE INDEX idx_profiler_banks_created_at ON profiler_banks(created_at DESC);

-- =====================================================
-- TABLE: profiler_profiles
-- =====================================================
-- Description: Stores client financial profiles
-- =====================================================

CREATE TABLE profiler_profiles (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL,
    bank_id INTEGER NOT NULL,
    credit_card_number VARCHAR(20) NOT NULL,
    pre_planned_deposit_amount NUMERIC(15, 2) NOT NULL,
    current_balance NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    total_withdrawn_amount NUMERIC(15, 2) DEFAULT 0 NOT NULL,
    carry_forward_enabled BOOLEAN DEFAULT false NOT NULL,
    status profiler_profile_status DEFAULT 'active' NOT NULL,
    notes TEXT,
    marked_done_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_profiler_profiles_client 
        FOREIGN KEY (client_id) 
        REFERENCES profiler_clients(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    
    CONSTRAINT fk_profiler_profiles_bank 
        FOREIGN KEY (bank_id) 
        REFERENCES profiler_banks(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    
    -- Constraints
    CONSTRAINT profiler_profiles_deposit_positive CHECK (pre_planned_deposit_amount > 0),
    CONSTRAINT profiler_profiles_card_not_empty CHECK (LENGTH(TRIM(credit_card_number)) > 0),
    CONSTRAINT profiler_profiles_marked_done_check CHECK (
        (status = 'done' AND marked_done_at IS NOT NULL) OR 
        (status = 'active' AND marked_done_at IS NULL)
    )
);

-- Indexes for profiler_profiles
CREATE INDEX idx_profiler_profiles_client_id ON profiler_profiles(client_id);
CREATE INDEX idx_profiler_profiles_bank_id ON profiler_profiles(bank_id);
CREATE INDEX idx_profiler_profiles_status ON profiler_profiles(status);
CREATE INDEX idx_profiler_profiles_balance ON profiler_profiles(current_balance);
CREATE INDEX idx_profiler_profiles_created_at ON profiler_profiles(created_at DESC);
CREATE INDEX idx_profiler_profiles_active_positive ON profiler_profiles(status, current_balance) 
    WHERE status = 'active' AND current_balance > 0;

-- =====================================================
-- TABLE: profiler_transactions
-- =====================================================
-- Description: Stores deposit and withdrawal transactions
-- =====================================================

CREATE TABLE profiler_transactions (
    id SERIAL PRIMARY KEY,
    profile_id INTEGER NOT NULL,
    transaction_type profiler_transaction_type NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    withdraw_charges_percentage NUMERIC(5, 2),
    withdraw_charges_amount NUMERIC(15, 2),
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Foreign Keys
    CONSTRAINT fk_profiler_transactions_profile 
        FOREIGN KEY (profile_id) 
        REFERENCES profiler_profiles(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE,
    
    -- Constraints
    CONSTRAINT profiler_transactions_amount_positive CHECK (amount > 0),
    CONSTRAINT profiler_transactions_charges_valid CHECK (
        (transaction_type = 'withdraw' AND withdraw_charges_percentage >= 0) OR 
        (transaction_type = 'deposit' AND withdraw_charges_percentage IS NULL)
    ),
    CONSTRAINT profiler_transactions_charges_amount_valid CHECK (
        (transaction_type = 'withdraw' AND withdraw_charges_amount >= 0) OR 
        (transaction_type = 'deposit' AND withdraw_charges_amount IS NULL)
    )
);

-- Indexes for profiler_transactions
CREATE INDEX idx_profiler_transactions_profile_id ON profiler_transactions(profile_id);
CREATE INDEX idx_profiler_transactions_type ON profiler_transactions(transaction_type);
CREATE INDEX idx_profiler_transactions_created_at ON profiler_transactions(created_at DESC);
CREATE INDEX idx_profiler_transactions_profile_date ON profiler_transactions(profile_id, created_at DESC);

-- =====================================================
-- TRIGGER FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION profiler_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update profile balance on transaction insert
CREATE OR REPLACE FUNCTION profiler_update_balance_on_transaction()
RETURNS TRIGGER AS $$
DECLARE
    total_withdrawal NUMERIC(15, 2);
BEGIN
    IF NEW.transaction_type = 'deposit' THEN
        -- Deposit: deduct from current balance
        UPDATE profiler_profiles 
        SET current_balance = current_balance - NEW.amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.profile_id;
    ELSIF NEW.transaction_type = 'withdraw' THEN
        -- Withdraw: add to total withdrawn amount (amount + charges)
        total_withdrawal := NEW.amount + COALESCE(NEW.withdraw_charges_amount, 0);
        UPDATE profiler_profiles 
        SET total_withdrawn_amount = total_withdrawn_amount + total_withdrawal,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.profile_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to revert balance on transaction delete
CREATE OR REPLACE FUNCTION profiler_revert_balance_on_transaction_delete()
RETURNS TRIGGER AS $$
DECLARE
    total_withdrawal NUMERIC(15, 2);
BEGIN
    IF OLD.transaction_type = 'deposit' THEN
        -- Revert deposit: add back to balance
        UPDATE profiler_profiles 
        SET current_balance = current_balance + OLD.amount,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.profile_id;
    ELSIF OLD.transaction_type = 'withdraw' THEN
        -- Revert withdraw: subtract from total withdrawn amount
        total_withdrawal := OLD.amount + COALESCE(OLD.withdraw_charges_amount, 0);
        UPDATE profiler_profiles 
        SET total_withdrawn_amount = total_withdrawn_amount - total_withdrawal,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.profile_id;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Function to initialize profile balance from pre-planned amount
CREATE OR REPLACE FUNCTION profiler_initialize_profile_balance()
RETURNS TRIGGER AS $$
BEGIN
    NEW.current_balance = NEW.pre_planned_deposit_amount;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Triggers for updated_at timestamp
CREATE TRIGGER trigger_profiler_clients_updated_at
    BEFORE UPDATE ON profiler_clients
    FOR EACH ROW
    EXECUTE FUNCTION profiler_update_timestamp();

CREATE TRIGGER trigger_profiler_banks_updated_at
    BEFORE UPDATE ON profiler_banks
    FOR EACH ROW
    EXECUTE FUNCTION profiler_update_timestamp();

CREATE TRIGGER trigger_profiler_profiles_updated_at
    BEFORE UPDATE ON profiler_profiles
    FOR EACH ROW
    EXECUTE FUNCTION profiler_update_timestamp();

CREATE TRIGGER trigger_profiler_transactions_updated_at
    BEFORE UPDATE ON profiler_transactions
    FOR EACH ROW
    EXECUTE FUNCTION profiler_update_timestamp();

-- Trigger to initialize profile balance on creation
CREATE TRIGGER trigger_profiler_initialize_balance
    BEFORE INSERT ON profiler_profiles
    FOR EACH ROW
    EXECUTE FUNCTION profiler_initialize_profile_balance();

-- Trigger to update profile balance on transaction
CREATE TRIGGER trigger_profiler_update_balance
    AFTER INSERT ON profiler_transactions
    FOR EACH ROW
    EXECUTE FUNCTION profiler_update_balance_on_transaction();

-- Trigger to revert balance on transaction deletion
CREATE TRIGGER trigger_profiler_revert_balance
    BEFORE DELETE ON profiler_transactions
    FOR EACH ROW
    EXECUTE FUNCTION profiler_revert_balance_on_transaction_delete();

-- =====================================================
-- SAMPLE DATA (OPTIONAL - UNCOMMENT TO USE)
-- =====================================================

-- Insert sample banks
-- INSERT INTO profiler_banks (bank_name) VALUES
-- ('HDFC Bank'),
-- ('ICICI Bank'),
-- ('State Bank of India'),
-- ('Axis Bank'),
-- ('Kotak Mahindra Bank');

-- Insert sample clients
-- INSERT INTO profiler_clients (name, email, mobile_number, aadhaar_card_number, notes) VALUES
-- ('John Doe', 'john.doe@example.com', '9876543210', '123456789012', 'Premium client'),
-- ('Jane Smith', 'jane.smith@example.com', '9876543211', '123456789013', 'Regular client');

-- =====================================================
-- USEFUL QUERIES
-- =====================================================

-- View active profiles with positive balance (Dashboard view)
-- SELECT 
--     p.id,
--     c.name AS client_name,
--     b.bank_name,
--     p.credit_card_number,
--     p.current_balance,
--     p.total_withdrawn_amount,
--     p.pre_planned_deposit_amount,
--     (p.current_balance - p.total_withdrawn_amount) AS remaining_balance,
--     p.created_at
-- FROM profiler_profiles p
-- JOIN profiler_clients c ON p.client_id = c.id
-- JOIN profiler_banks b ON p.bank_id = b.id
-- WHERE p.status = 'active' AND p.current_balance > 0
-- ORDER BY p.created_at DESC;

-- View profile transaction history
-- SELECT 
--     t.id,
--     t.transaction_type,
--     t.amount,
--     t.withdraw_charges_percentage,
--     t.withdraw_charges_amount,
--     t.notes,
--     t.created_at
-- FROM profiler_transactions t
-- WHERE t.profile_id = 1
-- ORDER BY t.created_at DESC;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
