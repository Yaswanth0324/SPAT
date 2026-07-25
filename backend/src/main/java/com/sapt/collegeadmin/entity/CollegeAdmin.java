package com.sapt.collegeadmin.entity;

/**
 * @deprecated The separate `college_admins` table no longer exists.
 *
 * All college admin data is now stored in the unified `users` table
 * with role = COLLEGE_ADMIN.
 *
 * Use {@link com.sapt.auth.entity.User} with role filter COLLEGE_ADMIN.
 */
@Deprecated(since = "2.0", forRemoval = true)
public class CollegeAdmin {
    // REMOVED — use com.sapt.auth.entity.User (role = COLLEGE_ADMIN)
}
