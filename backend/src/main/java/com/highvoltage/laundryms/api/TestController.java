package com.highvoltage.laundryms.api;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    // PUBLIC endpoint (no cookie required)
    @GetMapping("/api/test/public")
    public String publicEndpoint() {
        return "OK - public endpoint works";
    }

    // PROTECTED endpoint (requires auth; will be blocked without cookie)
    @GetMapping("/api/test/protected")
    public String protectedEndpoint(Authentication auth) {
        return "OK - protected endpoint. auth=" + (auth != null ? auth.getName() : "null");
    }
}
