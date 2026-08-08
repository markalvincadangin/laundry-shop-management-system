package com.himotech.laundryms.auth;

import com.himotech.laundryms.config.SecurityProperties;
import com.himotech.laundryms.shared.UserRole;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.lang.NonNull;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Order(Ordered.LOWEST_PRECEDENCE)
public class JwtAuthFilter extends OncePerRequestFilter {

    private final SecurityProperties props;
    private final JwtService jwtService;

    public JwtAuthFilter(SecurityProperties props, JwtService jwtService) {
        this.props = props;
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // Fallback for Vercel preview environments where Vercel Protection strips Authorization
            authHeader = request.getHeader("X-LMS-Authorization");
        }
        
        Optional<String> token = Optional.empty();

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = Optional.of(authHeader.substring(7));
        }

        token.ifPresent(t -> {
            Claims claims = jwtService.validateAndGetClaims(t);
            if (claims != null) {
                UUID userId = jwtService.getUserIdFromClaims(claims);
                UserRole role = jwtService.getRoleFromClaims(claims);
                String username = claims.get("username", String.class);
                if (username == null) {
                    username = claims.getSubject(); // Fallback for old tokens
                }

                var authorities = role != null
                        ? Stream.of(new SimpleGrantedAuthority("ROLE_" + role.name()))
                                .collect(Collectors.toList())
                        : Collections.<SimpleGrantedAuthority>emptyList();

                var principal = new JwtPrincipal(userId, username, role);
                var auth = new UsernamePasswordAuthenticationToken(principal, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        });

        filterChain.doFilter(request, response);
    }
}
