-- V2__seed_users.sql
-- Dev seed accounts: Owner + Staff
-- 
-- IMPORTANT: These accounts are ONLY created when SPRING_PROFILES_ACTIVE=dev
-- This prevents default privileged accounts from being created in production.
--
-- Plaintext passwords (for development/testing only):
--   - Username: 'owner' | Password: 'owner123'
--   - Username: 'staff' | Password: 'staff123'
--
-- The password hashes below are BCrypt hashes of the plaintext passwords above.
-- For detailed documentation, see: docs/development-credentials.md
--
-- Idempotent: re-running won't duplicate (uses ON CONFLICT).

INSERT INTO users (first_name, last_name, username, password_hash, role)
SELECT first_name, last_name, username, password_hash, role
FROM (
    SELECT
        'System' AS first_name,
        'Owner'  AS last_name,
        'owner'  AS username,
        '$2a$10$Jtoor/.1MMlnC4XOp73PHeuRpostP0y020g1uHx2z529cYzYoGyWa' AS password_hash,
        'Owner' AS role
    UNION ALL
    SELECT
        'System' AS first_name,
        'Staff'  AS last_name,
        'staff'  AS username,
        '$2a$10$KQzQdfRL/sVB9G2d4eg8AuYE32zcFZghR2OOZXG.ibjOkyLuAMwJC' AS password_hash,
        'Staff' AS role
) AS dev_seed_users
WHERE '${seed_environment}' = 'dev'
ON CONFLICT (username) DO NOTHING;
