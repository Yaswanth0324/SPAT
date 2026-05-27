package com.sapt.submission.repository;

import com.sapt.common.enums.SubmissionStatus;
import com.sapt.submission.entity.Submission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * SubmissionRepository - JPA Repository for Submission entity.
 * TODO (Submission Team): Add complex @Query methods for reporting/stats.
 */
@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {

    /** Get all submissions by a student (paginated) */
    Page<Submission> findByStudentId(Long studentId, Pageable pageable);

    /** Get all pending submissions assigned to a mentor */
    Page<Submission> findByMentorIdAndStatus(Long mentorId, SubmissionStatus status, Pageable pageable);

    /** Get all submissions under a HOD's department */
    List<Submission> findByHodId(Long hodId);

    /** Count submissions by student and status */
    long countByStudentIdAndStatus(Long studentId, SubmissionStatus status);

    /** Total approved points for a student */
    // @Query("SELECT SUM(s.awardedPoints) FROM Submission s WHERE s.studentId = :studentId AND s.status = 'APPROVED'")
    // Integer sumAwardedPointsByStudentId(@Param("studentId") Long studentId);

    // TODO: Add more aggregation and filter queries as needed
}
