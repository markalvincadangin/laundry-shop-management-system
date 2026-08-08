package com.himotech.laundryms.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.Test;

class SecurityPropertiesTest {

    @Test
    void productionUsesLocalhostBindingAndLaxCookies() throws IOException {
        String productionConfiguration = Files.readString(Path.of("src/main/resources/application-prod.yml"));

        assertThat(productionConfiguration).contains("address: 127.0.0.1");
        assertThat(productionConfiguration).contains("cookie-same-site: Lax");
        assertThat(productionConfiguration).doesNotContain("cookie-same-site: None");
    }
}
