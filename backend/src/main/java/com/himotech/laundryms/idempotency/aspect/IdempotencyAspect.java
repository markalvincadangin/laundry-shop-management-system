package com.himotech.laundryms.idempotency.aspect;

import com.himotech.laundryms.idempotency.service.IdempotencyService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.util.UUID;
import java.util.function.Supplier;

@Aspect
@Component
@RequiredArgsConstructor
public class IdempotencyAspect {

    private final IdempotencyService idempotencyService;

    @Around("@annotation(com.himotech.laundryms.idempotency.aspect.Idempotent)")
    public Object handleIdempotency(ProceedingJoinPoint joinPoint) throws Throwable {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        String operationIdentifier = request.getHeader("X-Operation-Identifier");

        if (operationIdentifier == null || operationIdentifier.isBlank()) {
            return joinPoint.proceed();
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("Authentication required for idempotent operations");
        }
        
        // This assumes the principal is the actor ID (Long) or can be parsed to one.
        // If your system uses a custom UserDetails object, you may need to cast it and extract the ID.
        // Assuming principal is the user ID as a String or Long.
        UUID actorId;
        try {
            actorId = UUID.fromString(authentication.getName());
        } catch (IllegalArgumentException e) {
            // Fallback if the name is not a UUID
            throw new IllegalStateException("Unable to determine actor ID from authentication", e);
        }

        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        Idempotent idempotentAnnotation = method.getAnnotation(Idempotent.class);

        String actionType = idempotentAnnotation.actionType();
        if (actionType.isEmpty()) {
            actionType = method.getName();
        }

        Class<?> returnType = signature.getReturnType();

        Supplier<Object> operation = () -> {
            try {
                return joinPoint.proceed();
            } catch (Throwable t) {
                if (t instanceof RuntimeException) {
                    throw (RuntimeException) t;
                }
                throw new RuntimeException(t);
            }
        };

        // If the return type is a generic like ResponseEntity<T>, we pass Object.class for now,
        // or we handle deserialization properly inside IdempotencyService.
        return idempotencyService.executeWithIdempotency(operationIdentifier, actorId, actionType, (Class<Object>) returnType, operation);
    }
}
