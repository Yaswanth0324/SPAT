package com.sapt.submission.entity;

import com.sapt.common.enums.SubmissionStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * ============================================================
 * Submission — Student Activity Point Submission Entity
 * ============================================================
 * The core domain object of the SPAT system.
 * A student submits an activity proof; the mentor reviews it
 * and awards credits if approved.
 *
 * FK References (all to users.id):
 *   student_id  → the STUDENT user who submitted
 *   mentor_id   → the MENTOR user reviewing this
 *
 * Category references:
 *   category_id → activity_categories.id (nullable FK)
 *   sub_type_id → activity_sub_types.id  (nullable FK)
 * Plus denormalized text copies (category_name, achievement_type)
 * that remain even if the category/sub-type is later deleted.
 *
 * Resubmission:
 *   is_resubmission = true when this is a revised submission
 *   parent_submission_id → references the original submission
 *
 * Constraint: if status = REJECTED then awarded_credits must = 0
 *
 * Table: submissions
 * ============================================================
 */
@Entity
@Table(
    name = "submissions",
    indexes = {
        @Index(name = "idx_submissions_student",        columnList = "student_id"),
        @Index(name = "idx_submissions_mentor",         columnList = "mentor_id"),
        @Index(name = "idx_submissions_status",         columnList = "status"),
        @Index(name = "idx_submissions_category",       columnList = "category_id"),
        @Index(name = "idx_submissions_date",           columnList = "activity_date"),
        @Index(name = "idx_submissions_submitted",      columnList = "submitted_at"),
        @Index(name = "idx_submissions_mentor_status",  columnList = "mentor_id, status"),
        @Index(name = "idx_submissions_student_status", columnList = "student_id, status")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Submission {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false, columnDefinition = "CHAR(36)")
    private String id;

    // ─── Ownership ───────────────────────────────────────────
    /** FK → users.id (STUDENT role) */
    @Column(name = "student_id", nullable = false, columnDefinition = "CHAR(36)")
    private String studentId;

    /** FK → users.id (MENTOR role) */
    @Column(name = "mentor_id", nullable = false, columnDefinition = "CHAR(36)")
    private String mentorId;

    /**
     * Denormalized student full name for display without JOIN.
     * Frontend accesses as: sub.studentName
     * Populated when submission is created.
     */
    @Column(name = "student_name", length = 255)
    private String studentName;

    // ─── Category Reference ───────────────────────────────────
    /** FK → activity_categories.id (nullable — SET NULL on delete) */
    @Column(name = "category_id", columnDefinition = "CHAR(36)")
    private String categoryId;

    /** FK → activity_sub_types.id (nullable — SET NULL on delete) */
    @Column(name = "sub_type_id", columnDefinition = "CHAR(36)")
    private String subTypeId;

    /**
     * Denormalized category name.
     * Remains even if the FK category is later deleted.
     */
    @Column(name = "category_name", nullable = false, length = 255)
    private String categoryName;

    /**
     * Denormalized achievement/sub-type label.
     * Remains even if the FK sub-type is later deleted.
     */
    @Column(name = "achievement_type", nullable = false, length = 255)
    private String achievementType;

    // ─── Activity Info ────────────────────────────────────────
    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "activity_date", nullable = false)
    private LocalDate activityDate;

    // ─── Credits ─────────────────────────────────────────────
    /** Points suggested by the student (from sub-type default) */
    @Column(name = "suggested_credits", nullable = false)
    @Builder.Default
    private int suggestedCredits = 0;

    /**
     * Points awarded by mentor on approval.
     * Must be 0 if status = REJECTED (enforced by DB CHECK constraint).
     */
    @Column(name = "awarded_credits", nullable = false)
    @Builder.Default
    private int awardedCredits = 0;

    // ─── Review ──────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private SubmissionStatus status = SubmissionStatus.PENDING;

    @Column(name = "review_text", columnDefinition = "TEXT")
    private String reviewText;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    // ─── Submission Tracking ──────────────────────────────────
    @Column(name = "submitted_at", nullable = false)
    @Builder.Default
    private LocalDateTime submittedAt = LocalDateTime.now();

    /**
     * true → this is a revised resubmission of a rejected submission.
     * parent_submission_id links back to the original.
     */
    @Column(name = "is_resubmission", nullable = false)
    @Builder.Default
    private boolean isResubmission = false;

    /**
     * Self-referencing FK → submissions.id.
     * Set when is_resubmission = true.
     */
    @Column(name = "parent_submission_id", columnDefinition = "CHAR(36)")
    private String parentSubmissionId;

    // ─── File Attachments ─────────────────────────────────────
    /**
     * Files stored in submission_files table (SubmissionFile entity).
     * Linked via SubmissionFile.submissionId.
     */

    // ─── Timestamps ──────────────────────────────────────────
    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
