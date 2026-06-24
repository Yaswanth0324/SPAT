package com.sapt.student.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;

/**
 * ============================================================
 * StudentCreditSnapshot — Per-Student Credit Summary Table
 * ============================================================
 * Stores a running credit summary for each student.
 * ONE ROW PER STUDENT (student_id is UNIQUE).
 *
 * Recalculated by the service layer whenever a submission
 * status changes (approved / rejected).
 *
 * Used for:
 *  - Student dashboard "Total Credits" card
 *  - Leaderboard / ranking queries (ORDER BY total_credits DESC)
 *  - Star level display (stars column)
 *
 * Note: This is a SUMMARY table, NOT a history table.
 *       For credit history/timeline, query the submissions table
 *       (submissions WHERE student_id = ? AND status = 'APPROVED').
 *
 * Table: student_credit_snapshots
 * ============================================================
 */
@Entity
@Table(
    name = "student_credit_snapshots",
    indexes = {
        @Index(name = "idx_snapshots_credits", columnList = "total_credits"),
        @Index(name = "idx_snapshots_stars",   columnList = "stars")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentCreditSnapshot {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false, columnDefinition = "CHAR(36)")
    private String id;

    /**
     * FK → users.id (STUDENT role).
     * UNIQUE — exactly one snapshot row per student.
     */
    @Column(name = "student_id", nullable = false, unique = true, columnDefinition = "CHAR(36)")
    private String studentId;

    // ─── Credit Summary ───────────────────────────────────────
    /** Total awarded credits from all APPROVED submissions */
    @Column(name = "total_credits", nullable = false)
    @Builder.Default
    private int totalCredits = 0;

    /** Count of submissions with status = APPROVED */
    @Column(name = "total_approved", nullable = false)
    @Builder.Default
    private int totalApproved = 0;

    /** Count of submissions with status = REJECTED */
    @Column(name = "total_rejected", nullable = false)
    @Builder.Default
    private int totalRejected = 0;

    /** Count of submissions with status = PENDING */
    @Column(name = "total_pending", nullable = false)
    @Builder.Default
    private int totalPending = 0;

    // ─── Achievement Level ────────────────────────────────────
    /**
     * Current star level (0-5) based on total_credits.
     * Determined from star_thresholds table at recalculation time.
     *   0 stars → < 100 credits   → "Beginner"
     *   1 star  → 100-249 credits → "Bronze"
     *   2 stars → 250-499 credits → "Silver"
     *   3 stars → 500-999 credits → "Gold"
     *   4 stars → 1000-1999 creds → "Platinum"
     *   5 stars → ≥ 2000 credits  → "Diamond"
     */
    @Column(nullable = false)
    @Builder.Default
    private int stars = 0;

    /**
     * Badge name matching the star level.
     * e.g., "Beginner", "Bronze", "Silver", "Gold", "Platinum", "Diamond"
     */
    @Column(nullable = false, length = 50)
    @Builder.Default
    private String badge = "Beginner";

    /** When this snapshot was last recalculated */
    @Column(name = "last_calculated_at", nullable = false)
    @Builder.Default
    private LocalDateTime lastCalculatedAt = LocalDateTime.now();
}
