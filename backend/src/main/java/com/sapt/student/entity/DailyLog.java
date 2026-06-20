package com.sapt.student.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * ============================================================
 * DailyLog — Student Daily Activity Log Entry
 * ============================================================
 * Students add daily logs describing what they worked on.
 * Mentors can add a remark (mentor_remark) on any log.
 * There is NO approve/reject workflow — mentors just comment.
 *
 * student_id → users.id (STUDENT role user)
 * remarked_by → users.id (MENTOR role user who remarked)
 *
 * Table: daily_logs
 * ============================================================
 */
@Entity
@Table(
    name = "daily_logs",
    indexes = {
        @Index(name = "idx_logs_student",      columnList = "student_id"),
        @Index(name = "idx_logs_date",         columnList = "log_date"),
        @Index(name = "idx_logs_student_date", columnList = "student_id, log_date")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyLog {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false, columnDefinition = "CHAR(36)")
    private String id;

    // ─── Ownership ───────────────────────────────────────────
    /** FK → users.id (STUDENT role) */
    @Column(name = "student_id", nullable = false, columnDefinition = "CHAR(36)")
    private String studentId;

    // ─── Log Content ─────────────────────────────────────────
    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    /**
     * Optional URLs to articles, repos, or resources.
     * Multiple links stored as newline-separated text.
     */
    @Column(name = "reference_links", columnDefinition = "TEXT")
    private String referenceLinks;

    /** The date this log entry is for */
    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    // ─── Mentor Remark ────────────────────────────────────────
    /**
     * Mentor's comment/feedback on this log entry.
     * No approval workflow — mentors simply add a remark.
     */
    @Column(name = "mentor_remark", columnDefinition = "TEXT")
    private String mentorRemark;

    /**
     * FK → users.id (MENTOR role) — who wrote the remark.
     * null until a mentor comments.
     */
    @Column(name = "remarked_by", columnDefinition = "CHAR(36)")
    private String remarkedBy;

    /** When the mentor added the remark */
    @Column(name = "remarked_at")
    private LocalDateTime remarkedAt;

    // ─── Timestamps ──────────────────────────────────────────
    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
