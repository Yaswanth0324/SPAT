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
@Repository
public interface MentorRepository extends JpaRepository<Mentor, Long> {
    Optional<Mentor> findByUserId(String userId);
    List<Mentor> findByHodId(Long hodId);
    List<Mentor> findByCollegeId(Long collegeId);
}
