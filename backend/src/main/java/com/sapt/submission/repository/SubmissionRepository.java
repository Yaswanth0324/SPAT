package com.sapt.submission.repository;

import com.sapt.common.enums.SubmissionStatus;
import com.sapt.submission.entity.Submission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * SubmissionRepository — JPA Repository for Submission entity.
 *
 * NOTE: All ID fields (studentId, mentorId) are String UUIDs, NOT Long.
 * The Submission entity was migrated to the unified users table where
 * all primary keys are CHAR(36) UUIDs.
 */
@Repository
public interface SubmissionRepository extends JpaRepository<Submission, String> {

    // ─── Student Queries ─────────────────────────────────────
    /** All submissions by a student (paginated) */
    Page<Submission> findByStudentId(String studentId, Pageable pageable);

    /** All submissions by a student with a specific status */
    List<Submission> findByStudentIdAndStatus(String studentId, SubmissionStatus status);

    /** Count by student + status */
    long countByStudentIdAndStatus(String studentId, SubmissionStatus status);

    /** All submissions by student, newest first */
    List<Submission> findByStudentIdOrderBySubmittedAtDesc(String studentId);

    // ─── Mentor Queries ──────────────────────────────────────
    /** All submissions assigned to a mentor (paginated) */
    Page<Submission> findByMentorId(String mentorId, Pageable pageable);

    /** Pending submissions assigned to a mentor */
    Page<Submission> findByMentorIdAndStatus(String mentorId, SubmissionStatus status, Pageable pageable);

    /** Count by mentor + status */
    long countByMentorIdAndStatus(String mentorId, SubmissionStatus status);

    // ─── Aggregation Queries ──────────────────────────────────
    /**
     * Sum of awarded credits for a student across all approved submissions.
     * Returns 0 if no approved submissions exist.
     * Frontend uses this for: getTotalCredits(studentId)
     */
    @Query("SELECT COALESCE(SUM(s.awardedCredits), 0) FROM Submission s " +
           "WHERE s.studentId = :studentId AND s.status = 'APPROVED'")
    Integer sumAwardedCreditsByStudentId(@Param("studentId") String studentId);

    /**
     * Sum of awarded credits for all students under a mentor.
     * Used by MentorDashboard to calculate totalCredits for the group.
     */
    @Query("SELECT COALESCE(SUM(s.awardedCredits), 0) FROM Submission s " +
           "WHERE s.mentorId = :mentorId AND s.status = 'APPROVED'")
    Integer sumAwardedCreditsByMentorId(@Param("mentorId") String mentorId);

    // ─── TODO: Add more aggregation / filter queries as needed ─
}
