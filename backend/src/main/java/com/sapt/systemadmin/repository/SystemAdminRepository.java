package com.sapt.systemadmin.repository;

/**
 * @deprecated The `system_admins` table no longer exists as a separate entity.
 *
 * All system admin data is in the unified `users` table (role = SYSTEM_ADMIN).
 * Use {@link com.sapt.auth.repository.UserRepository} instead:
 *
 *   userRepository.findByRole(UserRole.SYSTEM_ADMIN)
 */
@Deprecated(since = "2.0", forRemoval = true)
public interface SystemAdminRepository {
    // REMOVED — use com.sapt.auth.repository.UserRepository
}
