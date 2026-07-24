-- Seed baseline static data specifically for E2E testing
-- This ensures a known good starting state for tests without bleeding data between runs

-- 1. Create a known staff account (password: Password123!)
INSERT INTO users (id, username, password, role, is_active)
VALUES 
  ('usr_test_staff1', 'teststaff', '$2a$12$Z2T/x43tI4nQ/bE0s59Rz.N4Bv0vVv/vVv/vVv/vVv/vVv/vVv/vW', 'STAFF', true),
  ('usr_test_admin1', 'testadmin', '$2a$12$Z2T/x43tI4nQ/bE0s59Rz.N4Bv0vVv/vVv/vVv/vVv/vVv/vVv/vW', 'ADMIN', true)
ON CONFLICT (username) DO NOTHING;

-- 2. Seed standard base pricing
INSERT INTO system_settings (key, value, description)
VALUES 
  ('BASE_RATE', '140', 'Standard base rate per load'),
  ('EXTRA_WASH_RATE', '1', 'Rate per extra minute of washing')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 3. Seed small known machine inventory (well under the 50 cap)
INSERT INTO machines (id, type, status, name)
VALUES
  ('mac_test_w1', 'WASHER', 'AVAILABLE', 'Test Washer 1'),
  ('mac_test_w2', 'WASHER', 'AVAILABLE', 'Test Washer 2'),
  ('mac_test_w3', 'WASHER', 'AVAILABLE', 'Test Washer 3'),
  ('mac_test_d1', 'DRYER', 'AVAILABLE', 'Test Dryer 1'),
  ('mac_test_d2', 'DRYER', 'AVAILABLE', 'Test Dryer 2')
ON CONFLICT (id) DO NOTHING;
