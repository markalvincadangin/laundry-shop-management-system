package com.himotech.laundryms.users.service;

import com.himotech.laundryms.auditlog.aspect.Auditable;
import com.himotech.laundryms.users.dto.CreateUserRequest;
import com.himotech.laundryms.users.dto.UpdateUserRequest;
import com.himotech.laundryms.users.dto.UserResponse;
import com.himotech.laundryms.users.entity.User;
import com.himotech.laundryms.users.repository.UserRepository;
import com.himotech.laundryms.auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<UserResponse> searchUsers(String q, org.springframework.data.domain.Pageable pageable) {
        org.springframework.data.jpa.domain.Specification<User> spec = 
            com.himotech.laundryms.users.repository.UserSpecification.filterBy(q);
        return userRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public com.himotech.laundryms.users.dto.UserStatsResponse getUserStats() {
        return com.himotech.laundryms.users.dto.UserStatsResponse.builder()
                .totalUsers(userRepository.count())
                .totalAdmins(userRepository.countByRole(com.himotech.laundryms.shared.UserRole.ADMIN))
                .totalActiveStaff(userRepository.countByRoleAndIsActive(com.himotech.laundryms.shared.UserRole.STAFF, true))
                .build();
    }

    @Auditable(action = "USER_CREATE", description = "Create new system user")
    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .isActive(true)
                .build();

        return mapToResponse(userRepository.save(user));
    }

    @Auditable(action = "USER_UPDATE", description = "Update user details")
    @Transactional
    public UserResponse updateUser(UUID id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean revokeTokens = false;
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getRole() != null && user.getRole() != request.getRole()) {
            user.setRole(request.getRole());
            revokeTokens = true;
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            revokeTokens = true;
        }

        User updatedUser = userRepository.save(user);
        if (revokeTokens) {
            authService.revokeAllUserTokens(user.getId());
        }
        return mapToResponse(updatedUser);
    }

    @Auditable(action = "USER_TOGGLE_ACTIVE", description = "Toggle user active status")
    @Transactional
    public void toggleUserStatus(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Constraint: Admin cannot deactivate themselves
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof com.himotech.laundryms.auth.JwtPrincipal principal) {
            if (principal.userId().equals(id) && user.getIsActive()) {
                throw new RuntimeException("Admins cannot deactivate their own account to prevent lockout.");
            }
        }

        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
        
        if (!user.getIsActive()) {
            authService.revokeAllUserTokens(user.getId());
        }
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
