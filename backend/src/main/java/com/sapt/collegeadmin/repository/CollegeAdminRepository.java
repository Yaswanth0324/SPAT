package com.sapt.collegeadmin.repository;

/**
 * @deprecated The `college_admins` table no longer exists as a separate entity.
 *
 * All college admin data is in the unified `users` table (role = COLLEGE_ADMIN).
 * Use {@link com.sapt.auth.repository.UserRepository} instead:
 *
 *   userRepository.findByRole(UserRole.COLLEGE_ADMIN)
 *   userRepository.findByCollegeIdAndRole(collegeId, UserRole.COLLEGE_ADMIN)
 */
@Deprecated(since = "2.0", forRemoval = true)
public interface CollegeAdminRepository {
    // REMOVED — use com.sapt.auth.repository.UserRepository
}
