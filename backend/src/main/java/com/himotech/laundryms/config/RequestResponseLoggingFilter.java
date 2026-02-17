package com.himotech.laundryms.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Profile;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Logs HTTP request and response for debugging. Active only in dev profile.
 */
@Component
@Profile("dev")
@Order(Ordered.HIGHEST_PRECEDENCE)
public class RequestResponseLoggingFilter extends OncePerRequestFilter {

    private static final List<String> EXCLUDED_PATHS = List.of("/actuator/health", "/actuator/info");

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return EXCLUDED_PATHS.stream().anyMatch(path::startsWith);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);

        long start = System.currentTimeMillis();
        try {
            filterChain.doFilter(wrappedRequest, wrappedResponse);
        } finally {
            long duration = System.currentTimeMillis() - start;
            logRequestResponse(wrappedRequest, wrappedResponse, duration);
            wrappedResponse.copyBodyToResponse();
        }
    }

    private void logRequestResponse(ContentCachingRequestWrapper request,
                                   ContentCachingResponseWrapper response, long durationMs) {
        if (!logger.isDebugEnabled()) {
            return;
        }
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String query = request.getQueryString();
        String fullUri = query != null ? uri + "?" + query : uri;
        int status = response.getStatus();

        String requestBody = getRequestBody(request);
        String responseBody = getResponseBody(response);

        String req = requestBody.isEmpty() ? "(empty)" : truncate(requestBody, 500);
        String res = responseBody.isEmpty() ? "(empty)" : truncate(responseBody, 500);
        logger.debug(String.format("API Request: %s %s -> %d (%dms) | Request: %s | Response: %s",
                method, fullUri, status, durationMs, req, res));
    }

    private String getRequestBody(ContentCachingRequestWrapper request) {
        byte[] buf = request.getContentAsByteArray();
        if (buf == null || buf.length == 0) {
            return "";
        }
        return new String(buf, StandardCharsets.UTF_8);
    }

    private String getResponseBody(ContentCachingResponseWrapper response) {
        byte[] buf = response.getContentAsByteArray();
        if (buf == null || buf.length == 0) {
            return "";
        }
        return new String(buf, StandardCharsets.UTF_8);
    }

    private static String truncate(String s, int maxLen) {
        if (s == null || s.length() <= maxLen) {
            return s != null ? s : "";
        }
        return s.substring(0, maxLen) + "...";
    }
}
