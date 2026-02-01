package com.highvoltage.laundryms.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;

public class JwtCookieAuthFilter extends OncePerRequestFilter {

    private final SecurityProperties props;

    public JwtCookieAuthFilter(SecurityProperties props) {
        this.props = props;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // 1) Find cookie
        String cookieName = props.getCookieName() != null ? props.getCookieName() : "access_token";
        Optional<Cookie> tokenCookie = Optional.empty();

        if (request.getCookies() != null) {
            tokenCookie = Arrays.stream(request.getCookies())
                    .filter(c -> cookieName.equals(c.getName()))
                    .findFirst();
        }

        // 2) If present, we will validate JWT later.
        // For now: if cookie exists, set a placeholder auth to prove pipeline works.
        // NOTE: We'll replace this with real JWT validation in the Auth phase.
        tokenCookie.ifPresent(c -> {
            // Placeholder principal; will be replaced by JWT claims parsing
            var auth = new UsernamePasswordAuthenticationToken("cookie-user", null, null);
            SecurityContextHolder.getContext().setAuthentication(auth);
        });

        filterChain.doFilter(request, response);
    }
}
