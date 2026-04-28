-- Enable pgcrypto extension for UUID generation (gen_random_uuid())
-- Required by users table and application schema
CREATE EXTENSION IF NOT EXISTS pgcrypto;
