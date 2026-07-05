package com.himotech.laundryms.auditlog.aspect;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import com.himotech.laundryms.auth.JwtPrincipal;
import org.springframework.stereotype.Component;

/**
 * Aspect to propagate Spring Security and HTTP context to PostgreSQL.
 * This allows DB triggers to capture the user, IP, and User-Agent who performed an action.
 */
@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class AuditUserAspect {

    private final JdbcTemplate jdbcTemplate;

    /**
     * Set session variables before any transactional method.
     * The PostgreSQL audit trigger reads these variables.
     */
    @Before("@within(org.springframework.transaction.annotation.Transactional) || @annotation(org.springframework.transaction.annotation.Transactional)")
    public void setAuditContext() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = "SYSTEM";
        
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            Object principal = auth.getPrincipal();
            if (principal instanceof JwtPrincipal jwtPrincipal) {
                userId = jwtPrincipal.userId().toString();
            } else {
                userId = auth.getName();
            }
        }
        
        String ipAddress = "127.0.0.1";
        String userAgent = "Unknown";
        
        ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attrs != null) {
            HttpServletRequest request = attrs.getRequest();
            String forwardedFor = request.getHeader("X-Forwarded-For");
            ipAddress = (forwardedFor != null && !forwardedFor.isEmpty()) ? forwardedFor.split(",")[0] : request.getRemoteAddr();
            
            String ua = request.getHeader("User-Agent");
            if (ua != null && !ua.isEmpty()) {
                userAgent = ua;
            }
        }

        try {
            userAgent = userAgent.replace("'", "''");
            String sql = String.format(
                "SET LOCAL app.current_user_id = '%s'; SET LOCAL app.client_ip = '%s'; SET LOCAL app.user_agent = '%s';",
                userId, ipAddress, userAgent
            );
            jdbcTemplate.execute(sql);
        } catch (Exception e) {
            log.warn("Failed to set PostgreSQL session context for audit: {}", e.getMessage());
        }
    }
}
