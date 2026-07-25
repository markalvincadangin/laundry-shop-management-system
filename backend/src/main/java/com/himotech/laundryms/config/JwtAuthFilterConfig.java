package com.himotech.laundryms.config;

import com.himotech.laundryms.auth.JwtAuthFilter;
import com.himotech.laundryms.auth.JwtService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JwtAuthFilterConfig {

    @Bean
    JwtAuthFilter jwtAuthFilter(SecurityProperties props, JwtService jwtService) {
        return new JwtAuthFilter(props, jwtService);
    }
}
