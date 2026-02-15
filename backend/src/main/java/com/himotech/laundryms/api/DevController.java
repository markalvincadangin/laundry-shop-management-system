package com.himotech.laundryms.api;

import com.himotech.laundryms.common.enums.UserRole;
import com.himotech.laundryms.users.entity.User;
import com.himotech.laundryms.users.repository.UserRepository;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Dev-only endpoints for Phase 8 frontend MVP.
 * Returns default staff user ID when auth is not yet implemented (Phase 9).
 */
@RestController
@RequestMapping("/api/v1/dev")
@Profile("dev")
public class DevController {

    private final UserRepository userRepository;

    public DevController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Returns the first staff user's ID for use as createdByUserId/receivedByUserId
     * when auth is bypassed in dev profile.
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, String>> getDefaultStaffUserId() {
        return userRepository.findFirstByRole(UserRole.STAFF)
                .map(User::getId)
                .map(id -> ResponseEntity.ok(Map.of("userId", id.toString())))
                .orElse(ResponseEntity.notFound().build());
    }
}
