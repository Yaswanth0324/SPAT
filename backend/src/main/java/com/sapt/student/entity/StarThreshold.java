package com.sapt.student.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * ============================================================
 * StarThreshold — Configurable Star Achievement Thresholds
 * ============================================================
 * Defines how many credits are required for each star level.
 * Used to compute the "stars" and "badge" fields in
 * StudentCreditSnapshot at recalculation time.
 *
 * Pre-seeded with 5 rows (IDs 1-5) on system startup.
 * System Admins can update min_credits values without code changes.
 *
 * Seeded data (matches DB INSERT):
 *   id=1, stars=1, min_credits=100,  badge="Bronze"
 *   id=2, stars=2, min_credits=250,  badge="Silver"
 *   id=3, stars=3, min_credits=500,  badge="Gold"
 *   id=4, stars=4, min_credits=1000, badge="Platinum"
 *   id=5, stars=5, min_credits=2000, badge="Diamond"
 *
 * Table: star_thresholds
 * ============================================================
 */
@Entity
@Table(name = "star_thresholds")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StarThreshold {

    /**
     * Fixed integer primary key (TINYINT UNSIGNED, values 1-5).
     * NOT auto-generated — pre-seeded by DataInitializer.
     */
    @Id
    @Column(columnDefinition = "TINYINT UNSIGNED")
    private Integer id;

    /**
     * Star level (1-5). Unique column.
     * 0-star students (below min threshold) are "Beginner".
     */
    @Column(nullable = false, unique = true, columnDefinition = "TINYINT UNSIGNED")
    private Integer stars;

    /**
     * Minimum cumulative credits to reach this star level.
     */
    @Column(name = "min_credits", nullable = false)
    private Integer minCredits;

    /**
     * Achievement badge name displayed in the UI.
     * e.g., "Bronze", "Silver", "Gold", "Platinum", "Diamond"
     */
    @Column(name = "badge_name", nullable = false, length = 50)
    private String badgeName;
}
