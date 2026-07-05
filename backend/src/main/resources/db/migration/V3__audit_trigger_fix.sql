-- V3__audit_trigger_fix.sql — Audit Log Null User Fix
-- Enhances the generic audit trigger to gracefully fall back to 'SYSTEM'
-- when app.current_user_id is null or empty.

CREATE OR REPLACE FUNCTION fn_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id TEXT;
BEGIN
    -- Get user_id from session variable (set by Spring Boot AOP)
    v_user_id := current_setting('app.current_user_id', true);
    
    -- Fallback to 'SYSTEM' for unauthenticated/system tasks to prevent nulls
    IF v_user_id IS NULL OR v_user_id = '' THEN
        v_user_id := 'SYSTEM';
    END IF;

    IF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (user_id, action_type, table_name, record_id, new_data)
        VALUES (v_user_id, 'INSERT', TG_TABLE_NAME, (to_jsonb(NEW)->>'id'), to_jsonb(NEW));
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (user_id, action_type, table_name, record_id, old_data, new_data)
        VALUES (v_user_id, 'UPDATE', TG_TABLE_NAME, (to_jsonb(NEW)->>'id'), to_jsonb(OLD), to_jsonb(NEW));
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (user_id, action_type, table_name, record_id, old_data)
        VALUES (v_user_id, 'DELETE', TG_TABLE_NAME, (to_jsonb(OLD)->>'id'), to_jsonb(OLD));
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
