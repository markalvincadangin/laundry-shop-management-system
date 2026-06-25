package com.himotech.laundryms.config;

import com.himotech.laundryms.auth.JwtCookieAuthFilter;
import com.himotech.laundryms.auth.JwtService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JwtAuthFilterConfig {

    @Bean
    JwtCookieAuthFilter jwtCookieAuthFilter(SecurityProperties props, JwtService jwtService) {
        return new JwtCookieAuthFilter(props, jwtService);
    }
}
