package com.sapt.mentor.repository;

import com.sapt.mentor.entity.Mentor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * MentorRepository - JPA Repository for Mentor entity.
 * TODO (Mentor Team): Add custom query methods as needed.
 */
@Repository
public interface MentorRepository extends JpaRepository<Mentor, Long> {
    Optional<Mentor> findByUserId(String userId);
    List<Mentor> findByHodId(Long hodId);
    List<Mentor> findByCollegeId(Long collegeId);
}
