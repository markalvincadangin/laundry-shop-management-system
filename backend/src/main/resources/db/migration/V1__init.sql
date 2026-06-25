-- V1__init.sql — Faith Laundry Shop Database Schema (Standardized for JPA Compatibility)
-- Using VARCHAR instead of custom ENUMs for seamless Spring Boot integration

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==========================================
-- 0. SHARED FUNCTIONS & AUDIT INFRASTRUCTURE
-- ==========================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Unified audit_logs table for forensic auditing (Strategic Shift)
CREATE TABLE IF NOT EXISTS audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    user_id     VARCHAR(255),        -- Captured from SET LOCAL app.current_user_id
    action_type VARCHAR(50) NOT NULL, -- INSERT, UPDATE, DELETE, ORDER_STATUS_UPDATE, etc.
    table_name  VARCHAR(100) NOT NULL,
    record_id   VARCHAR(255) NOT NULL,
    old_data    JSONB,               -- Snapshot before change
    new_data    JSONB,               -- Snapshot after change
    ip_address  VARCHAR(45),
    user_agent  TEXT,
    status      VARCHAR(20),         -- SUCCESS, FAILURE
    method_name VARCHAR(255),
    description TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Generic audit function for all tables
CREATE OR REPLACE FUNCTION fn_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id TEXT;
BEGIN
    -- Get user_id from session variable (set by Spring Boot AOP)
    v_user_id := current_setting('app.current_user_id', true);

    IF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (user_id, action_type, table_name, record_id, new_data)
        VALUES (v_user_id, 'INSERT', TG_TABLE_NAME, (to_jsonb(NEW)->>'id'), to_jsonb(NEW));
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (user_id, action_type, table_name, record_id, old_data, new_data)
        VALUES (v_user_id, 'UPDATE', TG_TABLE_NAME, (to_jsonb(NEW)->>'id'), to_jsonb(OLD), to_jsonb(NEW));
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (user_id, action_type, table_name, record_id, old_data)
        VALUES (v_user_id, 'DELETE', TG_TABLE_NAME, (to_jsonb(OLD)->>'id'), to_jsonb(OLD));
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 1. CORE TABLES
-- ==========================================

-- Configuration: Service Rates
CREATE TABLE IF NOT EXISTS service_rates (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    base_price_per_load DECIMAL(10,2) NOT NULL,
    kg_limit_per_load DECIMAL(5,2) NOT NULL,
    price_per_extra_minute DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_service_rates_service_name UNIQUE (service_name)
);

-- Users
CREATE TABLE IF NOT EXISTS users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR NOT NULL,
    role          VARCHAR(30) NOT NULL DEFAULT 'STAFF',
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMP NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP NOT NULL DEFAULT now()
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
    id             BIGSERIAL PRIMARY KEY,
    first_name     VARCHAR(100) NOT NULL,
    last_name      VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP NOT NULL DEFAULT now(),
    updated_at     TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_customers_identity UNIQUE (last_name, first_name, contact_number),
    CONSTRAINT ck_customer_contact_format CHECK (contact_number ~ '^\+?[0-9\s\-]{7,15}$')
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id                 BIGSERIAL PRIMARY KEY,
    reference_number   VARCHAR(30) NOT NULL UNIQUE,
    customer_id        BIGINT NOT NULL REFERENCES customers(id),
    created_by_user_id UUID NOT NULL REFERENCES users(id),
    service_rate_id    INT NOT NULL REFERENCES service_rates(id),
    weight_kg          DECIMAL(10,2) NOT NULL,
    total_loads        INT NOT NULL,
    base_price_per_load    DECIMAL(10,2) NOT NULL,
    kg_limit_per_load      DECIMAL(5,2)  NOT NULL,
    price_per_extra_minute DECIMAL(10,2) NOT NULL,
    extra_minutes         INT NOT NULL DEFAULT 0,
    base_amount           DECIMAL(10,2) NOT NULL,
    extra_minutes_amount  DECIMAL(10,2) NOT NULL,
    addons_total_amount   DECIMAL(10,2) NOT NULL DEFAULT 0,
    grand_total           DECIMAL(10,2) NOT NULL,
    current_status     VARCHAR(30) NOT NULL DEFAULT 'RECEIVED',
    payment_status     VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
    notes              VARCHAR(500),
    created_at         TIMESTAMP NOT NULL DEFAULT now(),
    updated_at         TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT ck_order_reference_format CHECK (reference_number ~ '^LDR-[0-9]{8}-[0-9]{4}$'),
    CONSTRAINT ck_order_weight_positive CHECK (weight_kg > 0),
    CONSTRAINT ck_order_loads_positive CHECK (total_loads > 0),
    CONSTRAINT ck_order_total_non_negative CHECK (grand_total >= 0)
);

