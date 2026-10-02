-- Flyway Repeatable Migration: Dev / Demo Data Seeder
-- Idempotently ensures baseline users, operational machines, customers, orders, and payments exist.

-- ==========================================
-- 1. SEED ROLES & USERS (admin123)
-- ==========================================
INSERT INTO users (id, username, password_hash, role, first_name, last_name, is_active)
VALUES 
    (gen_random_uuid(), 'admin', '$2a$12$9MJM2hnl7ni3hwOSu.mNq.Kd.t4qrf3Q1QBFpTmF3OuERm2mxSAxW', 'ADMIN', 'System', 'Administrator', TRUE),
    (gen_random_uuid(), 'staff', '$2a$12$9MJM2hnl7ni3hwOSu.mNq.Kd.t4qrf3Q1QBFpTmF3OuERm2mxSAxW', 'STAFF', 'Front', 'Desk', TRUE)
ON CONFLICT (username) DO NOTHING;

-- ==========================================
-- 2. SEED CUSTOMERS
-- ==========================================
INSERT INTO customers (first_name, last_name, contact_number, is_active)
VALUES
    ('Juan', 'Dela Cruz', '09123456789', TRUE),
    ('Maria', 'Clara', '09198765432', TRUE),
    ('Jose', 'Rizal', '09223334455', TRUE),
    ('Elena', 'Santos', '09171234567', TRUE),
    ('Carlos', 'Mendoza', '09287654321', TRUE)
ON CONFLICT (last_name, first_name, contact_number) DO NOTHING;

-- ==========================================
-- 3. SEED MACHINES (Washers & Dryers)
-- ==========================================
INSERT INTO machines (id, name, status, is_active)
SELECT gen_random_uuid(), 'Speed Queen Washer 01', 'OPERATIONAL', TRUE
WHERE NOT EXISTS (SELECT 1 FROM machines WHERE name = 'Speed Queen Washer 01');

INSERT INTO machines (id, name, status, is_active)
SELECT gen_random_uuid(), 'Speed Queen Washer 02', 'OPERATIONAL', TRUE
WHERE NOT EXISTS (SELECT 1 FROM machines WHERE name = 'Speed Queen Washer 02');

INSERT INTO machines (id, name, status, is_active)
SELECT gen_random_uuid(), 'Speed Queen Washer 03', 'MAINTENANCE', TRUE
WHERE NOT EXISTS (SELECT 1 FROM machines WHERE name = 'Speed Queen Washer 03');

INSERT INTO machines (id, name, status, is_active)
SELECT gen_random_uuid(), 'Whirlpool Commercial Dryer 01', 'OPERATIONAL', TRUE
WHERE NOT EXISTS (SELECT 1 FROM machines WHERE name = 'Whirlpool Commercial Dryer 01');

INSERT INTO machines (id, name, status, is_active)
SELECT gen_random_uuid(), 'Whirlpool Commercial Dryer 02', 'OPERATIONAL', TRUE
WHERE NOT EXISTS (SELECT 1 FROM machines WHERE name = 'Whirlpool Commercial Dryer 02');

INSERT INTO machines (id, name, status, is_active)
SELECT gen_random_uuid(), 'Whirlpool Commercial Dryer 03', 'OPERATIONAL', TRUE
WHERE NOT EXISTS (SELECT 1 FROM machines WHERE name = 'Whirlpool Commercial Dryer 03');

-- ==========================================
-- 4. SEED SAMPLE ORDERS
-- ==========================================

-- Order 1: Received & Unpaid (Juan Dela Cruz)
INSERT INTO orders (
    tracking_number, customer_id, created_by_user_id, service_rate_id, 
    weight_kg, total_loads, base_price_per_load, kg_limit_per_load, price_per_extra_minute, 
    base_amount, extra_minutes_amount, addons_total_amount, grand_total, 
    current_status, payment_status, created_at, updated_at
)
SELECT 
    'LDR-20260714-0001', 
    (SELECT id FROM customers WHERE first_name = 'Juan' AND last_name = 'Dela Cruz' LIMIT 1),
    (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
    (SELECT id FROM service_rates WHERE service_name = 'Standard Wash' LIMIT 1),
    5.0, 1, 140.00, 8.00, 1.00,
    140.00, 0.00, 0.00, 140.00,
    'RECEIVED', 'UNPAID', now() - interval '2 hours', now() - interval '2 hours'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE tracking_number = 'LDR-20260714-0001');

-- Order 2: Ready for Pickup & Paid (Maria Clara)
INSERT INTO orders (
    tracking_number, customer_id, created_by_user_id, service_rate_id, 
    weight_kg, total_loads, base_price_per_load, kg_limit_per_load, price_per_extra_minute, 
    base_amount, extra_minutes_amount, addons_total_amount, grand_total, 
    current_status, payment_status, created_at, updated_at
)
SELECT 
    'LDR-20260714-0002', 
    (SELECT id FROM customers WHERE first_name = 'Maria' AND last_name = 'Clara' LIMIT 1),
    (SELECT id FROM users WHERE username = 'staff' LIMIT 1),
    (SELECT id FROM service_rates WHERE service_name = 'Blankets' LIMIT 1),
    10.0, 2, 200.00, 8.00, 1.00,
    400.00, 0.00, 0.00, 400.00,
    'READY_FOR_PICKUP', 'PAID', now() - interval '6 hours', now() - interval '1 hour'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE tracking_number = 'LDR-20260714-0002');

