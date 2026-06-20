package com.sapt.mentor.entity;

/**
 * @deprecated The separate `mentors` table no longer exists.
 *
 * All mentor data is now stored in the unified `users` table
 * with role = MENTOR. Fields (phone, department, collegeName, etc.)
 * are columns on the User entity.
 *
 * Succession requests are handled by {@link SuccessionRequest} entity
 * (stored in the `succession_requests` table).
 *
 * Use {@link com.sapt.auth.entity.User} with role filter MENTOR.
 */
@Deprecated(since = "2.0", forRemoval = true)
public class Mentor {
    // REMOVED — use com.sapt.auth.entity.User (role = MENTOR)
}
