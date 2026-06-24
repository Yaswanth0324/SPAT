package com.sapt.student.repository;

/**
 * @deprecated The `students` table no longer exists as a separate entity.
 *
 * All student data is in the unified `users` table (role = STUDENT).
 * Use {@link com.sapt.auth.repository.UserRepository} instead:
 *
 *   userRepository.findByRole(UserRole.STUDENT)
 *   userRepository.findByMentorId(mentorId)
 *   userRepository.findByCollegeIdAndRole(collegeId, UserRole.STUDENT)
 */
@Deprecated(since = "2.0", forRemoval = true)
public interface StudentRepository {
    // REMOVED — use com.sapt.auth.repository.UserRepository
}
