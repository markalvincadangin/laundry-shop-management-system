package com.himotech.laundryms;

import com.himotech.laundryms.support.PostgresTestContainerConfig;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@Import(PostgresTestContainerConfig.class)
class LaundrySystemApplicationTests {

    @Test
    void contextLoads() {
        // If Flyway migration fails, this test will fail on startup.
    }
}
