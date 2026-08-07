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

            // For Next.js static exports, forward /some-path to /some-path.html
            // If the HTML file doesn't exist, Spring will naturally return 404 (or we could fallback to 404.html)
            request.getRequestDispatcher(path + ".html").forward(request, response);
            return;
        }

        filterChain.doFilter(request, response);
    }
}
