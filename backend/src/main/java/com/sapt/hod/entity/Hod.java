package com.sapt.hod.entity;

/**
 * @deprecated The separate `hods` table no longer exists.
 *
 * All HOD data is now stored in the unified `users` table
 * with role = HOD.
 *
 * Use {@link com.sapt.auth.entity.User} with role filter HOD.
 */
@Deprecated(since = "2.0", forRemoval = true)
public class Hod {
    // REMOVED — use com.sapt.auth.entity.User (role = HOD)
}
