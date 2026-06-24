package com.sapt.auth.repository;

import com.sapt.auth.entity.AuthUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * @deprecated Replaced by {@link UserRepository} which uses the unified users table.
 * Kept only so existing references compile without errors.
 */
@Deprecated
@Repository
public interface AuthUserRepository extends JpaRepository<AuthUser, Long> {
    Optional<AuthUser> findByEmail(String email);
    boolean existsByEmail(String email);
}
