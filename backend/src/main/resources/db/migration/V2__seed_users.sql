-- V2__seed_users.sql
-- Dev seed accounts: Admin + Staff
-- 
-- IMPORTANT: These accounts are ONLY created when SPRING_PROFILES_ACTIVE=dev
-- This prevents default privileged accounts from being created in production.
--
-- Credentials are provided through Flyway placeholders to avoid hardcoded secrets:
--   - seed_admin_username / seed_admin_password_hash
--   - seed_staff_username / seed_staff_password_hash
-- See docs/development-credentials.md for setup details.
--
-- Idempotent: re-running won't duplicate (uses ON CONFLICT).

INSERT INTO users (first_name, last_name, username, password_hash, role, is_active)
SELECT first_name, last_name, username, password_hash, role, is_active
FROM (
    SELECT
        'System' AS first_name,
        'Admin'  AS last_name,
                '${seed_admin_username}'  AS username,
                '${seed_admin_password_hash}' AS password_hash,
        'ADMIN' AS role,
        TRUE AS is_active
    UNION ALL
    SELECT
        'System' AS first_name,
        'Staff'  AS last_name,
                '${seed_staff_username}'  AS username,
                '${seed_staff_password_hash}' AS password_hash,
        'STAFF' AS role,
        TRUE AS is_active
) AS dev_seed_users
WHERE '${seed_environment}' = 'dev'
    AND NULLIF(TRIM('${seed_admin_username}'), '') IS NOT NULL
    AND NULLIF(TRIM('${seed_admin_password_hash}'), '') IS NOT NULL
    AND NULLIF(TRIM('${seed_staff_username}'), '') IS NOT NULL
    AND NULLIF(TRIM('${seed_staff_password_hash}'), '') IS NOT NULL
ON CONFLICT (username) DO NOTHING;
