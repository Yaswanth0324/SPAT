package com.sapt.hod.repository;

/**
 * @deprecated The `hods` table no longer exists as a separate entity.
 *
 * All HOD data is in the unified `users` table (role = HOD).
 * Use {@link com.sapt.auth.repository.UserRepository} instead:
 *
 *   userRepository.findByRole(UserRole.HOD)
 *   userRepository.findByCollegeIdAndRole(collegeId, UserRole.HOD)
 *   userRepository.findByDepartmentIdAndRole(departmentId, UserRole.HOD)
 */
@Deprecated(since = "2.0", forRemoval = true)
public interface HodRepository {
    // REMOVED — use com.sapt.auth.repository.UserRepository
}
