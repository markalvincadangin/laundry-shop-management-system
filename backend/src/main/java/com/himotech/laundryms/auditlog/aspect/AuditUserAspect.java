package com.himotech.laundryms.auditlog.aspect;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.himotech.laundryms.auth.JwtPrincipal;
import org.springframework.stereotype.Component;

/**
 * Aspect to propagate Spring Security user context to PostgreSQL.
 * This allows DB triggers to capture the user who performed an action.
 */
@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class AuditUserAspect {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Set the session variable 'app.current_user_id' before any transactional method.
     * The PostgreSQL audit trigger reads this variable.
     */
    @Before("@within(org.springframework.transaction.annotation.Transactional) || @annotation(org.springframework.transaction.annotation.Transactional)")
    public void setAuditUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            Object principal = auth.getPrincipal();
            String userId = null;
            
            if (principal instanceof JwtPrincipal jwtPrincipal) {
                userId = jwtPrincipal.userId().toString();
            } else {
                userId = auth.getName();
            }

            if (userId != null) {
                try {
                    // Using SET LOCAL ensures the variable only lasts for the current transaction
                    jdbcTemplate.execute(String.format("SET LOCAL app.current_user_id = '%s'", userId));
                } catch (Exception e) {
                    log.warn("Failed to set PostgreSQL session user context for audit: {}", e.getMessage());
                }
            }
        }
    }
}
