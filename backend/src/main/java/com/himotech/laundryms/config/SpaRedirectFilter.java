package com.himotech.laundryms.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SpaRedirectFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();

        if (!path.startsWith("/api") 
                && !path.startsWith("/swagger-ui") 
                && !path.startsWith("/v3/api-docs") 
                && !path.matches(".*\\.[a-zA-Z0-9]+$")) {
            
            if (path.equals("/")) {
                request.getRequestDispatcher("/index.html").forward(request, response);
                return;
            }

            // Next.js dynamic route fallbacks
            if (path.matches("/orders/[^/]+")) {
                request.getRequestDispatcher("/orders/fallback.html").forward(request, response);
                return;
            }
            if (path.matches("/orders/[^/]+/pay")) {
                request.getRequestDispatcher("/orders/fallback/pay.html").forward(request, response);
                return;
            }
            if (path.matches("/customers/[^/]+")) {
                request.getRequestDispatcher("/customers/fallback.html").forward(request, response);
                return;
            }

            // For standard Next.js static exports, forward /some-path to /some-path.html
            request.getRequestDispatcher(path + ".html").forward(request, response);
            return;
        }

        filterChain.doFilter(request, response);
    }
}
