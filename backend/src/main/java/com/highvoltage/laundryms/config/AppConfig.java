package com.highvoltage.laundryms.config;

import com.highvoltage.laundryms.security.SecurityProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(SecurityProperties.class)
public class AppConfig {
}
