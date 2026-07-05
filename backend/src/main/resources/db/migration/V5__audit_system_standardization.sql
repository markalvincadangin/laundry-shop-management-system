-- V5__audit_system_standardization.sql

-- Drop the hash-chaining columns to preserve write throughput
ALTER TABLE audit_logs 
DROP COLUMN IF EXISTS previous_hash,
DROP COLUMN IF EXISTS record_hash;

-- Indexes for Admin Filtering
CREATE INDEX IF NOT EXISTS idx_audit_logs_module_action ON audit_logs(table_name, action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);

-- Update Audit Function to remove hash computation while keeping HTTP context and redaction
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