CREATE INDEX idx_orders_customer_created ON orders(customer_id, created_at DESC);
CREATE INDEX idx_orders_status ON orders(current_status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);

-- Order Add-ons
CREATE TABLE IF NOT EXISTS order_add_ons (
    id       BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    name     VARCHAR(100) NOT NULL,
    price    DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    CONSTRAINT ck_addon_quantity_positive CHECK (quantity > 0),
    CONSTRAINT ck_addon_price_non_negative CHECK (price >= 0)
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id                  BIGSERIAL PRIMARY KEY,
    order_id            BIGINT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    amount_paid         DECIMAL(10,2) NOT NULL,
    payment_method      VARCHAR(30) NOT NULL DEFAULT 'CASH',
    received_by_user_id UUID NOT NULL REFERENCES users(id),
    payment_date        TIMESTAMP NOT NULL DEFAULT now(),
    remarks             TEXT,
    payment_reference   VARCHAR(100),
    CONSTRAINT ck_payment_amount_positive CHECK (amount_paid > 0)
);

CREATE INDEX idx_payments_date ON payments(payment_date);

-- Client Alerts (Audit Log of customer communications)
CREATE TABLE IF NOT EXISTS client_alerts (
    id          BIGSERIAL PRIMARY KEY,
    order_id    BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    channel     VARCHAR(30) NOT NULL DEFAULT 'SMS',
    message     TEXT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    sent_at     TIMESTAMP,
    status      VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    is_read     BOOLEAN NOT NULL DEFAULT FALSE
);

-- ==========================================
-- 2. TRIGGERS
-- ==========================================

-- Timestamp Triggers
CREATE TRIGGER trg_service_rates_updated_at BEFORE UPDATE ON service_rates FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Audit Triggers (Strategic Forensic Logging)
CREATE TRIGGER trg_audit_log_orders AFTER INSERT OR UPDATE OR DELETE ON orders FOR EACH ROW EXECUTE FUNCTION fn_audit_log();
CREATE TRIGGER trg_audit_log_payments AFTER INSERT OR UPDATE OR DELETE ON payments FOR EACH ROW EXECUTE FUNCTION fn_audit_log();
CREATE TRIGGER trg_audit_log_service_rates AFTER INSERT OR UPDATE OR DELETE ON service_rates FOR EACH ROW EXECUTE FUNCTION fn_audit_log();
CREATE TRIGGER trg_audit_log_customers AFTER INSERT OR UPDATE OR DELETE ON customers FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

-- ==========================================
-- 3. SEED DATA
-- ==========================================

INSERT INTO service_rates (
    service_name,
    base_price_per_load,
    kg_limit_per_load,
    price_per_extra_minute,
    is_active
) VALUES (
    'Standard Wash',
    140.00,
    8.00,
    1.00,
    TRUE
),
(
    'Rush Wash',
    160.00,
    8.00,
    1.50,
    TRUE
),
(
    'Blankets',
    200.00,
    8.00,
    1.00,
    TRUE
)
ON CONFLICT (service_name) DO NOTHING;