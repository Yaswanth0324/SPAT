package com.sapt.systemadmin.entity;

/**
 * @deprecated The separate `system_admins` table no longer exists.
 *
 * All system admin data is now stored in the unified `users` table
 * with role = SYSTEM_ADMIN.
 *
 * Use {@link com.sapt.auth.entity.User} with role filter SYSTEM_ADMIN.
 */
@Deprecated(since = "2.0", forRemoval = true)
public class SystemAdmin {
    // REMOVED — use com.sapt.auth.entity.User (role = SYSTEM_ADMIN)
}
