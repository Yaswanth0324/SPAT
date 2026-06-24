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
@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserId(String userId);
    Optional<Student> findByRollNumber(String rollNumber);
    // TODO: findByDepartmentAndBatch(), findByMentorId(), etc.
}
