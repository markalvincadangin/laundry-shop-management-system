-- V2__seed_users.sql
-- Dev seed accounts: Owner + Staff
-- Passwords are BCrypt hashes (NOT plaintext).
-- Idempotent: re-running won't duplicate.

INSERT INTO users (first_name, last_name, username, password_hash, role)
VALUES
    ('System', 'Owner', 'owner', '$2a$10$Jtoor/.1MMlnC4XOp73PHeuRpostP0y020g1uHx2z529cYzYoGyWa', 'Owner'),
    ('System', 'Staff', 'staff', '$2a$10$KQzQdfRL/sVB9G2d4eg8AuYE32zcFZghR2OOZXG.ibjOkyLuAMwJC', 'Staff')
ON CONFLICT (username) DO NOTHING;
