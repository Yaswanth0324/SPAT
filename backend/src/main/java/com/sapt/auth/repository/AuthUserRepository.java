package com.sapt.auth.repository;

/**
 * @deprecated Replaced by {@link UserRepository}.
 * Use UserRepository for all user queries against the unified `users` table.
 */
@Deprecated(since = "2.0", forRemoval = true)
public interface AuthUserRepository {
    // REMOVED — use UserRepository
}
