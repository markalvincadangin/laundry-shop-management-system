-- V1__init.sql — Faith Laundry Shop Database Schema (Standardized for JPA Compatibility)
-- Squashed migration of all core tables, machines, settings, and standardized audit triggers.

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

-- Unified audit_logs table for forensic auditing (Standardized)
CREATE TABLE IF NOT EXISTS audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     VARCHAR(255),
    action_type VARCHAR(50) NOT NULL,
    table_name  VARCHAR(100) NOT NULL,
    record_id   VARCHAR(255) NOT NULL,
    old_data    JSONB,
    new_data    JSONB,
    ip_address  VARCHAR(45),
    user_agent  TEXT,
    status      VARCHAR(20),
    method_name VARCHAR(255),
    description TEXT,
    created_at  TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_module_action ON audit_logs(table_name, action_type);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);

-- Immutability Trigger
CREATE OR REPLACE FUNCTION fn_prevent_audit_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable and cannot be altered or deleted.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_audit_tampering
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION fn_prevent_audit_tampering();

-- Enforce Principle of Least Privilege
REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM public;

-- Generic audit function for all tables
CREATE OR REPLACE FUNCTION fn_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id TEXT;
    v_ip_address TEXT;
    v_user_agent TEXT;
    v_old_data JSONB;
    v_new_data JSONB;
BEGIN
    -- Get context from session variable (set by Spring Boot AOP)
    v_user_id := current_setting('app.current_user_id', true);
    v_ip_address := current_setting('app.client_ip', true);
    v_user_agent := current_setting('app.user_agent', true);
    
    -- Fallback for system tasks
    IF v_user_id IS NULL OR v_user_id = '' THEN
        v_user_id := 'SYSTEM';
    END IF;

    -- Initialize payloads
    IF TG_OP = 'DELETE' THEN
        v_old_data := to_jsonb(OLD);
    ELSIF TG_OP = 'UPDATE' THEN
        v_old_data := to_jsonb(OLD);
        v_new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'INSERT' THEN
        v_new_data := to_jsonb(NEW);
    END IF;

    -- Data Redaction for sensitive tables
    IF TG_TABLE_NAME = 'users' THEN
        IF v_old_data IS NOT NULL THEN
            v_old_data := v_old_data - 'password' - 'password_hash';
        END IF;
        IF v_new_data IS NOT NULL THEN
            v_new_data := v_new_data - 'password' - 'password_hash';
        END IF;
    END IF;

    -- Insert Record
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (user_id, ip_address, user_agent, action_type, table_name, record_id, new_data)
        VALUES (v_user_id, v_ip_address, v_user_agent, 'INSERT', TG_TABLE_NAME, (to_jsonb(NEW)->>'id'), v_new_data);
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (user_id, ip_address, user_agent, action_type, table_name, record_id, old_data, new_data)
        VALUES (v_user_id, v_ip_address, v_user_agent, 'UPDATE', TG_TABLE_NAME, (to_jsonb(NEW)->>'id'), v_old_data, v_new_data);
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (user_id, ip_address, user_agent, action_type, table_name, record_id, old_data)
        VALUES (v_user_id, v_ip_address, v_user_agent, 'DELETE', TG_TABLE_NAME, (to_jsonb(OLD)->>'id'), v_old_data);
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- 1. CORE TABLES
-- ==========================================

-- Configuration: Service Rates
CREATE TABLE IF NOT EXISTS service_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number   VARCHAR(30) NOT NULL UNIQUE,
    customer_id        UUID NOT NULL REFERENCES customers(id),
    created_by_user_id UUID NOT NULL REFERENCES users(id),
    service_rate_id    UUID NOT NULL REFERENCES service_rates(id),
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
    is_rush            BOOLEAN NOT NULL DEFAULT FALSE,
    notes              VARCHAR(500),
    created_at         TIMESTAMP NOT NULL DEFAULT now(),
    updated_at         TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT ck_order_tracking_format CHECK (tracking_number ~ '^LDR-[0-9]{8}-[0-9]{4}$'),
    CONSTRAINT ck_order_weight_positive CHECK (weight_kg > 0),
    CONSTRAINT ck_order_loads_positive CHECK (total_loads > 0),
    CONSTRAINT ck_order_total_non_negative CHECK (grand_total >= 0)
);

