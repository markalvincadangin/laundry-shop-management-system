package com.himotech.laundryms.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Data
@Validated
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private Sms sms = new Sms();

    @Data
    public static class Sms {
        private Semaphore semaphore = new Semaphore();
        private String template;
        
        @Data
        public static class Semaphore {
            private String apiKey;
            private String senderName;
        }
    }
}
