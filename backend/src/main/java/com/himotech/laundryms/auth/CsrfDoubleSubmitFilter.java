package com.himotech.laundryms.auth;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.lang.NonNull;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 1)
public class CsrfDoubleSubmitFilter extends OncePerRequestFilter {

    private static final String CSRF_COOKIE_NAME = "csrf_token";
    private static final String CSRF_HEADER_NAME = "X-CSRF-Token";

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();
        
        // Only apply to state-changing auth endpoints that rely on cookies
        if (path.startsWith("/api/v1/auth/refresh") || path.startsWith("/api/v1/auth/logout")) {
            
            String csrfHeader = request.getHeader(CSRF_HEADER_NAME);
            String csrfCookie = null;
            
            if (request.getCookies() != null) {
                for (Cookie cookie : request.getCookies()) {
                    if (CSRF_COOKIE_NAME.equals(cookie.getName())) {
                        csrfCookie = cookie.getValue();
                        break;
                    }
                }
            }
            
            if (csrfHeader == null || csrfCookie == null || !csrfHeader.equals(csrfCookie)) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Invalid or missing CSRF token");
                return;
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
