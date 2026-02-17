package com.himotech.laundryms.security;

import com.himotech.laundryms.auth.JwtService;
import com.himotech.laundryms.common.enums.UserRole;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class JwtCookieAuthFilter extends OncePerRequestFilter {

    private final SecurityProperties props;
    private final JwtService jwtService;

    public JwtCookieAuthFilter(SecurityProperties props, JwtService jwtService) {
        this.props = props;
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String cookieName = props.getCookieName() != null ? props.getCookieName() : "access_token";
        Optional<Cookie> tokenCookie = Optional.empty();

        if (request.getCookies() != null) {
            tokenCookie = Arrays.stream(request.getCookies())
                    .filter(c -> cookieName.equals(c.getName()))
                    .findFirst();
        }

        tokenCookie.ifPresent(c -> {
            Claims claims = jwtService.validateAndGetClaims(c.getValue());
            if (claims != null) {
                UUID userId = jwtService.getUserIdFromClaims(claims);
                UserRole role = jwtService.getRoleFromClaims(claims);
                String username = claims.getSubject();

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
