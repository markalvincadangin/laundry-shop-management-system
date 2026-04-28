package com.himotech.laundryms.auditlog.aspect;

import com.himotech.laundryms.auditlog.event.AuditLogEvent;
import com.himotech.laundryms.security.JwtPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class AuditAspect {

    private final ApplicationEventPublisher eventPublisher;

    @Around("@annotation(auditable)")
    public Object audit(ProceedingJoinPoint joinPoint, Auditable auditable) throws Throwable {
        String methodName = joinPoint.getSignature().toShortString();
        String userId = getCurrentUserId();
        HttpServletRequest request = getCurrentRequest();

        String ipAddress = request != null ? request.getRemoteAddr() : "unknown";
        String userAgent = request != null ? request.getHeader("User-Agent") : "unknown";

        Object result = null;
        String status = "SUCCESS";

        try {
            result = joinPoint.proceed();
            return result;
        } catch (Throwable throwable) {
            status = "FAILURE";
            throw throwable;
        } finally {
            AuditLogEvent event = AuditLogEvent.builder()
                    .userId(userId)
                    .actionType(auditable.action())
                    .description(auditable.description())
                    .methodName(methodName)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .status(status)
                    .tableName("SYSTEM")
                    .recordId("N/A")
                    .build();

            eventPublisher.publishEvent(event);
        }
    }

    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            Object principal = auth.getPrincipal();
            if (principal instanceof JwtPrincipal jwtPrincipal) {
                return jwtPrincipal.userId().toString();
            }
            return auth.getName();
        }
        return "anonymous";
    }

    private HttpServletRequest getCurrentRequest() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        return attributes != null ? attributes.getRequest() : null;
    }
}