CREATE INDEX idx_orders_customer_created ON orders(customer_id, created_at DESC);
CREATE INDEX idx_orders_status ON orders(current_status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);

-- Add-On Catalog
CREATE TABLE IF NOT EXISTS add_on_catalog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    default_price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT uq_addon_catalog_name UNIQUE (name)
);

-- Order Add-ons
CREATE TABLE IF NOT EXISTS order_add_ons (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    add_on_catalog_id UUID REFERENCES add_on_catalog(id) ON DELETE SET NULL,
    name     VARCHAR(100) NOT NULL,
    price    DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    CONSTRAINT ck_addon_quantity_positive CHECK (quantity > 0),
    CONSTRAINT ck_addon_price_non_negative CHECK (price >= 0)
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id            UUID NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
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
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    channel     VARCHAR(30) NOT NULL DEFAULT 'SMS',
    message     TEXT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    sent_at     TIMESTAMP,
    status      VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    is_read     BOOLEAN NOT NULL DEFAULT FALSE
);

-- Machines
CREATE TABLE IF NOT EXISTS machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL, -- OPERATIONAL, MAINTENANCE, BROKEN
    is_active BOOLEAN NOT NULL DEFAULT true, -- For soft deletes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_machines (
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    PRIMARY KEY (order_id, machine_id)
);

-- System Settings
CREATE TABLE IF NOT EXISTS system_settings (
    id BIGINT PRIMARY KEY CHECK (id = 1),
    is_system_paused BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- ==========================================
-- 2. TRIGGERS
-- ==========================================

-- Timestamp Triggers
CREATE TRIGGER trg_service_rates_updated_at BEFORE UPDATE ON service_rates FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_machines_updated_at BEFORE UPDATE ON machines FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_add_on_catalog_updated_at BEFORE UPDATE ON add_on_catalog FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Audit Triggers (Strategic Forensic Logging)
CREATE TRIGGER trg_audit_log_orders AFTER INSERT OR UPDATE OR DELETE ON orders FOR EACH ROW EXECUTE FUNCTION fn_audit_log();
CREATE TRIGGER trg_audit_log_payments AFTER INSERT OR UPDATE OR DELETE ON payments FOR EACH ROW EXECUTE FUNCTION fn_audit_log();
CREATE TRIGGER trg_audit_log_service_rates AFTER INSERT OR UPDATE OR DELETE ON service_rates FOR EACH ROW EXECUTE FUNCTION fn_audit_log();
CREATE TRIGGER trg_audit_log_customers AFTER INSERT OR UPDATE OR DELETE ON customers FOR EACH ROW EXECUTE FUNCTION fn_audit_log();
CREATE TRIGGER trg_audit_log_machines AFTER INSERT OR UPDATE OR DELETE ON machines FOR EACH ROW EXECUTE FUNCTION fn_audit_log();
CREATE TRIGGER trg_audit_log_system_settings AFTER INSERT OR UPDATE OR DELETE ON system_settings FOR EACH ROW EXECUTE FUNCTION fn_audit_log();
CREATE TRIGGER trg_audit_log_add_on_catalog AFTER INSERT OR UPDATE OR DELETE ON add_on_catalog FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

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
    'Blankets',
    200.00,
    8.00,
    1.00,
    TRUE
)
ON CONFLICT (service_name) DO NOTHING;

-- Seed Add-On Catalog
INSERT INTO add_on_catalog (name, default_price, is_active) VALUES 
('Rush Fee', 50.00, TRUE),
('Fabric Conditioner', 15.00, TRUE)
ON CONFLICT (name) DO NOTHING;

-- Initialize the single SystemSettings row
INSERT INTO system_settings (id, is_system_paused, updated_at) VALUES (1, FALSE, CURRENT_TIMESTAMP) ON CONFLICT (id) DO NOTHING;

-- Seed Initial Admin Account (Single initial admin account; Admin creates staff accounts)
-- Default Credentials: username = admin, password = admin123
INSERT INTO users (id, username, password_hash, role, first_name, last_name, is_active)
VALUES (
    gen_random_uuid(),
    'admin',
    '$2a$12$9MJM2hnl7ni3hwOSu.mNq.Kd.t4qrf3Q1QBFpTmF3OuERm2mxSAxW',
    'ADMIN',
    'System',
    'Administrator',
    TRUE
)
ON CONFLICT (username) DO NOTHING;
