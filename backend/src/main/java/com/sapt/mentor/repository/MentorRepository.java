package com.sapt.mentor.repository;

/**
 * @deprecated The `mentors` table no longer exists as a separate entity.
 *
 * All mentor data is in the unified `users` table (role = MENTOR).
 * Use {@link com.sapt.auth.repository.UserRepository} instead:
 *
 *   userRepository.findByRole(UserRole.MENTOR)
 *   userRepository.findByHodId(hodId)
 *   userRepository.findByCollegeIdAndRole(collegeId, UserRole.MENTOR)
 */
@Deprecated(since = "2.0", forRemoval = true)
public interface MentorRepository {
    // REMOVED — use com.sapt.auth.repository.UserRepository
}