-- Order 3: Washing & Paid (Jose Rizal)
INSERT INTO orders (
    tracking_number, customer_id, created_by_user_id, service_rate_id, 
    weight_kg, total_loads, base_price_per_load, kg_limit_per_load, price_per_extra_minute, 
    base_amount, extra_minutes_amount, addons_total_amount, grand_total, 
    current_status, payment_status, created_at, updated_at
)
SELECT 
    'LDR-20260714-0003', 
    (SELECT id FROM customers WHERE first_name = 'Jose' AND last_name = 'Rizal' LIMIT 1),
    (SELECT id FROM users WHERE username = 'staff' LIMIT 1),
    (SELECT id FROM service_rates WHERE service_name = 'Standard Wash' LIMIT 1),
    7.5, 1, 140.00, 8.00, 1.00,
    140.00, 0.00, 0.00, 140.00,
    'WASHING', 'PAID', now() - interval '4 hours', now() - interval '30 minutes'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE tracking_number = 'LDR-20260714-0003');

-- Order 4: Drying & Unpaid (Elena Santos)
INSERT INTO orders (
    tracking_number, customer_id, created_by_user_id, service_rate_id, 
    weight_kg, total_loads, base_price_per_load, kg_limit_per_load, price_per_extra_minute, 
    base_amount, extra_minutes_amount, addons_total_amount, grand_total, 
    current_status, payment_status, created_at, updated_at
)
SELECT 
    'LDR-20260714-0004', 
    (SELECT id FROM customers WHERE first_name = 'Elena' AND last_name = 'Santos' LIMIT 1),
    (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
    (SELECT id FROM service_rates WHERE service_name = 'Blankets' LIMIT 1),
    8.0, 1, 200.00, 8.00, 1.00,
    200.00, 0.00, 0.00, 200.00,
    'DRYING', 'UNPAID', now() - interval '3 hours', now() - interval '20 minutes'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE tracking_number = 'LDR-20260714-0004');

-- Order 5: Released & Paid (Carlos Mendoza)
INSERT INTO orders (
    tracking_number, customer_id, created_by_user_id, service_rate_id, 
    weight_kg, total_loads, base_price_per_load, kg_limit_per_load, price_per_extra_minute, 
    base_amount, extra_minutes_amount, addons_total_amount, grand_total, 
    current_status, payment_status, created_at, updated_at
)
SELECT 
    'LDR-20260714-0005', 
    (SELECT id FROM customers WHERE first_name = 'Carlos' AND last_name = 'Mendoza' LIMIT 1),
    (SELECT id FROM users WHERE username = 'staff' LIMIT 1),
    (SELECT id FROM service_rates WHERE service_name = 'Standard Wash' LIMIT 1),
    6.0, 1, 140.00, 8.00, 1.00,
    140.00, 0.00, 0.00, 140.00,
    'RELEASED', 'PAID', now() - interval '1 day', now() - interval '20 hours'
WHERE NOT EXISTS (SELECT 1 FROM orders WHERE tracking_number = 'LDR-20260714-0005');

-- ==========================================
-- 5. SEED PAYMENTS FOR PAID ORDERS
-- ==========================================

INSERT INTO payments (id, order_id, amount_paid, payment_method, received_by_user_id, payment_date, remarks)
SELECT 
    gen_random_uuid(),
    o.id,
    o.grand_total,
    'CASH',
    (SELECT id FROM users WHERE username = 'staff' LIMIT 1),
    now() - interval '5 hours',
    'Paid in cash at drop-off'
FROM orders o
WHERE o.tracking_number = 'LDR-20260714-0002'
  AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.order_id = o.id);

INSERT INTO payments (id, order_id, amount_paid, payment_method, received_by_user_id, payment_date, remarks)
SELECT 
    gen_random_uuid(),
    o.id,
    o.grand_total,
    'GCASH',
    (SELECT id FROM users WHERE username = 'staff' LIMIT 1),
    now() - interval '3 hours',
    'GCash Reference #9823487192'
FROM orders o
WHERE o.tracking_number = 'LDR-20260714-0003'
  AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.order_id = o.id);

INSERT INTO payments (id, order_id, amount_paid, payment_method, received_by_user_id, payment_date, remarks)
SELECT 
    gen_random_uuid(),
    o.id,
    o.grand_total,
    'CASH',
    (SELECT id FROM users WHERE username = 'staff' LIMIT 1),
    now() - interval '23 hours',
    'Full settlement upon collection'
FROM orders o
WHERE o.tracking_number = 'LDR-20260714-0005'
  AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.order_id = o.id);
