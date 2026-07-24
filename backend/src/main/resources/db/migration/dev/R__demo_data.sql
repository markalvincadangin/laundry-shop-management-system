-- Flyway Repeatable Migration: Dev Demo Data
-- This runs on every startup in the 'dev' profile and safely inserts demo data.

-- 1. SEED USERS
INSERT INTO users (id, username, password_hash, role, first_name, last_name, is_active)
VALUES 
    (gen_random_uuid(), 'admin', '$2a$12$9MJM2hnl7ni3hwOSu.mNq.Kd.t4qrf3Q1QBFpTmF3OuERm2mxSAxW', 'ADMIN', 'System', 'Administrator', TRUE),
    (gen_random_uuid(), 'staff', '$2a$12$9MJM2hnl7ni3hwOSu.mNq.Kd.t4qrf3Q1QBFpTmF3OuERm2mxSAxW', 'STAFF', 'Front', 'Desk', TRUE)
ON CONFLICT (username) DO NOTHING;

-- 2. SEED CUSTOMERS
INSERT INTO customers (first_name, last_name, contact_number, is_active)
VALUES
    ('Juan', 'Dela Cruz', '09123456789', TRUE),
    ('Maria', 'Clara', '09198765432', TRUE),
    ('Jose', 'Rizal', '09223334455', TRUE)
ON CONFLICT (last_name, first_name, contact_number) DO NOTHING;

-- 3. SEED DUMMY ORDERS
-- Note: Replaces the 40 random orders from the deprecated DemoDataSeeder.
-- 1 order per customer for demonstration purposes.

INSERT INTO orders (
    tracking_number, customer_id, created_by_user_id, service_rate_id, 
    weight_kg, total_loads, base_price_per_load, kg_limit_per_load, price_per_extra_minute, 
    base_amount, extra_minutes_amount, addons_total_amount, grand_total, 
    current_status, payment_status
)
SELECT 
    'LDR-20260714-0001', 
    (SELECT id FROM customers WHERE first_name = 'Juan' AND last_name = 'Dela Cruz' LIMIT 1),
    '00000000-0000-0000-0000-000000000002'::uuid,
    (SELECT id FROM service_rates WHERE service_name = 'Standard Wash' LIMIT 1),
    5.0, 1, 140.00, 8.00, 1.00,
    140.00, 0.00, 0.00, 140.00,
    'RECEIVED', 'UNPAID'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE tracking_number = 'LDR-20260714-0001');

INSERT INTO orders (
    tracking_number, customer_id, created_by_user_id, service_rate_id, 
    weight_kg, total_loads, base_price_per_load, kg_limit_per_load, price_per_extra_minute, 
    base_amount, extra_minutes_amount, addons_total_amount, grand_total, 
    current_status, payment_status
)
SELECT 
    'LDR-20260714-0002', 
    (SELECT id FROM customers WHERE first_name = 'Maria' AND last_name = 'Clara' LIMIT 1),
    '00000000-0000-0000-0000-000000000001'::uuid,
    (SELECT id FROM service_rates WHERE service_name = 'Blankets' LIMIT 1),
    10.0, 2, 200.00, 8.00, 1.00,
    400.00, 0.00, 0.00, 400.00,
    'READY_FOR_PICKUP', 'PAID'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE tracking_number = 'LDR-20260714-0002');
