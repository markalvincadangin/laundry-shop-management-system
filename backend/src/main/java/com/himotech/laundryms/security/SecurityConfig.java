package com.himotech.laundryms.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    CorsConfigurationSource corsConfigurationSource(SecurityProperties props) {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(props.getAllowedOrigin() != null ? props.getAllowedOrigin() : "http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, SecurityProperties props) throws Exception {

        http
                .csrf(AbstractHttpConfigurer::disable) // We'll later enable CSRF properly if needed (cookie auth)
                .cors(cors -> cors.configurationSource(corsConfigurationSource(props)))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(((request, response, authException) -> response.sendError(HttpServletResponse.SC_UNAUTHORIZED, authException.getMessage()))
                        )
                )
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/orders/reference/**").permitAll() // Public order tracking
                        .requestMatchers("/api/test/public").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        // All other /api/v1/** endpoints require authentication
                        // TODO[PHASE-9]: Replace with proper role-based access control
                        .requestMatchers("/api/v1/**").authenticated()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(new JwtCookieAuthFilter(props),
                        org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
