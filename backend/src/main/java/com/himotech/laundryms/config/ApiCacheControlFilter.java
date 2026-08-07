package com.himotech.laundryms.config;

import java.io.IOException;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Prevents browsers and intermediary proxies from caching API responses.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 2)
public class ApiCacheControlFilter extends OncePerRequestFilter {

    private static final String CACHE_CONTROL = "no-store, no-cache, must-revalidate";

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        applyNoCacheHeaders(response);
        filterChain.doFilter(request, response);
        applyNoCacheHeaders(response);
    }

    private void applyNoCacheHeaders(HttpServletResponse response) {
        response.setHeader("Cache-Control", CACHE_CONTROL);
        response.setHeader("Pragma", "no-cache");
    }
}
