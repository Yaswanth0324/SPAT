package com.sapt.submission.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

/**
 * ============================================================
 * ActivitySubType — Achievement Sub-Type within a Category
 * ============================================================
 * Each ActivityCategory has multiple sub-types (achievement levels)
 * with specific default point values.
 *
 * Example:
 *   Category: "Technical"
 *     Sub-types:
 *       - "Hackathon – International Level Winner"  → 100 pts
 *       - "Hackathon – National Level Winner"        →  80 pts
 *       - "Workshop / Training (> 2 days)"           →  20 pts
 *
 * Table: activity_sub_types
 * ============================================================
 */
@Entity
@Table(
    name = "activity_sub_types",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_subtype_label", columnNames = {"category_id", "label"})
    },
    indexes = {
        @Index(name = "idx_subtypes_category", columnList = "category_id")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivitySubType {

    @Id
    @UuidGenerator
    @Column(updatable = false, nullable = false, columnDefinition = "CHAR(36)")
    private String id;

    /** FK → activity_categories.id */
    @Column(name = "category_id", nullable = false, columnDefinition = "CHAR(36)")
    private String categoryId;

    /**
     * Display label shown in student submission form dropdown.
     * e.g., "Hackathon – National Level Winner"
     */
    @Column(nullable = false, length = 255)
    private String label;

    /**
     * Default credit points for this achievement type.
     * Shown as "suggested credits" to the student.
     * Mentor can override at review time.
     */
    @Column(nullable = false)
    @Builder.Default
    private int points = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;
}
