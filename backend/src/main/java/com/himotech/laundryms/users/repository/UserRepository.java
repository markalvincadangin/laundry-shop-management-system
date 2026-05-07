package com.himotech.laundryms.users.repository;

import com.himotech.laundryms.common.enums.UserRole;
import com.himotech.laundryms.users.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository interface for User entity.
 * Provides database access for user authentication and management.
 */
@Repository
public interface UserRepository extends JpaRepository<User, UUID>, JpaSpecificationExecutor<User> {

    /**
     * Finds a user by their unique username.
     * Required for authentication and user lookups.
     *
     * @param username the username to search for
     * @return an Optional containing the user if found, empty otherwise
     */
    Optional<User> findByUsername(String username);

    /**
     * Finds the first user with the given role (for dev/default user selection).
     *
     * @param role the user role
     * @return an Optional containing the user if found, empty otherwise
     */
    Optional<User> findFirstByRole(UserRole role);
}

