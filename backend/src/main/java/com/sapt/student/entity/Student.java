package com.sapt.student.entity;

/**
 * @deprecated The separate `students` table no longer exists.
 *
 * All student data is now stored in the unified `users` table
 * with role = STUDENT. Role-specific fields (rollNo, mentorId,
 * departmentId, etc.) are columns on the User entity.
 *
 * Use {@link com.sapt.auth.entity.User} with role filter STUDENT.
 */
@Deprecated(since = "2.0", forRemoval = true)
public class Student {
    // REMOVED — use com.sapt.auth.entity.User (role = STUDENT)
}
