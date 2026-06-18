package com.sapt.auth.entity;

/**
 * @deprecated This entity and the auth_users table have been replaced.
 *
 * All users (all 5 roles) are now stored in a single unified table: `users`.
 * Use {@link User} entity and {@link com.sapt.auth.repository.UserRepository} instead.
 *
 * This class is kept as an empty stub to avoid orphaned import errors
 * during migration. It will be removed in the next cleanup.
 */
@Deprecated(since = "2.0", forRemoval = true)
public class AuthUser {
    // REMOVED — use com.sapt.auth.entity.User
}
