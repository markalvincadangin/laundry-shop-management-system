package com.himotech.laundryms.users.api;

import com.himotech.laundryms.users.dto.CreateUserRequest;
import com.himotech.laundryms.users.dto.UpdateUserRequest;
import com.himotech.laundryms.users.dto.UserResponse;
import com.himotech.laundryms.users.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    @GetMapping
    public org.springframework.data.domain.Page<UserResponse> getAllUsers(
            @org.springframework.web.bind.annotation.RequestParam(required = false) String q,
            @org.springframework.data.web.PageableDefault(size = 20, sort = "username") org.springframework.data.domain.Pageable pageable) {
        return userService.searchUsers(q, pageable);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(@Valid @RequestBody CreateUserRequest request) {
        return userService.createUser(request);
    }

    @PatchMapping("/{id}")
    public UserResponse updateUser(@PathVariable UUID id, @RequestBody UpdateUserRequest request) {
        return userService.updateUser(id, request);
    }

    @PatchMapping("/{id}/toggle-status")
    public void toggleStatus(@PathVariable UUID id) {
        userService.toggleUserStatus(id);
    }
}
