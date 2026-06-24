package com.sapt.auth.repository;

import com.sapt.auth.entity.User;
import com.sapt.common.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * UserRepository - JPA Repository for the unified users table.
 * Replaces AuthUserRepository which was mapped to auth_users.
 */
@Repository
public interface UserRepository extends JpaRepository<User, String> {

    /** Find user by email (used for login) */
    Optional<User> findByEmail(String email);

    /** Check if email already exists (used for registration) */
    boolean existsByEmail(String email);

    /** Find all users with a specific role */
    List<User> findByRole(UserRole role);

    /** Find users by college name */
    List<User> findByCollegeName(String collegeName);
}
