package com.sapt.auth.repository;

import com.sapt.auth.entity.AuthUser;
import com.sapt.common.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * ============================================================
 * AuthUserRepository - JPA Repository for AuthUser
 * ============================================================
 * Provides database access methods for the auth_users table.
 *
 * TODO (Auth Team):
 *  - Add custom query methods as needed
 *  - Use @Query for complex queries
 *  - Do NOT write SQL directly; use Spring Data method naming
 * ============================================================
 */
@Repository
public interface AuthUserRepository extends JpaRepository<AuthUser, Long> {

    /** Find user by email (used for login) */
    Optional<AuthUser> findByEmail(String email);

    /** Check if email already exists (used for registration) */
    boolean existsByEmail(String email);

    /** Find all users with a specific role */
    // List<AuthUser> findByRole(UserRole role);

    // TODO: Add more query methods as needed
}
