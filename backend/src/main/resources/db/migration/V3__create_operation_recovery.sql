CREATE TABLE operation_recovery (
    operation_identifier VARCHAR(255) NOT NULL,
    actor_id UUID NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    response_body TEXT,
    response_status INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (operation_identifier)
);

CREATE INDEX idx_operation_recovery_actor_action ON operation_recovery(actor_id, action_type);
CREATE INDEX idx_operation_recovery_expires ON operation_recovery(expires_at);
