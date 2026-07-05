-- V4__audit_http_context.sql — HTTP Context, Data Redaction, and Immutability
-- Applies industry best practices (NIST SP 800-53, IEEE hash-chaining)

ALTER TABLE audit_logs 
ADD COLUMN IF NOT EXISTS previous_hash TEXT,
ADD COLUMN IF NOT EXISTS record_hash TEXT;

-- Immutability Trigger
CREATE OR REPLACE FUNCTION fn_prevent_audit_tampering()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable and cannot be altered or deleted.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_audit_tampering ON audit_logs;
CREATE TRIGGER trg_prevent_audit_tampering
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION fn_prevent_audit_tampering();

-- Enforce Principle of Least Privilege
REVOKE UPDATE, DELETE, TRUNCATE ON audit_logs FROM public;

-- Updated Audit Function with Redaction, HTTP Context, and Hash Chaining
CREATE OR REPLACE FUNCTION fn_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id TEXT;
    v_ip_address TEXT;
    v_user_agent TEXT;
    v_old_data JSONB;
    v_new_data JSONB;
    v_prev_hash TEXT;
    v_record_hash TEXT;
    v_raw_hash_input TEXT;
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

    -- Cryptographic Hash-Chaining (IEEE Best Practice)
    SELECT record_hash INTO v_prev_hash FROM audit_logs ORDER BY created_at DESC, id DESC LIMIT 1;
    IF v_prev_hash IS NULL THEN
        v_prev_hash := 'GENESIS';
    END IF;

    -- Compute SHA256 Hash
    v_raw_hash_input := v_prev_hash || COALESCE(v_user_id, '') || TG_OP || TG_TABLE_NAME || COALESCE(v_old_data::text, '') || COALESCE(v_new_data::text, '');
    v_record_hash := encode(digest(v_raw_hash_input, 'sha256'), 'hex');

    -- Insert Record
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (user_id, ip_address, user_agent, action_type, table_name, record_id, new_data, previous_hash, record_hash)
        VALUES (v_user_id, v_ip_address, v_user_agent, 'INSERT', TG_TABLE_NAME, (to_jsonb(NEW)->>'id'), v_new_data, v_prev_hash, v_record_hash);
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (user_id, ip_address, user_agent, action_type, table_name, record_id, old_data, new_data, previous_hash, record_hash)
        VALUES (v_user_id, v_ip_address, v_user_agent, 'UPDATE', TG_TABLE_NAME, (to_jsonb(NEW)->>'id'), v_old_data, v_new_data, v_prev_hash, v_record_hash);
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (user_id, ip_address, user_agent, action_type, table_name, record_id, old_data, previous_hash, record_hash)
        VALUES (v_user_id, v_ip_address, v_user_agent, 'DELETE', TG_TABLE_NAME, (to_jsonb(OLD)->>'id'), v_old_data, v_prev_hash, v_record_hash);
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
